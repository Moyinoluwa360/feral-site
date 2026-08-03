import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { FiCheck, FiMinus, FiPlus } from 'react-icons/fi'
import { useProduct, useProducts } from '../hooks/useProducts'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import GlitchText from '../components/GlitchText'
import SEOHead from '../components/SEOHead'
import { CURRENCY_SYMBOL } from '../lib/shipping'

const ProductDetail = () => {
  const { id } = useParams()
  const shouldReduceMotion = useReducedMotion()
  const { addItem } = useCart()

  const { product, loading, error } = useProduct(id)
  const { products: allProducts } = useProducts()

  const [mainImage, setMainImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [addedToCart, setAddedToCart] = useState(false)

  const relatedProducts = useMemo(() => {
    if (!product) return []
    return allProducts
      .filter((p) => String(p.id) !== String(product.id))
      .slice(0, 3)
  }, [product, allProducts])

  if (loading) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen pt-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-[#c81e1e] rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen pt-16 flex items-center justify-center px-4">
        <div className="text-center">
          <GlitchText
            as="h1"
            className="text-white/20 mb-6"
            style={{ fontSize: 'clamp(4rem, 12vw, 10rem)', display: 'block', lineHeight: 1 }}
            always
          >
            404
          </GlitchText>
          <p className="text-white/40 font-['Space_Grotesk'] mb-8">Product not found.</p>
          <Link to="/shop" className="btn-primary text-sm">
            Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  // Check available stock for the selected size
  const stockForSize = selectedSize ? (product.stock?.[selectedSize] ?? 0) : null
  const outOfStock = stockForSize !== null && stockForSize === 0

  const handleAddToCart = () => {
    if (!selectedSize || outOfStock) return
    addItem(product, selectedSize, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  return (
    <>
    <SEOHead
      title={product.name}
      description={product.description}
      image={product.images?.[0]}
      path={`/product/${id}`}
      type="product"
      productData={product}
    />
    <div className="bg-[#0a0a0a] min-h-screen pt-16">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-white/30 font-['Space_Grotesk'] text-xs uppercase tracking-wider mb-10">
          <Link to="/" className="hover:text-[#c81e1e] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#c81e1e] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-white/60">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          {/* Left: Image Gallery */}
          <div>
            {/* Main Image */}
            <motion.div
              className="relative overflow-hidden mb-4"
              style={{ clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)' }}
            >
              <motion.img
                key={mainImage}
                src={product.images[mainImage]}
                alt={product.name}
                className="w-full aspect-[3/4] object-cover"
                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
              />

              {product.new && (
                <div className="absolute top-4 left-4">
                  <span
                    className="bg-[#c81e1e] text-white text-xs px-3 py-1 uppercase tracking-widest"
                    style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
                  >
                    New Arrival
                  </span>
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(i)}
                  className={`relative overflow-hidden w-20 h-24 flex-shrink-0 transition-all duration-200 ${
                    mainImage === i
                      ? 'ring-2 ring-[#c81e1e]'
                      : 'ring-1 ring-white/10 hover:ring-white/40 opacity-60 hover:opacity-100'
                  }`}
                  style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
                >
                  <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div>
            <GlitchText
              as="h1"
              className="text-white mb-4"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', display: 'block', lineHeight: 1.05 }}
            >
              {product.name}
            </GlitchText>

            <p className="text-white font-['Space_Grotesk'] text-3xl font-semibold mb-8">
              {CURRENCY_SYMBOL}{product.price.toLocaleString()}
            </p>

            {/* Size Selector */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/60 font-['Space_Grotesk'] text-xs uppercase tracking-widest">
                  Select Size
                </span>
                {!selectedSize && (
                  <span className="text-[#c81e1e] font-['Space_Grotesk'] text-xs">
                    Required
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const sizeStock = product.stock?.[size] ?? null
                  const soldOut = sizeStock !== null && sizeStock === 0
                  return (
                    <button
                      key={size}
                      onClick={() => !soldOut && setSelectedSize(size)}
                      disabled={soldOut}
                      title={soldOut ? 'Out of stock' : undefined}
                      className={`min-w-[52px] h-10 px-3 font-['Big_Shoulders_Stencil'] font-bold text-sm uppercase tracking-wider transition-all duration-150 ${
                        soldOut
                          ? 'border border-white/10 text-white/20 cursor-not-allowed line-through'
                          : selectedSize === size
                          ? 'bg-[#c81e1e] text-white'
                          : 'border border-white/20 text-white/50 hover:border-white/60 hover:text-white'
                      }`}
                      style={
                        selectedSize === size && !soldOut
                          ? { clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }
                          : {}
                      }
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <span className="text-white/60 font-['Space_Grotesk'] text-xs uppercase tracking-widest block mb-3">
                Quantity
              </span>
              <div className="flex items-center gap-0 border border-white/20 w-fit">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <FiMinus size={14} />
                </button>
                <span className="w-12 text-center text-white font-['Space_Grotesk'] text-sm select-none">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <FiPlus size={14} />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || outOfStock}
              className={`w-full py-4 font-['Big_Shoulders_Stencil'] font-bold text-base uppercase tracking-[0.25em] transition-all duration-200 mb-4 ${
                !selectedSize || outOfStock
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'btn-primary w-full'
              }`}
              style={
                selectedSize && !outOfStock
                  ? { clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }
                  : {}
              }
            >
              <AnimatePresence mode="wait">
                {addedToCart ? (
                  <motion.span
                    key="added"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <FiCheck size={16} />
                    ADDED TO CART
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    ADD TO CART
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {!selectedSize && (
              <p className="text-white/30 font-['Space_Grotesk'] text-xs text-center mb-4">
                Please select a size to continue
              </p>
            )}

            {/* Description / Materials Tabs */}
            <div className="mt-8 border-t border-white/10 pt-8">
              <div className="flex gap-6 mb-6">
                {['description', 'materials'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`font-['Big_Shoulders_Stencil'] font-bold text-sm uppercase tracking-widest pb-2 border-b-2 transition-colors duration-200 ${
                      activeTab === tab
                        ? 'text-white border-[#c81e1e]'
                        : 'text-white/30 border-transparent hover:text-white/60'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={activeTab}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-white/50 font-['Space_Grotesk'] text-sm leading-relaxed"
                >
                  {activeTab === 'description' ? product.description : product.materials}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <div className="border-t border-white/10 pt-12 mb-10">
              <GlitchText
                as="h2"
                className="text-white"
                style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)', display: 'block', lineHeight: 1 }}
              >
                RELATED PRODUCTS
              </GlitchText>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedProducts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : i * 0.1 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}

export default ProductDetail
