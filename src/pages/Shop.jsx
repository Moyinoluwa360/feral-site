import { useState, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { products } from '../data/products'
import ProductCard from '../components/ProductCard'
import ClawWatermark from '../components/ClawWatermark'
import GlitchText from '../components/GlitchText'
import { FiChevronDown } from 'react-icons/fi'

const CATEGORIES = ['ALL', 'OUTERWEAR', 'TOPS', 'BOTTOMS']
const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'new', label: 'New Arrivals' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
]

const Shop = () => {
  const shouldReduceMotion = useReducedMotion()
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [sortBy, setSortBy] = useState('featured')

  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (activeCategory !== 'ALL') {
      result = result.filter((p) => p.category.toUpperCase() === activeCategory)
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'new':
        result.sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0))
        break
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        break
    }

    return result
  }, [activeCategory, sortBy])

  return (
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
          {/* Category buttons */}
          <div className="flex items-center gap-1 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 font-['Big_Shoulders_Stencil'] font-bold text-sm uppercase tracking-wider transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-[#c81e1e] text-white'
                    : 'text-white/40 hover:text-white border border-white/10 hover:border-white/30'
                }`}
                style={{ clipPath: activeCategory === cat ? 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' : 'none' }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-white/30 font-['Space_Grotesk'] text-xs">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </span>

            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-transparent border border-white/10 text-white/60 font-['Space_Grotesk'] text-xs uppercase tracking-wider px-3 py-2 pr-8 cursor-pointer hover:border-white/30 transition-colors focus:outline-none focus:border-[#c81e1e]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#0a0a0a]">
                    {opt.label}
                  </option>
                ))}
              </select>
              <FiChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <p
              className="text-white/20 text-4xl uppercase mb-4"
              style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
            >
              NO PRODUCTS
            </p>
            <p className="text-white/30 font-['Space_Grotesk'] text-sm">
              Try a different filter.
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
  )
}

export default Shop
