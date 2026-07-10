import { createContext, useContext, useReducer, useMemo } from 'react'

const CartContext = createContext(null)

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, size, quantity } = action.payload
      const existingIndex = state.findIndex(
        (item) => item.product.id === product.id && item.size === size
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
        (item) => !(item.product.id === productId && item.size === size)
      )
    }

    case 'UPDATE_QUANTITY': {
      const { productId, size, quantity } = action.payload
      if (quantity <= 0) {
        return state.filter(
          (item) => !(item.product.id === productId && item.size === size)
        )
      }
      return state.map((item) =>
        item.product.id === productId && item.size === size
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

export const CartProvider = ({ children }) => {
  const [items, dispatch] = useReducer(cartReducer, [])

  const addItem = (product, size, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, size, quantity } })
  }

  const removeItem = (productId, size) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, size } })
  }

  const updateQuantity = (productId, size, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, size, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  )

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    [items]
  )

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }}>
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
