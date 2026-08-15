import { useState, useEffect } from 'react'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'

/**
 * Fetches all lookbook images from the Firestore `lookbook` collection,
 * newest upload first. Returns { images, loading, error }.
 */
export function useLookbookImages() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    getDocs(query(collection(db, 'lookbook'), orderBy('createdAt', 'desc')))
      .then((snapshot) => {
        if (cancelled) return
        setImages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
      })
      .catch((err) => {
        if (cancelled) return
        console.error('[FERAL] useLookbookImages fetch error:', err)
        setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return { images, loading, error }
}
