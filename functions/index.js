// functions/verifyPayment — Firebase Cloud Function (callable)
//
// Called by the Checkout page after Paystack reports a successful payment.
// This function:
//   1. Verifies the transaction with Paystack's API (never trust client-side success alone)
//   2. Uses a Firestore transaction to:
//      a. Decrement stock for each ordered item (fails atomically if stock is
//         insufficient, except for preorder products, which are exempt)
//      b. Recompute subtotal/shipping/total from Firestore's own product prices and
//         the shipping-rate table — never from client-supplied amounts — and check
//         the Paystack-paid amount against that (prevents price tampering)
//      c. Create the order document, with item prices taken from the catalog
//   3. Returns the new order ID to the client
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

// Mirrors src/lib/shipping.js SHIPPING_RATES/FREE_SHIPPING_THRESHOLD. Cloud
// Functions can't import that file directly (it reads import.meta.env, which
// only exists in the Vite client build) — if you change rates there, change
// them here too. This copy is what verifyPayment actually charges against.
const SHIPPING_RATES = {
  'Lagos': 2500,
  'Ibadan': 3500,
  'Osun': 4000,
  'Akure': 4000,
  'Other Nigeria': 6000,
}
const FREE_SHIPPING_THRESHOLD = Infinity

const shippingCostFor = (region, subtotal) => {
  if (!region) return 0
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0
  return SHIPPING_RATES[region] ?? SHIPPING_RATES['Other Nigeria'] ?? 0
}

// Stock is keyed by size alone for single-color products, or "color|size"
// for products with color variants.
const stockKeyFor = (item) => (item.color ? `${item.color}|${item.size}` : item.size)

const describeStockKey = (key) => {
  const [color, size] = key.split('|')
  return size ? `${color} / ${size}` : color
}

// Groups cart/order items by product, merging quantities per stock key.
// Firestore transactions only allow ONE write per document, so if the same
// product appears more than once (e.g. two different sizes or colors of the
// same item), all of its stock changes must land in a single update() call.
const groupByProduct = (items) => {
  const byProduct = new Map()
  for (const item of items) {
    const productId = String(item.productId)
    if (!byProduct.has(productId)) {
      byProduct.set(productId, {
        ref: db.collection('products').doc(productId),
        name: item.name,
        quantities: new Map(),
      })
    }
    const key = stockKeyFor(item)
    const entry = byProduct.get(productId)
    entry.quantities.set(key, (entry.quantities.get(key) ?? 0) + item.quantity)
  }
  return [...byProduct.values()]
}

// Refunds a Paystack transaction by reference. Used both when an admin
// refunds a completed order and when verifyPayment must undo a charge whose
// order was never created (e.g. a stock check failed after payment cleared).
const refundPaystackTransaction = async (reference, secretKey) => {
  const res = await fetch('https://api.paystack.co/refund', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transaction: reference }),
  })
  return res.json()
}

exports.verifyPayment = onCall({ secrets: [paystackSecretKey] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in to complete checkout.')
  }
  const userId = request.auth.uid

  const { reference, cartItems, shippingDetails } = request.data ?? {}

  if (!reference || !Array.isArray(cartItems) || cartItems.length === 0 || !shippingDetails) {
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

  // ── Step 2 & 3: Firestore transaction — price/amount check, stock, order ──
  // The amount check happens *inside* the transaction, priced from Firestore's
  // own product docs — never from client-supplied cartItems/subtotal/total.
  // Those are only trustworthy for which product/size/color/qty was ordered;
  // a tampered client could otherwise pay pennies for a full-price cart by
  // just lying about the total. A failure here throws a plain Error so it
  // falls into the catch block below and triggers an auto-refund, same as an
  // insufficient-stock failure.
  try {
    const orderId = await db.runTransaction(async (transaction) => {
      // Group cart items by product (merging quantities per stock key) so each
      // product gets exactly one read and one write, regardless of how many
      // different sizes/colors of it are in the cart.
      const productEntries = groupByProduct(cartItems)
      const productSnaps = await Promise.all(productEntries.map((e) => transaction.get(e.ref)))

      let serverSubtotal = 0
      const catalogPriceByProductId = new Map()
      const catalogPreorderByProductId = new Map()

      productEntries.forEach((entry, i) => {
        const snap = productSnaps[i]
        if (!snap.exists) {
          throw new Error(`Product "${entry.name}" no longer exists`)
        }

        const data = snap.data()
        const unitPrice = Number(data.price) || 0
        const isPreorder = data.preorder === true
        catalogPriceByProductId.set(snap.id, unitPrice)
        catalogPreorderByProductId.set(snap.id, isPreorder
          ? { isPreorder: true, preorderReleaseDate: data.preorderReleaseDate ?? null }
          : { isPreorder: false, preorderReleaseDate: null })

        const stock = data.stock ?? {}
        const updates = {}
        for (const [key, qty] of entry.quantities) {
          // Preorder products (per the catalog, never the client) are exempt
          // from the availability check — they can be ordered ahead of stock
          // existing. Stock still decrements (and can go negative) so the
          // admin can see how many units of a preorder have been sold.
          if (!isPreorder) {
            const available = stock[key] ?? 0
            if (available < qty) {
              throw new Error(
                `Insufficient stock for ${entry.name} (${describeStockKey(key)}): ` +
                  `${available} available, ${qty} requested`
              )
            }
          }
          updates[`stock.${key}`] = FieldValue.increment(-qty)
          serverSubtotal += unitPrice * qty
        }
        transaction.update(entry.ref, updates)
      })

      const serverShippingCost = shippingCostFor(shippingDetails.region, serverSubtotal)
      const serverTotal = serverSubtotal + serverShippingCost

      // Paystack stores amount in smallest currency unit (kobo, cents, etc.)
      const expectedAmount = Math.round(serverTotal * PAYSTACK_AMOUNT_MULTIPLIER)
      if (paystackData.data.amount < expectedAmount) {
        console.error(
          `[verifyPayment] Amount mismatch: paid=${paystackData.data.amount}, expected=${expectedAmount}`
        )
        throw new Error('Payment amount does not match the order total.')
      }

      // Trust catalog prices (and preorder status), not client-supplied ones,
      // in the stored record.
      const verifiedItems = cartItems.map((item) => {
        const preorderInfo = catalogPreorderByProductId.get(String(item.productId)) ?? {
          isPreorder: false,
          preorderReleaseDate: null,
        }
        return {
          ...item,
          price: catalogPriceByProductId.get(String(item.productId)) ?? (Number(item.price) || 0),
          ...preorderInfo,
        }
      })

      // Create the order document
      const orderRef = db.collection('orders').doc()
      transaction.set(orderRef, {
        userId,
        reference,
        paystackId: paystackData.data.id,
        items: verifiedItems,
        shipping: shippingDetails,
        shippingCost: serverShippingCost,
        subtotal: serverSubtotal,
        total: serverTotal,
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

    // Paystack already captured this payment but no order was created —
    // refund automatically so the customer isn't charged for nothing.
    let refundData
    try {
      refundData = await refundPaystackTransaction(reference, paystackSecretKey.value())
    } catch (refundErr) {
      console.error('[verifyPayment] Auto-refund request failed:', refundErr)
    }

    if (refundData?.status) {
      throw new HttpsError(
        'internal',
        `${err.message} Your payment has been automatically refunded and should reflect within a few business days.`
      )
    }

    console.error('[verifyPayment] Auto-refund failed:', refundData?.message)
    throw new HttpsError(
      'internal',
      `${err.message} We could NOT automatically refund your payment — please contact support with reference ${reference}.`
    )
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
    paystackData = await refundPaystackTransaction(order.reference, paystackSecretKey.value())
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
      // Same grouping as verifyPayment: one read + one write per product, even
      // if the order has multiple sizes/colors of the same item.
      const productEntries = groupByProduct(order.items ?? [])
      const productSnaps = await Promise.all(productEntries.map((e) => transaction.get(e.ref)))

      productEntries.forEach((entry, i) => {
        if (!productSnaps[i].exists) return // product deleted since the order was placed — nothing to restore
        const updates = {}
        for (const [key, qty] of entry.quantities) {
          updates[`stock.${key}`] = FieldValue.increment(qty)
        }
        transaction.update(entry.ref, updates)
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
