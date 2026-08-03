// functions/verifyPayment — Firebase Cloud Function (callable)
//
// Called by the Checkout page after Paystack reports a successful payment.
// This function:
//   1. Verifies the transaction with Paystack's API (never trust client-side success alone)
//   2. Checks the paid amount matches the expected total
//   3. Uses a Firestore transaction to:
//      a. Decrement stock for each ordered item (fails atomically if stock is insufficient)
//      b. Create the order document
//   4. Returns the new order ID to the client
//
// Being a `callable` function, the Firebase client SDK automatically attaches
// the caller's ID token — `request.auth.uid` is verified server-side, so we
// no longer need to trust a client-supplied userId.

const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')

initializeApp()
const db = getFirestore()

const paystackSecretKey = defineSecret('PAYSTACK_SECRET_KEY')
const PAYSTACK_AMOUNT_MULTIPLIER = 100

exports.verifyPayment = onCall({ secrets: [paystackSecretKey] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in to complete checkout.')
  }
  const userId = request.auth.uid

  const { reference, cartItems, shippingDetails, shippingCost, subtotal, total } =
    request.data ?? {}

  if (!reference || !Array.isArray(cartItems) || !shippingDetails) {
    throw new HttpsError('invalid-argument', 'Missing required fields')
  }

  // ── Step 1: Verify payment with Paystack ─────────────────────────────────
  let paystackData
  try {
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${paystackSecretKey.value()}` } }
    )
    paystackData = await paystackRes.json()
  } catch (err) {
    console.error('[verifyPayment] Paystack request failed:', err)
    throw new HttpsError('unavailable', 'Could not reach payment provider')
  }

  if (!paystackData.status || paystackData.data?.status !== 'success') {
    throw new HttpsError('failed-precondition', 'Payment not successful')
  }

  // ── Step 2: Amount check (prevent price manipulation) ────────────────────
  // Paystack stores amount in smallest currency unit (kobo, cents, etc.)
  const expectedAmount = Math.round(Number(total) * PAYSTACK_AMOUNT_MULTIPLIER)

  if (paystackData.data.amount < expectedAmount) {
    console.error(
      `[verifyPayment] Amount mismatch: paid=${paystackData.data.amount}, expected=${expectedAmount}`
    )
    throw new HttpsError('failed-precondition', 'Payment amount does not match order total')
  }

  // ── Step 3: Firestore transaction — decrement stock + create order ────────
  try {
    const orderId = await db.runTransaction(async (transaction) => {
      // Check and decrement stock for each cart item
      for (const item of cartItems) {
        const productRef = db.collection('products').doc(String(item.productId))
        const productSnap = await transaction.get(productRef)

        if (!productSnap.exists) {
          throw new Error(`Product "${item.name}" no longer exists`)
        }

        const stock = productSnap.data().stock ?? {}
        const available = stock[item.size] ?? 0

        if (available < item.quantity) {
          throw new Error(
            `Insufficient stock for ${item.name} (${item.size}): ` +
              `${available} available, ${item.quantity} requested`
          )
        }

        transaction.update(productRef, {
          [`stock.${item.size}`]: FieldValue.increment(-item.quantity),
        })
      }

      // Create the order document
      const orderRef = db.collection('orders').doc()
      transaction.set(orderRef, {
        userId,
        reference,
        paystackId: paystackData.data.id,
        items: cartItems,
        shipping: shippingDetails,
        shippingCost: Number(shippingCost) || 0,
        subtotal: Number(subtotal) || 0,
        total: Number(total),
        currency: paystackData.data.currency,
        status: 'processing',
        // Firestore forbids FieldValue.serverTimestamp() inside array elements,
        // so history entries use a plain Date — accurate here since this runs
        // server-side in the Cloud Function itself.
        statusHistory: [{ status: 'processing', at: new Date() }],
        estimatedDeliveryDate: null,
        createdAt: FieldValue.serverTimestamp(),
      })

      return orderRef.id
    })

    return { orderId }
  } catch (err) {
    console.error('[verifyPayment] Transaction failed:', err.message)
    throw new HttpsError('internal', err.message || 'Order creation failed')
  }
})

// functions/refundOrder — Firebase Cloud Function (callable)
//
// Called by the admin app to refund an order. This function:
//   1. Requires the caller to have the `admin` custom claim
//   2. Looks up the order and refunds it via Paystack's API
//   3. Uses a Firestore transaction to:
//      a. Restore stock for each ordered item
//      b. Mark the order as refunded
exports.refundOrder = onCall({ secrets: [paystackSecretKey] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.')
  }
  if (request.auth.token.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Admin access required.')
  }

  const { orderId } = request.data ?? {}
  if (!orderId) {
    throw new HttpsError('invalid-argument', 'Missing required field: orderId')
  }

  const orderRef = db.collection('orders').doc(orderId)
  const orderSnap = await orderRef.get()
  if (!orderSnap.exists) {
    throw new HttpsError('not-found', 'Order not found')
  }

  const order = orderSnap.data()
  if (order.status === 'refunded') {
    throw new HttpsError('failed-precondition', 'Order has already been refunded')
  }

  // ── Step 1: Refund via Paystack ───────────────────────────────────────────
  let paystackData
  try {
    const paystackRes = await fetch('https://api.paystack.co/refund', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecretKey.value()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transaction: order.reference }),
    })
    paystackData = await paystackRes.json()
  } catch (err) {
    console.error('[refundOrder] Paystack request failed:', err)
    throw new HttpsError('unavailable', 'Could not reach payment provider')
  }

  if (!paystackData.status) {
    console.error('[refundOrder] Paystack refund failed:', paystackData.message)
    throw new HttpsError('failed-precondition', paystackData.message || 'Refund failed')
  }

  // ── Step 2: Firestore transaction — restore stock + mark refunded ─────────
  try {
    await db.runTransaction(async (transaction) => {
      // Reads must happen before writes in a Firestore transaction.
      const productRefs = (order.items ?? []).map((item) =>
        db.collection('products').doc(String(item.productId))
      )
      const productSnaps = await Promise.all(
        productRefs.map((ref) => transaction.get(ref))
      )

      productSnaps.forEach((snap, i) => {
        if (!snap.exists) return // product deleted since the order was placed — nothing to restore
        const item = order.items[i]
        transaction.update(productRefs[i], {
          [`stock.${item.size}`]: FieldValue.increment(item.quantity),
        })
      })

      transaction.update(orderRef, {
        status: 'refunded',
        refundedAt: FieldValue.serverTimestamp(),
        statusHistory: FieldValue.arrayUnion({ status: 'refunded', at: new Date() }),
      })
    })

    return { success: true }
  } catch (err) {
    console.error('[refundOrder] Transaction failed:', err.message)
    throw new HttpsError('internal', err.message || 'Failed to update order/stock after refund')
  }
})
