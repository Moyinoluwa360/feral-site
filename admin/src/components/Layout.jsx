import { NavLink, Outlet } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/products', label: 'Products' },
  { to: '/orders', label: 'Orders' },
]

const Layout = () => {
  const { currentUser, logout } = useAdminAuth()

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <aside className="w-56 flex-shrink-0 border-r border-white/10 flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <span className="font-display text-white text-lg">F3RAL</span>
          <span className="block text-white/30 font-['Space_Grotesk'] text-xs uppercase tracking-widest mt-1">
            Admin
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-3 py-2 font-['Space_Grotesk'] text-sm uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'bg-[#c81e1e]/15 text-[#c81e1e]'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <p className="px-3 text-white/30 font-['Space_Grotesk'] text-xs truncate mb-2">
            {currentUser?.email}
          </p>
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 font-['Space_Grotesk'] text-sm uppercase tracking-wider text-white/50 hover:text-[#c81e1e] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
