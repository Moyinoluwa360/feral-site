import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiCheck } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import GlitchText from '../components/GlitchText'

const generateOrderNumber = () => `FERAL-${Date.now().toString(36).toUpperCase()}`

const Cart = () => {
  const shouldReduceMotion = useReducedMotion()
  const { items, removeItem, updateQuantity, clearCart, subtotal, itemCount } = useCart()
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  const handleCheckout = () => {
    const num = generateOrderNumber()
    setOrderNumber(num)
    setOrderConfirmed(true)
    clearCart()
  }

  if (orderConfirmed) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen pt-16 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-lg"
        >
          <div
            className="w-20 h-20 bg-[#c81e1e] flex items-center justify-center mx-auto mb-8"
            style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
          >
            <FiCheck size={36} className="text-white" />
          </div>

          <GlitchText
            as="h1"
            className="text-white mb-4"
            style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', display: 'block', lineHeight: 1 }}
          >
            ORDER CONFIRMED
          </GlitchText>

          <p className="text-[#c81e1e] font-['Big_Shoulders_Stencil'] font-bold text-sm uppercase tracking-[0.3em] mb-3">
            {orderNumber}
          </p>

          <p className="text-white/40 font-['Space_Grotesk'] text-sm leading-relaxed mb-10">
            Your order has been received. You'll receive a confirmation shortly. Stay feral.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop" className="btn-primary text-sm">
              CONTINUE SHOPPING
            </Link>
            <Link to="/" className="btn-outline text-sm">
              GO HOME
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
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
    )
  }

  return (
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
                  key={`${item.product.id}-${item.size}`}
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
                      {item.product.category} — Size: {item.size}
                    </p>
                    <p className="text-white font-['Space_Grotesk'] text-sm font-semibold mt-2">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.product.id, item.size)}
                      className="text-white/30 hover:text-[#c81e1e] transition-colors p-1"
                      aria-label={`Remove ${item.product.name}`}
                    >
                      <FiTrash2 size={16} />
                    </button>

                    <div className="flex items-center border border-white/15">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <FiMinus size={12} />
                      </button>
                      <span className="w-8 text-center text-white font-['Space_Grotesk'] text-xs select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
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
                  <div key={`${item.product.id}-${item.size}`} className="flex justify-between">
                    <span className="text-white/40 font-['Space_Grotesk'] text-xs">
                      {item.product.name} ({item.size}) x{item.quantity}
                    </span>
                    <span className="text-white/60 font-['Space_Grotesk'] text-xs">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-white/60 font-['Space_Grotesk'] text-sm">Subtotal</span>
                  <span className="text-white font-['Space_Grotesk'] text-sm font-semibold">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-white/40 font-['Space_Grotesk'] text-xs">Shipping</span>
                  <span className="text-white/40 font-['Space_Grotesk'] text-xs">Calculated at checkout</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
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
  )
}

export default Cart
