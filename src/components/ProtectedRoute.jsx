import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Spinner = () => (
  <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-white/10 border-t-[#c81e1e] rounded-full animate-spin" />
  </div>
)

/**
 * Wrap any route element with ProtectedRoute to require authentication.
 * Unauthenticated users are redirected to /login, with the intended
 * destination stored in location state so login can redirect back.
 */
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner />

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
