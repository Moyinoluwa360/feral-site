import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { doc, getDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { FiArrowLeft, FiAlertTriangle } from 'react-icons/fi'
import { db, functions } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import {
  CURRENCY,
  CURRENCY_SYMBOL,
  SHIPPING_REGIONS,
  PAYSTACK_AMOUNT_MULTIPLIER,
  calculateShipping,
} from '../lib/shipping'
import GlitchText from '../components/GlitchText'
import SEOHead from '../components/SEOHead'

// ─── Load Paystack inline script once ────────────────────────────────────────
function usePaystack() {
  const [ready, setReady] = useState(!!window.PaystackPop)

  useEffect(() => {
    if (window.PaystackPop) { setReady(true); return }

    const existing = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')
    if (existing) {
      existing.addEventListener('load', () => setReady(true))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    script.onload = () => setReady(true)
    document.head.appendChild(script)
  }, [])

  return ready
}

const INITIAL_FORM = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  region: '',
}

const Checkout = () => {
  const { currentUser } = useAuth()
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const paystackReady = usePaystack()

  const [form, setForm] = useState(INITIAL_FORM)
  const [stockErrors, setStockErrors] = useState([])
  const [paymentError, setPaymentError] = useState('')
  const [validating, setValidating] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const shipping = calculateShipping(form.region, subtotal)
  const total = subtotal + shipping

  // Redirect to cart if cart is empty — but not right after we've just
  // placed an order, since clearCart() also empties it and would otherwise
  // bounce the user to /cart instead of /order-confirmation/:id.
  const orderPlacedRef = useRef(false)
  useEffect(() => {
    if (items.length === 0 && !orderPlacedRef.current) navigate('/cart', { replace: true })
  }, [items, navigate])

  // Pre-fill email from auth
  useEffect(() => {
    if (currentUser?.email) {
      setForm((f) => ({ ...f, email: currentUser.email }))
    }
    if (currentUser?.displayName) {
      setForm((f) => ({ ...f, fullName: currentUser.displayName }))
    }
  }, [currentUser])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setPaymentError('')
  }

  // ── Stock validation before opening Paystack ──────────────────────────────
  // Preorder products (per the catalog itself, not the client-held cart item)
  // skip the availability check — they can be ordered ahead of stock existing.
  const validateStock = useCallback(async () => {
    const errors = []
    for (const item of items) {
      try {
        const snap = await getDoc(doc(db, 'products', String(item.product.id)))
        if (!snap.exists()) {
          errors.push(`${item.product.name} is no longer available.`)
          continue
        }
        const data = snap.data()
        if (data.preorder) continue

        const stock = data.stock ?? {}
        const stockKey = item.color ? `${item.color}|${item.size}` : item.size
        const available = stock[stockKey] ?? 0
        if (available < item.quantity) {
          errors.push(
            `${item.product.name} (${item.color ? `${item.color}, ` : ''}${item.size}): only ${available} in stock.`
          )
        }
      } catch {
        errors.push(`Could not verify stock for ${item.product.name}.`)
      }
    }
    return errors
  }, [items])

  const hasPreorderItems = items.some((item) => item.product.preorder)

  // ── Verify payment with backend after Paystack callback fires ─────────────
  const verifyPayment = async (response) => {
    setVerifying(true)
    try {
      // subtotal/shippingCost/total are NOT sent here — verifyPayment recomputes
      // them itself from Firestore product prices and the shipping-rate table,
      // so a tampered client can't talk it into charging less than the real total.
      const verify = httpsCallable(functions, 'verifyPayment')
      const result = await verify({
        reference: response.reference,
        cartItems: items.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          image: item.product.images?.[0] ?? '',
          size: item.size,
          color: item.color ?? null,
          quantity: item.quantity,
        })),
        shippingDetails: form,
      })
      const { orderId } = result.data ?? {}
      if (orderId) {
        orderPlacedRef.current = true
        clearCart()
        navigate(`/order-confirmation/${orderId}`, { state: { justPlaced: true } })
      } else {
        setPaymentError(
          `Payment received but order creation failed. Keep your reference: ${response.reference}`
        )
      }
    } catch (err) {
      setPaymentError(
        err.message ||
          `Verification failed. Save your reference number: ${response.reference} and contact support.`
      )
    } finally {
      setVerifying(false)
    }
  }

  // ── Paystack payment handler ──────────────────────────────────────────────
  const handlePay = async (e) => {
    e.preventDefault()
    setPaymentError('')
    setStockErrors([])

    // Validate form
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'region']
    for (const key of required) {
      if (!form[key].trim()) {
        setPaymentError('Please fill in all shipping fields.')
        return
      }
    }

    setValidating(true)
    const errors = await validateStock()
    setValidating(false)

    if (errors.length > 0) {
      setStockErrors(errors)
      return
    }

    if (!paystackReady || !window.PaystackPop) {
      setPaymentError('Payment provider not loaded. Please refresh and try again.')
      return
    }

    const reference = `FERAL-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
    const amountInSmallestUnit = Math.round(total * PAYSTACK_AMOUNT_MULTIPLIER)

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: form.email,
      amount: amountInSmallestUnit,
      currency: CURRENCY,
      ref: reference,
      metadata: {
        custom_fields: [
          { display_name: 'Customer Name', variable_name: 'customer_name', value: form.fullName },
          { display_name: 'Phone', variable_name: 'phone', value: form.phone },
        ],
      },
      // Paystack's validator rejects `async` functions here (it checks
      // fn.constructor === Function, which is false for AsyncFunction) —
      // keep this synchronous and delegate to an async helper.
      callback: (response) => {
        verifyPayment(response)
      },
      onClose: () => {
        setPaymentError('Payment window closed. You can try again.')
      },
    })

    handler.openIframe()
  }

  if (verifying) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen pt-16 flex items-center justify-center flex-col gap-6 px-4">
        <div className="w-10 h-10 border-2 border-white/10 border-t-[#c81e1e] rounded-full animate-spin" />
        <p className="text-white/40 font-['Space_Grotesk'] text-sm uppercase tracking-widest">
          Verifying payment…
        </p>
      </div>
    )
  }

  return (
    <>
      <SEOHead title="Checkout" path="/checkout" />

      <div className="bg-[#0a0a0a] min-h-screen pt-16">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12">
          {/* Back */}
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-white/30 font-['Space_Grotesk'] text-xs uppercase tracking-widest hover:text-[#c81e1e] transition-colors mb-10"
          >
            <FiArrowLeft size={14} />
            Back to Cart
          </Link>

          <div className="mb-10 border-b border-white/10 pb-8">
            <GlitchText
              as="h1"
              className="text-white"
              style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', display: 'block', lineHeight: 1 }}
            >
              CHECKOUT
            </GlitchText>
          </div>

          {/* Error alerts */}
          {stockErrors.length > 0 && (
            <div className="mb-8 px-4 py-4 border border-[#c81e1e]/40 bg-[#c81e1e]/10">
              <div className="flex items-start gap-3">
                <FiAlertTriangle className="text-[#c81e1e] flex-shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-[#c81e1e] font-['Space_Grotesk'] text-sm font-semibold mb-1">
                    Stock issue:
                  </p>
                  {stockErrors.map((e, i) => (
                    <p key={i} className="text-[#c81e1e]/80 font-['Space_Grotesk'] text-sm">
                      {e}
                    </p>
                  ))}
                  <Link to="/cart" className="text-white/50 font-['Space_Grotesk'] text-xs mt-2 block hover:text-white">
                    Update your cart →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {paymentError && (
            <div className="mb-8 px-4 py-3 border border-[#c81e1e]/40 bg-[#c81e1e]/10">
              <p className="text-[#c81e1e] font-['Space_Grotesk'] text-sm">{paymentError}</p>
            </div>
          )}

          {hasPreorderItems && (
            <div className="mb-8 px-4 py-3 border border-white/15 bg-white/3">
              <p className="text-white/60 font-['Space_Grotesk'] text-sm">
                Your cart includes preorder item(s). You'll be charged in full today; preorder items ship once they arrive in stock.
              </p>
            </div>
          )}

          <form onSubmit={handlePay}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* ── Shipping Form ── */}
              <div className="lg:col-span-2">
                <h2
                  className="text-white text-xl uppercase tracking-widest mb-6 pb-4 border-b border-white/10"
                  style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
                >
                  Shipping Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      className="input-dark"
                      placeholder="Your full name"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                    />
                  </div>

                  <div>
                    <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="input-dark"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="input-dark"
                      placeholder="+234 800 000 0000"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      autoComplete="tel"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      className="input-dark"
                      placeholder="Street address"
                      value={form.address}
                      onChange={handleChange}
                      required
                      autoComplete="street-address"
                    />
                  </div>

                  <div>
                    <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      className="input-dark"
                      placeholder="City"
                      value={form.city}
                      onChange={handleChange}
                      required
                      autoComplete="address-level2"
                    />
                  </div>

                  <div>
                    <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
                      State / Province *
                    </label>
                    <input
                      type="text"
                      name="state"
                      className="input-dark"
                      placeholder="State"
                      value={form.state}
                      onChange={handleChange}
                      required
                      autoComplete="address-level1"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
                      Shipping Region *
                    </label>
                    <div className="relative">
                      <select
                        name="region"
                        value={form.region}
                        onChange={handleChange}
                        className="input-dark appearance-none pr-10 cursor-pointer"
                        required
                      >
                        <option value="" disabled className="bg-[#0a0a0a]">
                          Please select a region
                        </option>
                        {SHIPPING_REGIONS.map((r) => (
                          <option key={r} value={r} className="bg-[#0a0a0a]">
                            {r}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-xs">
                        ▼
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Order Summary ── */}
              <div className="lg:col-span-1">
                <div
                  className="bg-white/3 border border-white/10 p-6 sticky top-24"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}
                >
                  <h2
                    className="text-white text-xl uppercase tracking-widest mb-6 pb-4 border-b border-white/10"
                    style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
                  >
                    Order Summary
                  </h2>

                  <div className="flex flex-col gap-3 mb-6">
                    {items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.size}-${item.color ?? ''}`}
                        className="flex items-start gap-3"
                      >
                        <img
                          src={item.product.images?.[0]}
                          alt={item.product.name}
                          className="w-12 h-14 object-cover flex-shrink-0 opacity-70"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-white text-xs uppercase tracking-wider truncate"
                            style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
                          >
                            {item.product.name}
                            {item.product.preorder && (
                              <span className="ml-2 text-[#c81e1e] text-[10px] align-middle">Preorder</span>
                            )}
                          </p>
                          <p className="text-white/40 font-['Space_Grotesk'] text-xs">
                            {item.color ? `${item.color}, ` : ''}{item.size} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-white/70 font-['Space_Grotesk'] text-xs flex-shrink-0">
                          {CURRENCY_SYMBOL}{(item.product.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/10 pt-4 flex flex-col gap-2 mb-6">
                    <div className="flex justify-between">
                      <span className="text-white/50 font-['Space_Grotesk'] text-sm">Subtotal</span>
                      <span className="text-white font-['Space_Grotesk'] text-sm font-semibold">
                        {CURRENCY_SYMBOL}{subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40 font-['Space_Grotesk'] text-xs">
                        Shipping{form.region ? ` (${form.region})` : ''}
                      </span>
                      <span className="text-white/60 font-['Space_Grotesk'] text-xs">
                        {!form.region
                          ? 'Select a region'
                          : shipping === 0
                          ? 'FREE'
                          : `${CURRENCY_SYMBOL}${shipping.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex justify-between mt-2 pt-3 border-t border-white/10">
                      <span className="text-white font-['Space_Grotesk'] text-sm font-bold uppercase tracking-wider">
                        Total
                      </span>
                      <span className="text-[#c81e1e] font-['Space_Grotesk'] text-base font-bold">
                        {CURRENCY_SYMBOL}{total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={validating || !paystackReady}
                    className="btn-primary w-full text-sm py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
                  >
                    {validating
                      ? 'VALIDATING…'
                      : !paystackReady
                      ? 'LOADING…'
                      : `PAY ${CURRENCY_SYMBOL}${total.toLocaleString()}`}
                  </button>

                  <p className="text-white/20 font-['Space_Grotesk'] text-[11px] text-center mt-4">
                    Secured by Paystack. Test mode active.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default Checkout
