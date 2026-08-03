import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import GlitchText from '../components/GlitchText'
import SEOHead from '../components/SEOHead'
import PasswordInput from '../components/PasswordInput'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          setError('Invalid email or password.')
          break
        case 'auth/too-many-requests':
          setError('Too many attempts. Try again later or reset your password.')
          break
        default:
          setError('Sign-in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEOHead title="Sign In" path="/login" />

      <div className="bg-[#0a0a0a] min-h-screen pt-16 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-10 text-center">
            <GlitchText
              as="h1"
              className="text-white mb-3"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', display: 'block', lineHeight: 1 }}
            >
              SIGN IN
            </GlitchText>
            <p className="text-white/30 font-['Space_Grotesk'] text-sm">
              Enter the pack.
            </p>
          </div>

          {/* Card */}
          <div
            className="bg-white/3 border border-white/10 p-8"
            style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}
          >
            {error && (
              <div className="mb-6 px-4 py-3 border border-[#c81e1e]/40 bg-[#c81e1e]/10">
                <p className="text-[#c81e1e] font-['Space_Grotesk'] text-sm">{error}</p>
              </div>
            )}

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

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-white/30 font-['Space_Grotesk'] text-xs hover:text-[#c81e1e] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput
                  className="input-dark"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'SIGNING IN…' : 'SIGN IN'}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-white/30 font-['Space_Grotesk'] text-sm">
            No account?{' '}
            <Link to="/signup" className="text-[#c81e1e] hover:underline">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  )
}

export default Login
