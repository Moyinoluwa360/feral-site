import { useState, useEffect } from 'react'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'

/**
 * Fetches all products from the Firestore `products` collection.
 * Returns { products, loading, error }.
 */
export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    getDocs(collection(db, 'products'))
      .then((snapshot) => {
        if (cancelled) return
        setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
      })
      .catch((err) => {
        if (cancelled) return
        console.error('[FERAL] useProducts fetch error:', err)
        setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return { products, loading, error }
}

/**
 * Fetches a single product by its Firestore document ID.
 * Returns { product, loading, error }.
 */
export function useProduct(id) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    let cancelled = false

    getDoc(doc(db, 'products', String(id)))
      .then((snap) => {
        if (cancelled) return
        setProduct(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('[FERAL] useProduct fetch error:', err)
        setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id])

  return { product, loading, error }
}
