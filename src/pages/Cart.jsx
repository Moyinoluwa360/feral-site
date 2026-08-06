import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { CURRENCY_SYMBOL } from '../lib/shipping'
import GlitchText from '../components/GlitchText'
import SEOHead from '../components/SEOHead'

const Cart = () => {
  const shouldReduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart()

  if (items.length === 0) {
    return (
      <>
        <SEOHead title="Cart" path="/cart" />
        <div className="bg-[#0a0a0a] min-h-screen pt-16 flex flex-col items-center justify-center px-4">
          <div className="text-center">
            <div className="relative mb-8 mx-auto w-40 h-40">
              <img
                src="/logo2.jpeg"
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover opacity-10 grayscale"
              />
            </div>

            <GlitchText
              as="h1"
              className="text-white/20 mb-4"
              style={{ fontSize: 'clamp(2rem, 7vw, 5rem)', display: 'block', lineHeight: 1 }}
            >
              CART IS EMPTY
            </GlitchText>

            <p className="text-white/30 font-['Space_Grotesk'] text-sm mb-10">
              You haven't added anything yet. Go wild.
            </p>

            <Link to="/shop" className="btn-primary text-sm">
              SHOP THE DROP
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SEOHead title="Your Cart" path="/cart" />
      <div className="bg-[#0a0a0a] min-h-screen pt-16">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12">
          {/* Header */}
          <div className="mb-10 border-b border-white/10 pb-8">
            <GlitchText
              as="h1"
              className="text-white"
              style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', display: 'block', lineHeight: 1 }}
            >
              YOUR CART
            </GlitchText>
            <p className="text-white/30 font-['Space_Grotesk'] text-sm mt-2">
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Items */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={`${item.product.id}-${item.size}-${item.color ?? ''}`}
                    initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: shouldReduceMotion ? 0 : -40, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-4 bg-white/3 border border-white/8 p-4"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}
                  >
                    {/* Image */}
                    <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-20 h-24 object-cover"
                        style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
                        loading="lazy"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product.id}`}>
                        <h3
                          className="text-white text-sm uppercase tracking-wider hover:text-[#c81e1e] transition-colors truncate"
                          style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
                        >
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-white/40 font-['Space_Grotesk'] text-xs mt-1 capitalize">
                        {item.color ? `${item.color} · ` : ''}Size: {item.size}
                      </p>
                      <p className="text-white font-['Space_Grotesk'] text-sm font-semibold mt-2">
                        {CURRENCY_SYMBOL}{(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.product.id, item.size, item.color)}
                        className="text-white/30 hover:text-[#c81e1e] transition-colors p-1"
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <FiTrash2 size={16} />
                      </button>

                      <div className="flex items-center border border-white/15">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1, item.color)}
                          className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="w-8 text-center text-white font-['Space_Grotesk'] text-xs select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1, item.color)}
                          className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
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
                    <div key={`${item.product.id}-${item.size}-${item.color ?? ''}`} className="flex justify-between">
                      <span className="text-white/40 font-['Space_Grotesk'] text-xs">
                        {item.product.name} ({item.color ? `${item.color}, ` : ''}{item.size}) ×{item.quantity}
                      </span>
                      <span className="text-white/60 font-['Space_Grotesk'] text-xs">
                        {CURRENCY_SYMBOL}{(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-white/60 font-['Space_Grotesk'] text-sm">Subtotal</span>
                    <span className="text-white font-['Space_Grotesk'] text-sm font-semibold">
                      {CURRENCY_SYMBOL}{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-white/40 font-['Space_Grotesk'] text-xs">Shipping</span>
                    <span className="text-white/40 font-['Space_Grotesk'] text-xs">Calculated at checkout</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="btn-primary w-full text-sm py-4"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
                >
                  PROCEED TO CHECKOUT
                </button>

                <div className="mt-4 text-center">
                  <Link
                    to="/shop"
                    className="text-white/30 font-['Space_Grotesk'] text-xs hover:text-white transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Cart
