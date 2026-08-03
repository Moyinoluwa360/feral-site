import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import GlitchText from '../components/GlitchText'
import SEOHead from '../components/SEOHead'
import PasswordInput from '../components/PasswordInput'

const Signup = () => {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await signup(email, password, name)
      navigate('/account')
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists.')
          break
        case 'auth/invalid-email':
          setError('Enter a valid email address.')
          break
        case 'auth/weak-password':
          setError('Password must be at least 6 characters.')
          break
        default:
          setError('Sign-up failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEOHead title="Create Account" path="/signup" />

      <div className="bg-[#0a0a0a] min-h-screen pt-16 flex items-center justify-center px-4 py-12">
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
              style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)', display: 'block', lineHeight: 1 }}
            >
              JOIN THE PACK
            </GlitchText>
            <p className="text-white/30 font-['Space_Grotesk'] text-sm">
              Create your F3RAL account.
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
                  Full Name
                </label>
                <input
                  type="text"
                  className="input-dark"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>

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
                <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
                  Password
                </label>
                <PasswordInput
                  className="input-dark"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
                  Confirm Password
                </label>
                <PasswordInput
                  className="input-dark"
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT'}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-white/30 font-['Space_Grotesk'] text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-[#c81e1e] hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  )
}

export default Signup
