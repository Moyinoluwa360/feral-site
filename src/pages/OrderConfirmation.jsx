import { Fragment, useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { doc, getDoc } from 'firebase/firestore'
import { FiCheck } from 'react-icons/fi'
import { db } from '../lib/firebase'
import { CURRENCY_SYMBOL } from '../lib/shipping'
import GlitchText from '../components/GlitchText'
import SEOHead from '../components/SEOHead'

const STATUS_LABELS = {
  processing: 'Order Received',
  shipped: 'Order Sent Out',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

const STEP_ORDER = ['processing', 'shipped', 'delivered']

const findHistoryDate = (statusHistory, status) =>
  statusHistory?.find((h) => h.status === status)?.at?.toDate?.() ?? null

// Shows either the linear Received -> Sent Out -> Delivered progress, or —
// for the two exception paths that don't fit a forward-moving timeline — a
// plain banner explaining what happened.
const OrderStepper = ({ order }) => {
  if (order.status === 'cancelled' || order.status === 'refunded') {
    return (
      <div className="border border-white/10 bg-white/3 px-6 py-5 text-center mb-14">
        <p className="text-white/70 font-['Space_Grotesk'] text-sm uppercase tracking-widest">
          {STATUS_LABELS[order.status]}
        </p>
        <p className="text-white/40 font-['Space_Grotesk'] text-xs mt-2">
          {order.status === 'refunded'
            ? 'This order was refunded — the amount has been returned to your original payment method.'
            : 'This order was cancelled.'}
        </p>
      </div>
    )
  }

  const currentIndex = STEP_ORDER.indexOf(order.status)

  return (
    <div className="mb-14">
      <div className="flex items-start justify-center">
        {STEP_ORDER.map((step, i) => {
          const completed = i < currentIndex
          const current = i === currentIndex
          const date =
            findHistoryDate(order.statusHistory, step) ??
            (step === 'processing' ? order.createdAt?.toDate?.() : null)

          return (
            <Fragment key={step}>
              <div className="flex flex-col items-center text-center w-28 flex-shrink-0">
                <div
                  className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                    completed || current
                      ? 'bg-[#c81e1e] text-white'
                      : 'bg-white/5 text-white/30 border border-white/10'
                  }`}
                >
                  {completed ? <FiCheck size={14} /> : <span className="text-xs">{i + 1}</span>}
                </div>
                <p
                  className={`mt-3 font-['Space_Grotesk'] text-xs uppercase tracking-widest ${
                    current ? 'text-white' : completed ? 'text-white/60' : 'text-white/30'
                  }`}
                >
                  {STATUS_LABELS[step]}
                </p>
                {date && (
                  <p className="text-white/30 font-['Space_Grotesk'] text-[11px] mt-1">
                    {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </p>
                )}
              </div>

              {i < STEP_ORDER.length - 1 && (
                <div
                  className={`h-px w-12 sm:w-24 mt-4 flex-shrink-0 ${
                    i < currentIndex ? 'bg-[#c81e1e]' : 'bg-white/10'
                  }`}
                />
              )}
            </Fragment>
          )
        })}
      </div>

      {order.estimatedDeliveryDate?.toDate && order.status !== 'delivered' && (
        <p className="text-center text-white/40 font-['Space_Grotesk'] text-xs mt-8">
          Estimated delivery:{' '}
          {order.estimatedDeliveryDate.toDate().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      )}

      {order.trackingNumber && (
        <p className="text-center text-white/40 font-['Space_Grotesk'] text-xs mt-2">
          {order.carrier ? `${order.carrier} · ` : ''}Tracking: {order.trackingNumber}
        </p>
      )}
    </div>
  )
}

const OrderConfirmation = () => {
  const { orderId } = useParams()
  const location = useLocation()
  const justPlaced = Boolean(location.state?.justPlaced)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!orderId) { setLoading(false); setError(true); return }

    getDoc(doc(db, 'orders', orderId))
      .then((snap) => {
        if (snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() })
        } else {
          setError(true)
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen pt-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-[#c81e1e] rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen pt-16 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white/20 font-['Space_Grotesk'] text-sm mb-4">Order not found.</p>
          <Link to="/shop" className="btn-primary text-sm">Continue Shopping</Link>
        </div>
      </div>
    )
  }

  const createdAt = order.createdAt?.toDate?.()
  const dateStr = createdAt
    ? createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  return (
    <>
      <SEOHead title={justPlaced ? 'Order Confirmed' : 'Order Details'} path={`/order-confirmation/${orderId}`} />

      <div className="bg-[#0a0a0a] min-h-screen pt-16">
        <div className="max-w-screen-lg mx-auto px-4 md:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            {justPlaced && (
              <div
                className="w-20 h-20 bg-[#c81e1e] flex items-center justify-center mx-auto mb-8"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
              >
                <FiCheck size={36} className="text-white" />
              </div>
            )}

            <GlitchText
              as="h1"
              className="text-white mb-3"
              style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', display: 'block', lineHeight: 1 }}
            >
              {justPlaced ? 'ORDER CONFIRMED' : 'ORDER DETAILS'}
            </GlitchText>

            <p className="text-[#c81e1e] font-['Big_Shoulders_Stencil'] font-bold text-sm uppercase tracking-[0.3em] mb-3">
              {order.reference}
            </p>

            <p className="text-white/40 font-['Space_Grotesk'] text-sm">
              {dateStr}
            </p>
          </motion.div>

          <OrderStepper order={order} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Order items */}
            <div className="lg:col-span-2">
              <h2
                className="text-white text-lg uppercase tracking-widest mb-5 pb-3 border-b border-white/10"
                style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
              >
                Items Ordered
              </h2>

              <div className="flex flex-col gap-4">
                {order.items?.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 bg-white/3 border border-white/8 p-4"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-20 object-cover flex-shrink-0 opacity-80"
                        loading="lazy"
                      />
                    )}
                    <div className="flex-1">
                      <p
                        className="text-white text-sm uppercase tracking-wider"
                        style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
                      >
                        {item.name}
                      </p>
                      <p className="text-white/40 font-['Space_Grotesk'] text-xs mt-1">
                        Size: {item.size} · Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-white font-['Space_Grotesk'] text-sm font-semibold">
                      {CURRENCY_SYMBOL}{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Shipping details */}
              <div className="mt-10">
                <h2
                  className="text-white text-lg uppercase tracking-widest mb-5 pb-3 border-b border-white/10"
                  style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
                >
                  Shipping To
                </h2>
                {order.shipping && (
                  <div className="text-white/50 font-['Space_Grotesk'] text-sm leading-relaxed">
                    <p className="text-white/80">{order.shipping.fullName}</p>
                    <p>{order.shipping.address}</p>
                    <p>{order.shipping.city}, {order.shipping.state}</p>
                    <p>{order.shipping.region}</p>
                    <p className="mt-1">{order.shipping.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary sidebar */}
            <div className="lg:col-span-1">
              <div
                className="bg-white/3 border border-white/10 p-6"
                style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}
              >
                <h2
                  className="text-white text-lg uppercase tracking-widest mb-5 pb-3 border-b border-white/10"
                  style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
                >
                  Summary
                </h2>

                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/50 font-['Space_Grotesk']">Subtotal</span>
                    <span className="text-white font-['Space_Grotesk']">
                      {CURRENCY_SYMBOL}{order.subtotal?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40 font-['Space_Grotesk'] text-xs">Shipping</span>
                    <span className="text-white/60 font-['Space_Grotesk'] text-xs">
                      {order.shippingCost === 0 ? 'FREE' : `${CURRENCY_SYMBOL}${order.shippingCost?.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between mt-3 pt-3 border-t border-white/10">
                    <span className="text-white font-['Space_Grotesk'] font-bold">Total</span>
                    <span className="text-[#c81e1e] font-['Space_Grotesk'] font-bold">
                      {CURRENCY_SYMBOL}{order.total?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-6">
                <Link to="/orders" className="btn-outline text-sm w-full text-center">
                  View My Orders
                </Link>
                <Link to="/shop" className="btn-primary text-sm w-full text-center">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderConfirmation
