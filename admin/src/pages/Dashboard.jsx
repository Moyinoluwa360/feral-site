import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'

const CURRENCY_SYMBOL = import.meta.env.VITE_CURRENCY_SYMBOL || '₦'
const LOW_STOCK_THRESHOLD = 5

const totalStock = (stock = {}) =>
  Object.values(stock).reduce((sum, n) => sum + (Number(n) || 0), 0)

const StatCard = ({ label, value }) => (
  <div className="card p-5">
    <p className="text-white/40 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">{label}</p>
    <p className="font-display text-white text-2xl">{value}</p>
  </div>
)

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    revenue: 0,
    orderCount: 0,
    avgOrderValue: 0,
    topProducts: [],
    lowStock: [],
  })

  useEffect(() => {
    const load = async () => {
      const [ordersSnap, productsSnap] = await Promise.all([
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'products')),
      ])

      const orders = ordersSnap.docs.map((d) => d.data())
      const products = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

      // Refunded orders don't count toward revenue — the money went back out.
      const countedOrders = orders.filter((o) => o.status !== 'refunded')
      const revenue = countedOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)

      const quantityByProduct = new Map()
      for (const order of countedOrders) {
        for (const item of order.items ?? []) {
          const key = item.productId
          quantityByProduct.set(key, {
            name: item.name,
            quantity: (quantityByProduct.get(key)?.quantity ?? 0) + item.quantity,
          })
        }
      }
      const topProducts = [...quantityByProduct.entries()]
        .map(([productId, v]) => ({ productId, ...v }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)

      const lowStock = products
        .map((p) => ({ id: p.id, name: p.name, stock: totalStock(p.stock) }))
        .filter((p) => p.stock <= LOW_STOCK_THRESHOLD)
        .sort((a, b) => a.stock - b.stock)

      setStats({
        revenue,
        orderCount: countedOrders.length,
        avgOrderValue: countedOrders.length ? revenue / countedOrders.length : 0,
        topProducts,
        lowStock,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p className="text-white/40 font-['Space_Grotesk'] text-sm">Loading…</p>

  return (
    <div>
      <h1 className="font-display text-white text-2xl mb-8">Dashboard</h1>

      <div className="grid grid-cols-3 gap-5 mb-10">
        <StatCard label="Revenue" value={`${CURRENCY_SYMBOL}${stats.revenue.toLocaleString()}`} />
        <StatCard label="Orders" value={stats.orderCount} />
        <StatCard
          label="Avg. Order Value"
          value={`${CURRENCY_SYMBOL}${Math.round(stats.avgOrderValue).toLocaleString()}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-white/40 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-4">
            Top-Selling Products
          </h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-white/40 font-['Space_Grotesk'] text-sm">No sales yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.topProducts.map((p) => (
                <Link
                  key={p.productId}
                  to={`/products/${p.productId}/edit`}
                  className="flex justify-between text-sm font-['Space_Grotesk'] text-white/70 hover:text-white"
                >
                  <span>{p.name}</span>
                  <span className="text-white/40">{p.quantity} sold</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="text-white/40 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-4">
            Low Stock (≤{LOW_STOCK_THRESHOLD})
          </h2>
          {stats.lowStock.length === 0 ? (
            <p className="text-white/40 font-['Space_Grotesk'] text-sm">Everything's well stocked.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.lowStock.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.id}/edit`}
                  className="flex justify-between text-sm font-['Space_Grotesk'] text-white/70 hover:text-white"
                >
                  <span>{p.name}</span>
                  <span className={p.stock === 0 ? 'text-[#c81e1e]' : 'text-yellow-400'}>
                    {p.stock} left
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
