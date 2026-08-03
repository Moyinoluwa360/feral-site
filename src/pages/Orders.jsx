import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { FiPackage, FiChevronRight } from 'react-icons/fi'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { CURRENCY_SYMBOL } from '../lib/shipping'
import GlitchText from '../components/GlitchText'
import SEOHead from '../components/SEOHead'

const STATUS_COLORS = {
  processing: 'text-yellow-400',
  shipped: 'text-blue-400',
  delivered: 'text-green-400',
  cancelled: 'text-white/40',
  refunded: 'text-white/40',
}

const STATUS_LABELS = {
  processing: 'Order Received',
  shipped: 'Order Sent Out',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

const Orders = () => {
  const { currentUser } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return

    // Requires Firestore index: orders / userId ASC, createdAt DESC
    // Firebase will log a link to create the index on first run if missing.
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    )

    getDocs(q)
      .then((snap) => {
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      })
      .catch((err) => console.error('[FERAL] Orders fetch error:', err))
      .finally(() => setLoading(false))
  }, [currentUser])

  return (
    <>
      <SEOHead title="My Orders" path="/orders" />

      <div className="bg-[#0a0a0a] min-h-screen pt-16">
        <div className="max-w-screen-lg mx-auto px-4 md:px-8 py-12">
          <div className="mb-10 border-b border-white/10 pb-8">
            <GlitchText
              as="h1"
              className="text-white"
              style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', display: 'block', lineHeight: 1 }}
            >
              MY ORDERS
            </GlitchText>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-white/10 border-t-[#c81e1e] rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 border border-white/5">
              <FiPackage size={36} className="text-white/10 mx-auto mb-4" />
              <p className="text-white/20 font-['Space_Grotesk'] text-sm mb-6">
                No orders yet. Time to go wild.
              </p>
              <Link to="/shop" className="btn-primary text-sm">
                Shop the Drop
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order, i) => {
                const createdAt = order.createdAt?.toDate?.()
                const dateStr = createdAt
                  ? createdAt.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <Link
                      to={`/order-confirmation/${order.id}`}
                      className="group block"
                    >
                      <div
                        className="bg-white/3 border border-white/8 group-hover:border-[#c81e1e]/50 group-hover:bg-white/5 p-5 transition-colors"
                        style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <p
                                className="text-[#c81e1e] text-sm uppercase tracking-widest mb-1"
                                style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
                              >
                                {order.reference}
                              </p>
                              <p className="text-white/40 font-['Space_Grotesk'] text-xs">
                                {dateStr} · {order.items?.length ?? 0} item{order.items?.length !== 1 ? 's' : ''}
                              </p>
                            </div>

                            <div className="flex items-center gap-4">
                              <p
                                className={`font-['Space_Grotesk'] text-xs uppercase tracking-widest ${STATUS_COLORS[order.status] ?? 'text-white/40'}`}
                              >
                                {STATUS_LABELS[order.status] ?? order.status}
                              </p>
                              <p className="text-white font-['Space_Grotesk'] text-sm font-semibold">
                                {CURRENCY_SYMBOL}{order.total?.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <FiChevronRight
                            size={20}
                            className="text-white/20 group-hover:text-[#c81e1e] group-hover:translate-x-1 transition-all flex-shrink-0"
                          />
                        </div>

                        {/* Item thumbnails */}
                        {order.items?.length > 0 && (
                          <div className="flex gap-2 mt-4">
                            {order.items.slice(0, 4).map((item, j) => (
                              item.image ? (
                                <img
                                  key={j}
                                  src={item.image}
                                  alt={item.name}
                                  className="w-10 h-12 object-cover opacity-60"
                                  loading="lazy"
                                />
                              ) : null
                            ))}
                            {order.items.length > 4 && (
                              <div className="w-10 h-12 bg-white/5 flex items-center justify-center">
                                <span className="text-white/30 font-['Space_Grotesk'] text-xs">
                                  +{order.items.length - 4}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <p className="text-white/20 group-hover:text-white/40 font-['Space_Grotesk'] text-[11px] uppercase tracking-widest mt-4 transition-colors">
                          View Details →
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Orders
