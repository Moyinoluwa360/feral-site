import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

const Spinner = () => (
  <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-white/10 border-t-[#c81e1e] rounded-full animate-spin" />
  </div>
)

/**
 * Wrap the admin route tree with AdminRoute to require both a signed-in
 * user and the `admin` custom claim. Signed-in-but-not-admin users see a
 * "not authorized" screen rather than being redirected, since redirecting
 * to /login would just loop them back here.
 */
const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin, loading, logout } = useAdminAuth()

  if (loading) return <Spinner />

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-white font-display text-xl">Not Authorized</p>
        <p className="text-white/50 font-['Space_Grotesk'] text-sm max-w-sm">
          {currentUser.email} doesn't have admin access on this account.
        </p>
        <button onClick={logout} className="btn-outline">
          Sign Out
        </button>
      </div>
    )
  }

  return children
}

export default AdminRoute
