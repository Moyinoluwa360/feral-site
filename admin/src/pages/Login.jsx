import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

const Login = () => {
  const { login } = useAdminAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          setError('Invalid email or password.')
          break
        case 'auth/too-many-requests':
          setError('Too many attempts. Try again later.')
          break
        default:
          setError('Sign-in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="font-display text-white text-4xl mb-2">F3RAL ADMIN</h1>
          <p className="text-white/30 font-['Space_Grotesk'] text-sm">Sign in to continue.</p>
        </div>

        <div className="card p-8">
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
                placeholder="you@feral.com"
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-dark pr-14"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors font-['Space_Grotesk'] text-xs uppercase tracking-wider"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? 'SIGNING IN…' : 'SIGN IN'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-white/30 font-['Space_Grotesk'] text-xs">
          Admin access is granted by an existing admin — there's no self-service signup here.
        </p>
      </div>
    </div>
  )
}

export default Login
