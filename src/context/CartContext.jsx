import { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useRef, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './AuthContext'

const GUEST_CART_KEY = 'feral_guest_cart'

const CartContext = createContext(null)

// ─── Reducer ─────────────────────────────────────────────────────────────────
// Uses String() comparison for IDs to work with both Firestore string IDs and
// any legacy numeric IDs that may exist in guest carts.

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ITEMS':
      return action.payload

    case 'ADD_ITEM': {
      const { product, size, quantity } = action.payload
      const existingIndex = state.findIndex(
        (item) =>
          String(item.product.id) === String(product.id) && item.size === size
      )
      if (existingIndex >= 0) {
        const updated = [...state]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        }
        return updated
      }
      return [...state, { product, size, quantity }]
    }

    case 'REMOVE_ITEM': {
      const { productId, size } = action.payload
      return state.filter(
        (item) =>
          !(String(item.product.id) === String(productId) && item.size === size)
      )
    }

    case 'UPDATE_QUANTITY': {
      const { productId, size, quantity } = action.payload
      if (quantity <= 0) {
        return state.filter(
          (item) =>
            !(String(item.product.id) === String(productId) && item.size === size)
        )
      }
      return state.map((item) =>
        String(item.product.id) === String(productId) && item.size === size
          ? { ...item, quantity }
          : item
      )
    }

    case 'CLEAR_CART':
      return []

    default:
      return state
  }
}

// ─── Merge guest cart into existing Firestore cart ────────────────────────────

function mergeGuestCart(firestoreCart, guestCart) {
  const merged = [...firestoreCart]
  for (const guestItem of guestCart) {
    const idx = merged.findIndex(
      (item) =>
        String(item.product.id) === String(guestItem.product.id) &&
        item.size === guestItem.size
    )
    if (idx >= 0) {
      merged[idx] = { ...merged[idx], quantity: merged[idx].quantity + guestItem.quantity }
    } else {
      merged.push(guestItem)
    }
  }
  return merged
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const CartProvider = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth()
  const [items, dispatch] = useReducer(cartReducer, [])
  const [cartLoading, setCartLoading] = useState(true)
  // Prevents sync writes during initialization
  const initialized = useRef(false)

  // ── Initialization: load cart when auth state resolves ─────────────────────
  useEffect(() => {
    if (authLoading) return // wait for Firebase Auth to resolve

    initialized.current = false
    setCartLoading(true)

    const initCart = async () => {
      try {
        if (currentUser) {
          // Load from Firestore
          const snap = await getDoc(doc(db, 'users', currentUser.uid))
          const firestoreCart = snap.exists() ? (snap.data().cart ?? []) : []

          // Merge any guest cart collected before login
          let raw
          try { raw = localStorage.getItem(GUEST_CART_KEY) } catch { raw = null }
          const guestCart = raw ? JSON.parse(raw) : []

          if (guestCart.length > 0) {
            const merged = mergeGuestCart(firestoreCart, guestCart)
            dispatch({ type: 'SET_ITEMS', payload: merged })
            // Persist merged cart; clear guest storage
            try { localStorage.removeItem(GUEST_CART_KEY) } catch { /* ignore */ }
            await setDoc(doc(db, 'users', currentUser.uid), { cart: merged }, { merge: true })
          } else {
            dispatch({ type: 'SET_ITEMS', payload: firestoreCart })
          }
        } else {
          // Load from localStorage (guest)
          let raw
          try { raw = localStorage.getItem(GUEST_CART_KEY) } catch { raw = null }
          dispatch({ type: 'SET_ITEMS', payload: raw ? JSON.parse(raw) : [] })
        }
      } catch (err) {
        console.error('[FERAL] Cart init error:', err)
        dispatch({ type: 'SET_ITEMS', payload: [] })
      } finally {
        initialized.current = true
        setCartLoading(false)
      }
    }

    initCart()
  }, [currentUser, authLoading])

  // ── Storage sync helper (called after every user-initiated action) ──────────
  const syncToStorage = useCallback(
    (newItems) => {
      if (currentUser) {
        setDoc(doc(db, 'users', currentUser.uid), { cart: newItems }, { merge: true }).catch(
          (err) => console.error('[FERAL] Cart sync error:', err)
        )
      } else {
        try {
          localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newItems))
        } catch { /* localStorage might be unavailable */ }
      }
    },
    [currentUser]
  )

  // ── Public API ─────────────────────────────────────────────────────────────
  // Each action computes the new state via cartReducer (pure), dispatches it,
  // then syncs to the appropriate store — avoiding effect timing issues.

  const addItem = useCallback(
    (product, size, quantity = 1) => {
      const action = { type: 'ADD_ITEM', payload: { product, size, quantity } }
      const newItems = cartReducer(items, action)
      dispatch(action)
      syncToStorage(newItems)
    },
    [items, syncToStorage]
  )

  const removeItem = useCallback(
    (productId, size) => {
      const action = { type: 'REMOVE_ITEM', payload: { productId, size } }
      const newItems = cartReducer(items, action)
      dispatch(action)
      syncToStorage(newItems)
    },
    [items, syncToStorage]
  )

  const updateQuantity = useCallback(
    (productId, size, quantity) => {
      const action = { type: 'UPDATE_QUANTITY', payload: { productId, size, quantity } }
      const newItems = cartReducer(items, action)
      dispatch(action)
      syncToStorage(newItems)
    },
    [items, syncToStorage]
  )

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
    syncToStorage([])
  }, [syncToStorage])

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  )

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    [items]
  )

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        cartLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}

export default CartContext
