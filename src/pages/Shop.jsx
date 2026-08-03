import { useState, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'
import ClawWatermark from '../components/ClawWatermark'
import GlitchText from '../components/GlitchText'
import SEOHead from '../components/SEOHead'
import { FiChevronDown, FiSearch } from 'react-icons/fi'

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
]

const Shop = () => {
  const shouldReduceMotion = useReducedMotion()
  const { products, loading, error } = useProducts()
  const [sortBy, setSortBy] = useState('default')
  const [search, setSearch] = useState('')

  const filteredProducts = useMemo(() => {
    let result = [...products]

    const q = search.trim().toLowerCase()
    if (q) {
      result = result.filter((p) => p.name?.toLowerCase().includes(q))
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'default':
      default:
        // Latest drops first — sorts by upload date, untouched by later edits.
        result.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
        break
    }

    return result
  }, [products, sortBy, search])

  if (error) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen pt-16 flex items-center justify-center px-4">
        <p className="text-white/30 font-['Space_Grotesk'] text-sm">
          Failed to load products. Please refresh.
        </p>
      </div>
    )
  }

  return (
    <>
      <SEOHead
        title="Shop"
        description="Browse the full F3RAL collection — technical outerwear, graphic tees, and tactical bottoms."
        path="/shop"
      />
      <div className="bg-[#0a0a0a] min-h-screen pt-16">
      {/* Header */}
      <div className="relative overflow-hidden py-20 px-4 md:px-8 border-b border-white/5">
        <ClawWatermark position={{ top: '50%', right: '5%' }} size={400} />

        <div className="max-w-screen-xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[#c81e1e] font-['Space_Grotesk'] text-xs uppercase tracking-[0.4em] mb-3">
              Full Collection
            </p>
            <GlitchText
              as="h1"
              className="text-white"
              style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', display: 'block', lineHeight: 1 }}
            >
              ALL DROPS
            </GlitchText>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-30 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="text-white/30 font-['Space_Grotesk'] text-xs whitespace-nowrap">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </span>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <FiSearch
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="bg-white/5 border border-white/15 text-white font-['Space_Grotesk'] text-xs placeholder:text-white/30 pl-9 pr-3 py-2.5 w-40 sm:w-56 hover:border-white/30 focus:outline-none focus:border-[#c81e1e] transition-colors"
              />
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white/5 border border-white/15 text-white font-['Space_Grotesk'] text-xs uppercase tracking-wider pl-4 pr-9 py-2.5 min-w-[170px] cursor-pointer hover:border-white/30 transition-colors focus:outline-none focus:border-[#c81e1e]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#0a0a0a] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
              <FiChevronDown
                size={13}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/3 animate-pulse"
                style={{ aspectRatio: '3/4', clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <p
              className="text-white/20 text-4xl uppercase mb-4"
              style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
            >
              NO PRODUCTS
            </p>
            <p className="text-white/30 font-['Space_Grotesk'] text-sm">
              Try a different filter or search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : Math.min(i * 0.06, 0.4) }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  )
}

export default Shop
