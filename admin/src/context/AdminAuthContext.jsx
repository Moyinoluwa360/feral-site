import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

const AdminAuthContext = createContext(null)

export const AdminAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null)
        setIsAdmin(false)
        setLoading(false)
        return
      }

      // Force-refresh so a claim granted after this session started
      // (e.g. via scripts/grantAdmin.js) is picked up without a manual
      // sign-out/sign-in.
      const tokenResult = await user.getIdTokenResult(true)
      setCurrentUser(user)
      setIsAdmin(tokenResult.claims.role === 'admin')
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const logout = () => signOut(auth)

  return (
    <AdminAuthContext.Provider value={{ currentUser, isAdmin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  return ctx
}

export default AdminAuthContext
