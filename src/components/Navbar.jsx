import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { FiShoppingBag, FiMenu, FiX } from 'react-icons/fi'
import { useCart } from '../context/CartContext'

const navLinks = [
  { label: 'HOME', to: '/' },
  { label: 'SHOP', to: '/shop' },
  { label: 'LOOKBOOK', to: '/lookbook' },
  { label: 'ABOUT', to: '/about' },
  { label: 'CONTACT', to: '/contact' },
]

const Navbar = () => {
  const { itemCount } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const menuVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: 'tween', duration: shouldReduceMotion ? 0 : 0.3 }
    },
    exit: {
      x: '100%',
      opacity: 0,
      transition: { type: 'tween', duration: shouldReduceMotion ? 0 : 0.25 }
    },
  }

  const linkItemVariants = {
    hidden: { x: 40, opacity: 0 },
    visible: (i) => ({
      x: 0,
      opacity: 1,
      transition: { delay: shouldReduceMotion ? 0 : i * 0.07, duration: 0.3 }
    }),
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-black/95 backdrop-blur-md border-b border-white/5' : 'bg-black/90 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 z-10">
            <img
              src="/logo1.jpeg"
              alt="FERAL"
              className="h-10 w-10 object-cover"
              style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}
            />
            <span
              className="text-white text-xl hidden xs:block"
              style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700, letterSpacing: '0.15em' }}
            >
              FERAL
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `font-['Space_Grotesk'] text-xs tracking-[0.2em] uppercase transition-colors duration-200 ${
                    isActive ? 'text-[#c81e1e]' : 'text-white/80 hover:text-[#c81e1e]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right: Cart + Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative text-white hover:text-[#c81e1e] transition-colors">
              <FiShoppingBag size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#c81e1e] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center leading-none">
                  {itemCount > 99 ? '99' : itemCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden text-white hover:text-[#c81e1e] transition-colors z-10"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Slide-in Panel */}
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-[#0a0a0a] border-l border-white/10 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 h-16 border-b border-white/10">
                <span
                  className="text-white text-xl"
                  style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700, letterSpacing: '0.15em' }}
                >
                  FERAL
                </span>
                <button
                  className="text-white hover:text-[#c81e1e] transition-colors"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <FiX size={24} />
                </button>
              </div>

              <nav className="flex flex-col gap-1 px-6 py-8">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.to}
                    custom={i}
                    variants={linkItemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <NavLink
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `block font-['Big_Shoulders_Stencil'] font-bold text-3xl uppercase tracking-wider py-3 border-b border-white/5 transition-colors duration-200 ${
                          isActive ? 'text-[#c81e1e]' : 'text-white hover:text-[#c81e1e]'
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto px-6 pb-8">
                <Link
                  to="/cart"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 text-white/60 hover:text-white transition-colors font-['Space_Grotesk'] text-sm"
                >
                  <FiShoppingBag size={18} />
                  <span>Cart {itemCount > 0 && `(${itemCount})`}</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
