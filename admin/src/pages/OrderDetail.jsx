import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { arrayUnion, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../lib/firebase'
import { STATUS_COLORS, STATUS_LABELS } from './Orders'

const CURRENCY_SYMBOL = import.meta.env.VITE_CURRENCY_SYMBOL || '₦'
const MANUAL_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled']

const toDateInputValue = (timestamp) => {
  const date = timestamp?.toDate?.()
  if (!date) return ''
  return date.toISOString().slice(0, 10)
}

const OrderDetail = () => {
  const { id } = useParams()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('')
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [refunding, setRefunding] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    const snap = await getDoc(doc(db, 'orders', id))
    if (snap.exists()) {
      const data = { id: snap.id, ...snap.data() }
      setOrder(data)
      setStatus(data.status ?? 'processing')
      setTrackingNumber(data.trackingNumber ?? '')
      setCarrier(data.carrier ?? '')
      setEstimatedDeliveryDate(toDateInputValue(data.estimatedDeliveryDate))
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [id])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const updates = {
        status,
        trackingNumber,
        carrier,
        estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : null,
        updatedAt: serverTimestamp(),
      }
      // Only append a history entry when the status actually changed —
      // otherwise saving tracking-number edits would spam the log.
      if (status !== order.status) {
        updates.statusHistory = arrayUnion({ status, at: new Date() })
      }
      await updateDoc(doc(db, 'orders', id), updates)
      setMessage('Order updated.')
      await load()
    } catch (err) {
      setError(err.message || 'Failed to update order.')
    } finally {
      setSaving(false)
    }
  }

  const handleRefund = async () => {
    if (!window.confirm('Refund this order via Paystack and restore stock? This cannot be undone.')) return

    setRefunding(true)
    setError('')
    setMessage('')
    try {
      const refund = httpsCallable(functions, 'refundOrder')
      await refund({ orderId: id })
      setMessage('Order refunded and stock restored.')
      await load()
    } catch (err) {
      setError(err.message || 'Refund failed.')
    } finally {
      setRefunding(false)
    }
  }

  if (loading) return <p className="text-white/40 font-['Space_Grotesk'] text-sm">Loading…</p>
  if (!order) return <p className="text-white/40 font-['Space_Grotesk'] text-sm">Order not found.</p>

  const createdAt = order.createdAt?.toDate?.()
  const dateStr = createdAt
    ? createdAt.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

  const history = [...(order.statusHistory ?? [])].sort(
    (a, b) => (a.at?.toMillis?.() ?? 0) - (b.at?.toMillis?.() ?? 0)
  )

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-white text-2xl">{order.reference}</h1>
          <p className={`font-['Space_Grotesk'] text-xs uppercase tracking-widest mt-1 ${STATUS_COLORS[order.status] ?? 'text-white/40'}`}>
            {STATUS_LABELS[order.status] ?? order.status}
          </p>
        </div>
        <Link to="/orders" className="text-white/40 hover:text-white font-['Space_Grotesk'] text-sm">
          ← Back to Orders
        </Link>
      </div>

      {message && (
        <div className="mb-6 px-4 py-3 border border-green-400/30 bg-green-400/10">
          <p className="text-green-400 font-['Space_Grotesk'] text-sm">{message}</p>
        </div>
      )}
      {error && (
        <div className="mb-6 px-4 py-3 border border-[#c81e1e]/40 bg-[#c81e1e]/10">
          <p className="text-[#c81e1e] font-['Space_Grotesk'] text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="card p-5">
          <h2 className="text-white/40 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-3">
            Customer
          </h2>
          <p className="text-white font-['Space_Grotesk'] text-sm">{order.shipping?.fullName}</p>
          <p className="text-white/60 font-['Space_Grotesk'] text-sm">{order.shipping?.email}</p>
          <p className="text-white/60 font-['Space_Grotesk'] text-sm">{order.shipping?.phone}</p>
          <p className="text-white/60 font-['Space_Grotesk'] text-sm mt-2">
            {order.shipping?.address}, {order.shipping?.city}, {order.shipping?.state}
          </p>
          <p className="text-white/40 font-['Space_Grotesk'] text-xs mt-1">{order.shipping?.region}</p>
        </div>

        <div className="card p-5">
          <h2 className="text-white/40 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-3">
            Payment
          </h2>
          <p className="text-white/60 font-['Space_Grotesk'] text-sm">Placed: {dateStr}</p>
          <p className="text-white/60 font-['Space_Grotesk'] text-sm">Paystack ID: {order.paystackId}</p>
          <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-1">
            <div className="flex justify-between text-white/50 font-['Space_Grotesk'] text-sm">
              <span>Subtotal</span>
              <span>{CURRENCY_SYMBOL}{Number(order.subtotal ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-white/50 font-['Space_Grotesk'] text-sm">
              <span>Shipping</span>
              <span>{CURRENCY_SYMBOL}{Number(order.shippingCost ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-white font-['Space_Grotesk'] text-sm font-semibold">
              <span>Total</span>
              <span>{CURRENCY_SYMBOL}{Number(order.total ?? 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5 mb-8">
        <h2 className="text-white/40 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-4">
          Items
        </h2>
        <div className="flex flex-col gap-3">
          {(order.items ?? []).map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <img src={item.image} alt={item.name} className="w-10 h-12 object-cover bg-white/5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-['Space_Grotesk'] text-sm truncate">
                  {item.name}
                  {item.isPreorder && (
                    <span className="ml-2 text-[#c81e1e] text-[10px] uppercase tracking-widest align-middle">Preorder</span>
                  )}
                </p>
                <p className="text-white/40 font-['Space_Grotesk'] text-xs">
                  {item.color ? `${item.color}, ` : ''}{item.size} × {item.quantity}
                </p>
              </div>
              <p className="text-white/60 font-['Space_Grotesk'] text-sm">
                {CURRENCY_SYMBOL}{(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave} className="card p-5 mb-6">
        <h2 className="text-white/40 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-4">
          Fulfillment
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
              Status
            </label>
            <select
              className="input-dark"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={order.status === 'refunded'}
            >
              {MANUAL_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-[#0a0a0a]">
                  {STATUS_LABELS[s]}
                </option>
              ))}
              {order.status === 'refunded' && (
                <option value="refunded" className="bg-[#0a0a0a]">{STATUS_LABELS.refunded}</option>
              )}
            </select>
          </div>
          <div>
            <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
              Estimated Delivery
            </label>
            <input
              type="date"
              className="input-dark"
              value={estimatedDeliveryDate}
              onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
              disabled={order.status === 'refunded'}
            />
          </div>
          <div>
            <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
              Carrier
            </label>
            <input
              type="text"
              className="input-dark"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              disabled={order.status === 'refunded'}
            />
          </div>
          <div>
            <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
              Tracking Number
            </label>
            <input
              type="text"
              className="input-dark"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              disabled={order.status === 'refunded'}
            />
          </div>
        </div>
        <button type="submit" disabled={saving || order.status === 'refunded'} className="btn-primary px-8 py-3">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      {history.length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="text-white/40 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-4">
            Status History
          </h2>
          <div className="flex flex-col gap-2">
            {history.map((entry, i) => {
              const at = entry.at?.toDate?.()
              const atStr = at
                ? at.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : '—'
              return (
                <div key={i} className="flex justify-between font-['Space_Grotesk'] text-sm">
                  <span className={STATUS_COLORS[entry.status] ?? 'text-white/60'}>
                    {STATUS_LABELS[entry.status] ?? entry.status}
                  </span>
                  <span className="text-white/40">{atStr}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="card p-5">
        <h2 className="text-white/40 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-3">
          Refund
        </h2>
        <p className="text-white/50 font-['Space_Grotesk'] text-sm mb-4">
          Refunds the full amount via Paystack and restores stock for each item. This cannot be undone.
        </p>
        <button
          onClick={handleRefund}
          disabled={refunding || order.status === 'refunded'}
          className="btn-outline px-8 py-3 hover:border-[#c81e1e]"
        >
          {refunding ? 'Refunding…' : order.status === 'refunded' ? 'Already Refunded' : 'Refund Order'}
        </button>
      </div>
    </div>
  )
}

export default OrderDetail
