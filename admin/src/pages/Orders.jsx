import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, limit, orderBy, query, startAfter } from 'firebase/firestore'
import { db } from '../lib/firebase'

const CURRENCY_SYMBOL = import.meta.env.VITE_CURRENCY_SYMBOL || '₦'
const PAGE_SIZE = 20

export const STATUS_COLORS = {
  processing: 'text-yellow-400',
  shipped: 'text-blue-400',
  delivered: 'text-green-400',
  cancelled: 'text-white/40',
  refunded: 'text-white/40',
}

export const STATUS_LABELS = {
  processing: 'Order Received',
  shipped: 'Order Sent Out',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

const STATUS_FILTERS = ['all', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

const orderMatchesSearch = (order, q) =>
  order.reference?.toLowerCase().includes(q) ||
  order.shipping?.fullName?.toLowerCase().includes(q) ||
  order.shipping?.email?.toLowerCase().includes(q)

const Orders = () => {
  // Default (no filter/search) view: paginated, cheap to load.
  const [pagedOrders, setPagedOrders] = useState([])
  const [lastDoc, setLastDoc] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [loadingPage, setLoadingPage] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Filtered/search view: fetches the full collection once, then filters
  // client-side — Firestore can't do partial-text search server-side.
  const [allOrders, setAllOrders] = useState(null)
  const [loadingAll, setLoadingAll] = useState(false)

  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const isFiltering = statusFilter !== 'all' || search.trim() !== ''

  const loadFirstPage = async () => {
    setLoadingPage(true)
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(PAGE_SIZE))
    const snap = await getDocs(q)
    setPagedOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    setLastDoc(snap.docs[snap.docs.length - 1] ?? null)
    setHasMore(snap.docs.length === PAGE_SIZE)
    setLoadingPage(false)
  }

  useEffect(() => {
    loadFirstPage()
  }, [])

  useEffect(() => {
    if (!isFiltering || allOrders !== null) return
    setLoadingAll(true)
    getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')))
      .then((snap) => setAllOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .finally(() => setLoadingAll(false))
  }, [isFiltering, allOrders])

  const handleLoadMore = async () => {
    if (!lastDoc) return
    setLoadingMore(true)
    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(PAGE_SIZE)
    )
    const snap = await getDocs(q)
    setPagedOrders((prev) => [...prev, ...snap.docs.map((d) => ({ id: d.id, ...d.data() }))])
    setLastDoc(snap.docs[snap.docs.length - 1] ?? null)
    setHasMore(snap.docs.length === PAGE_SIZE)
    setLoadingMore(false)
  }

  const filtered = useMemo(() => {
    if (!isFiltering) return pagedOrders
    if (!allOrders) return []

    const q = search.trim().toLowerCase()
    return allOrders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false
      if (q && !orderMatchesSearch(o, q)) return false
      return true
    })
  }, [isFiltering, pagedOrders, allOrders, statusFilter, search])

  const loading = isFiltering ? loadingAll && !allOrders : loadingPage

  return (
    <div>
      <h1 className="font-display text-white text-2xl mb-8">Orders</h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <input
          type="text"
          className="input-dark max-w-sm"
          placeholder="Search by reference, name, or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 font-['Space_Grotesk'] text-xs uppercase tracking-widest border ${
                statusFilter === s
                  ? 'border-[#c81e1e] text-[#c81e1e]'
                  : 'border-white/10 text-white/40 hover:text-white'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-white/40 font-['Space_Grotesk'] text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-white/40 font-['Space_Grotesk'] text-sm">No orders found.</p>
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-white/40 font-['Space_Grotesk'] text-xs uppercase tracking-widest">
                  <th className="p-4 font-normal">Reference</th>
                  <th className="p-4 font-normal">Customer</th>
                  <th className="p-4 font-normal">Date</th>
                  <th className="p-4 font-normal">Items</th>
                  <th className="p-4 font-normal">Total</th>
                  <th className="p-4 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const createdAt = order.createdAt?.toDate?.()
                  const dateStr = createdAt
                    ? createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'

                  return (
                    <tr
                      key={order.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/3 cursor-pointer"
                    >
                      <td className="p-0">
                        <Link to={`/orders/${order.id}`} className="block p-4 text-[#c81e1e] font-['Space_Grotesk'] text-sm">
                          {order.reference}
                        </Link>
                      </td>
                      <td className="p-4 text-white/70 font-['Space_Grotesk'] text-sm">
                        {order.shipping?.fullName ?? '—'}
                      </td>
                      <td className="p-4 text-white/50 font-['Space_Grotesk'] text-sm">{dateStr}</td>
                      <td className="p-4 text-white/50 font-['Space_Grotesk'] text-sm">
                        {order.items?.length ?? 0}
                      </td>
                      <td className="p-4 text-white font-['Space_Grotesk'] text-sm">
                        {CURRENCY_SYMBOL}{Number(order.total ?? 0).toLocaleString()}
                      </td>
                      <td className={`p-4 font-['Space_Grotesk'] text-xs uppercase tracking-widest ${STATUS_COLORS[order.status] ?? 'text-white/40'}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {!isFiltering && hasMore && (
            <div className="flex justify-center mt-6">
              <button onClick={handleLoadMore} disabled={loadingMore} className="btn-outline px-8 py-2">
                {loadingMore ? 'Loading…' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Orders
