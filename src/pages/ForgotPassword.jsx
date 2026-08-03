import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import GlitchText from '../components/GlitchText'
import SEOHead from '../components/SEOHead'

const ForgotPassword = () => {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setMessage('Reset link sent. Check your inbox.')
    } catch (err) {
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/invalid-email':
          setError('No account found for that email address.')
          break
        default:
          setError('Failed to send reset email. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEOHead title="Reset Password" path="/forgot-password" />

      <div className="bg-[#0a0a0a] min-h-screen pt-16 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-white/30 font-['Space_Grotesk'] text-xs uppercase tracking-widest hover:text-[#c81e1e] transition-colors mb-10"
          >
            <FiArrowLeft size={14} />
            Back to Sign In
          </Link>

          <div className="mb-10">
            <GlitchText
              as="h1"
              className="text-white mb-3"
              style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)', display: 'block', lineHeight: 1 }}
            >
              RESET PASSWORD
            </GlitchText>
            <p className="text-white/30 font-['Space_Grotesk'] text-sm">
              Enter your email and we'll send a reset link.
            </p>
          </div>

          <div
            className="bg-white/3 border border-white/10 p-8"
            style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}
          >
            {error && (
              <div className="mb-6 px-4 py-3 border border-[#c81e1e]/40 bg-[#c81e1e]/10">
                <p className="text-[#c81e1e] font-['Space_Grotesk'] text-sm">{error}</p>
              </div>
            )}

            {message ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <p
                  className="text-[#c81e1e] text-xl uppercase tracking-widest mb-4"
                  style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
                >
                  CHECK YOUR INBOX
                </p>
                <p className="text-white/40 font-['Space_Grotesk'] text-sm mb-6">
                  {message}
                </p>
                <Link to="/login" className="btn-primary text-sm">
                  Back to Sign In
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="input-dark"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'SENDING…' : 'SEND RESET LINK'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default ForgotPassword
