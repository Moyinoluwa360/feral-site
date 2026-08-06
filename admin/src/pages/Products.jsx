import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { db, storage } from '../lib/firebase'

const CURRENCY_SYMBOL = import.meta.env.VITE_CURRENCY_SYMBOL || '₦'

const totalStock = (stock = {}) =>
  Object.values(stock).reduce((sum, n) => sum + (Number(n) || 0), 0)

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const loadProducts = async () => {
    setLoading(true)
    const snap = await getDocs(collection(db, 'products'))
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => p.name?.toLowerCase().includes(q))
  }, [products, search])

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return

    setDeletingId(product.id)
    try {
      await Promise.all(
        (product.images ?? []).map(async (url) => {
          try {
            // ref() itself throws (synchronously) for URLs that aren't valid
            // Firebase Storage URLs — e.g. seeded products using external
            // Unsplash URLs. Not fatal to the delete either way.
            await deleteObject(ref(storage, url))
          } catch {
            // Invalid URL, already gone, or unreachable — not fatal to the delete.
          }
        })
      )
      await deleteDoc(doc(db, 'products', product.id))
      setProducts((prev) => prev.filter((p) => p.id !== product.id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-white text-2xl">Products</h1>
        <Link to="/products/new" className="btn-primary">
          + New Product
        </Link>
      </div>

      <input
        type="text"
        className="input-dark max-w-sm mb-6"
        placeholder="Search by name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p className="text-white/40 font-['Space_Grotesk'] text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-white/40 font-['Space_Grotesk'] text-sm">No products found.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-white/40 font-['Space_Grotesk'] text-xs uppercase tracking-widest">
                <th className="p-4 font-normal">Product</th>
                <th className="p-4 font-normal">Colors</th>
                <th className="p-4 font-normal">Price</th>
                <th className="p-4 font-normal">Stock</th>
                <th className="p-4 font-normal">Flags</th>
                <th className="p-4 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-white/5 last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="w-10 h-12 object-cover bg-white/5 flex-shrink-0"
                      />
                      <span className="text-white font-['Space_Grotesk'] text-sm">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    {product.colors?.length > 0 ? (
                      <div className="flex items-center gap-1">
                        {product.colors.slice(0, 6).map((color) => (
                          <span
                            key={color.name}
                            title={color.name}
                            className="w-3 h-3 rounded-full ring-1 ring-white/20 flex-shrink-0"
                            style={{ backgroundColor: color.hex }}
                          />
                        ))}
                        {product.colors.length > 6 && (
                          <span className="text-white/30 font-['Space_Grotesk'] text-[10px]">
                            +{product.colors.length - 6}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-white/20 font-['Space_Grotesk'] text-xs">—</span>
                    )}
                  </td>
                  <td className="p-4 text-white/60 font-['Space_Grotesk'] text-sm">
                    {CURRENCY_SYMBOL}{Number(product.price ?? 0).toLocaleString()}
                  </td>
                  <td className="p-4 font-['Space_Grotesk'] text-sm">
                    <span className={totalStock(product.stock) <= 5 ? 'text-[#c81e1e]' : 'text-white/60'}>
                      {totalStock(product.stock)}
                    </span>
                  </td>
                  <td className="p-4 font-['Space_Grotesk'] text-xs text-white/40">
                    {[product.featured && 'Featured', product.new && 'New'].filter(Boolean).join(', ')}
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <Link
                      to={`/products/${product.id}/edit`}
                      className="text-white/50 hover:text-white font-['Space_Grotesk'] text-xs uppercase tracking-widest mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product)}
                      disabled={deletingId === product.id}
                      className="text-white/50 hover:text-[#c81e1e] font-['Space_Grotesk'] text-xs uppercase tracking-widest disabled:opacity-40"
                    >
                      {deletingId === product.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Products
