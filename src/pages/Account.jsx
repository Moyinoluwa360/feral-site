import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiLogOut, FiPackage, FiUser, FiChevronRight } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import GlitchText from '../components/GlitchText'
import SEOHead from '../components/SEOHead'

const Account = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <>
      <SEOHead title="My Account" path="/account" />

      <div className="bg-[#0a0a0a] min-h-screen pt-16">
        <div className="max-w-screen-lg mx-auto px-4 md:px-8 py-12">
          {/* Header */}
          <div className="flex items-start justify-between mb-10 border-b border-white/10 pb-8">
            <div>
              <GlitchText
                as="h1"
                className="text-white"
                style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', display: 'block', lineHeight: 1 }}
              >
                MY ACCOUNT
              </GlitchText>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-white/30 hover:text-[#c81e1e] transition-colors font-['Space_Grotesk'] text-sm uppercase tracking-wider"
            >
              <FiLogOut size={16} />
              Sign Out
            </button>
          </div>

          {/* Profile */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white/3 border border-white/10 p-6 mb-6"
            style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 bg-white/10 flex items-center justify-center flex-shrink-0"
                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
              >
                <FiUser size={20} className="text-white/50" />
              </div>
              <div>
                <p
                  className="text-white text-lg uppercase tracking-wider"
                  style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
                >
                  {currentUser?.displayName || 'Pack Member'}
                </p>
                <p className="text-white/40 font-['Space_Grotesk'] text-sm">
                  {currentUser?.email}
                </p>
              </div>
            </div>
          </motion.div>

          {/* My Orders link */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <Link to="/orders" className="group block">
              <div
                className="bg-white/3 border border-white/8 group-hover:border-[#c81e1e]/50 group-hover:bg-white/5 p-6 flex items-center gap-4 transition-colors"
                style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}
              >
                <div
                  className="w-12 h-12 bg-white/10 flex items-center justify-center flex-shrink-0"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
                >
                  <FiPackage size={20} className="text-white/50" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-white text-lg uppercase tracking-wider"
                    style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
                  >
                    My Orders
                  </p>
                  <p className="text-white/40 font-['Space_Grotesk'] text-sm">
                    Track deliveries and view order history
                  </p>
                </div>
                <FiChevronRight
                  size={22}
                  className="text-white/20 group-hover:text-[#c81e1e] group-hover:translate-x-1 transition-all flex-shrink-0"
                />
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default Account
