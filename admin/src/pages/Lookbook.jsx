import { useEffect, useRef, useState } from 'react'
import {
  collection,
  doc,
  getDocs,
  query,
  orderBy,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../lib/firebase'

const Lookbook = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  // Upload form
  const [newFile, setNewFile] = useState(null)
  const [newCaption, setNewCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  // Per-card edit state: { [id]: { caption, file } }
  const [edits, setEdits] = useState({})
  const [savingId, setSavingId] = useState(null)

  const loadImages = async () => {
    setLoading(true)
    const snap = await getDocs(query(collection(db, 'lookbook'), orderBy('createdAt', 'desc')))
    setImages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => {
    loadImages()
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!newFile) {
      setError('Choose an image to upload.')
      return
    }
    setError('')
    setUploading(true)
    try {
      const lookbookRef = doc(collection(db, 'lookbook'))
      const path = `lookbook/${lookbookRef.id}/${Date.now()}-${newFile.name}`
      const fileRef = ref(storage, path)
      await uploadBytes(fileRef, newFile)
      const url = await getDownloadURL(fileRef)

      await setDoc(lookbookRef, {
        url,
        storagePath: path,
        caption: newCaption.trim(),
        createdAt: serverTimestamp(),
      })

      setNewFile(null)
      setNewCaption('')
      e.target.reset?.()
      await loadImages()
    } catch (err) {
      setError(err.message || 'Failed to upload image.')
    } finally {
      setUploading(false)
    }
  }

  const handleEditChange = (id, field, value) => {
    setEdits((prev) => {
      // Revoke a previously-picked file's preview URL before replacing it.
      if (field === 'file' && prev[id]?.previewUrl) {
        URL.revokeObjectURL(prev[id].previewUrl)
      }
      const extra = field === 'file' && value ? { previewUrl: URL.createObjectURL(value) } : {}
      return { ...prev, [id]: { ...prev[id], [field]: value, ...extra } }
    })
  }

  // Revoke edit-preview object URLs on unmount (using a ref so this doesn't
  // fire on every edits change — only when the component goes away).
  const editsRef = useRef(edits)
  editsRef.current = edits
  useEffect(() => {
    return () => {
      Object.values(editsRef.current).forEach((edit) => {
        if (edit.previewUrl) URL.revokeObjectURL(edit.previewUrl)
      })
    }
  }, [])

  const handleSave = async (image) => {
    const edit = edits[image.id]
    if (!edit) return

    setSavingId(image.id)
    try {
      const payload = {}
      if (edit.caption !== undefined && edit.caption !== image.caption) {
        payload.caption = edit.caption.trim()
      }

      if (edit.file) {
        const path = `lookbook/${image.id}/${Date.now()}-${edit.file.name}`
        const fileRef = ref(storage, path)
        await uploadBytes(fileRef, edit.file)
        payload.url = await getDownloadURL(fileRef)
        payload.storagePath = path

        // Best-effort cleanup of the old file — don't block the save on it.
        try {
          await deleteObject(ref(storage, image.storagePath))
        } catch {
          // Already gone or unreachable — not fatal.
        }
      }

      if (Object.keys(payload).length > 0) {
        await updateDoc(doc(db, 'lookbook', image.id), payload)
      }

      setEdits((prev) => {
        const next = { ...prev }
        if (next[image.id]?.previewUrl) URL.revokeObjectURL(next[image.id].previewUrl)
        delete next[image.id]
        return next
      })
      await loadImages()
    } finally {
      setSavingId(null)
    }
  }

  const handleDelete = async (image) => {
    if (!window.confirm('Delete this lookbook image? This cannot be undone.')) return

    setDeletingId(image.id)
    try {
      try {
        await deleteObject(ref(storage, image.storagePath))
      } catch {
        // Invalid path, already gone, or unreachable — not fatal to the delete.
      }
      await deleteDoc(doc(db, 'lookbook', image.id))
      setImages((prev) => prev.filter((i) => i.id !== image.id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <h1 className="font-display text-white text-2xl mb-8">Lookbook</h1>

      {/* Upload new */}
      <form onSubmit={handleUpload} className="card p-5 mb-8 flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="flex-1">
          <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
            New Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewFile(e.target.files?.[0] ?? null)}
            className="text-white/60 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
            Caption (optional)
          </label>
          <input
            type="text"
            className="input-dark"
            placeholder="e.g. SEASON 01 — APEX"
            value={newCaption}
            onChange={(e) => setNewCaption(e.target.value)}
          />
        </div>
        <button type="submit" disabled={uploading} className="btn-primary px-6 py-2.5 disabled:opacity-50">
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </form>

      {error && (
        <div className="mb-6 px-4 py-3 border border-[#c81e1e]/40 bg-[#c81e1e]/10">
          <p className="text-[#c81e1e] font-['Space_Grotesk'] text-sm">{error}</p>
        </div>
      )}

      <p className="text-white/30 font-['Space_Grotesk'] text-xs mb-4">
        Newest upload appears first on the site.
      </p>

      {loading ? (
        <p className="text-white/40 font-['Space_Grotesk'] text-sm">Loading…</p>
      ) : images.length === 0 ? (
        <p className="text-white/40 font-['Space_Grotesk'] text-sm">No lookbook images yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {images.map((image) => {
            const edit = edits[image.id] ?? {}
            const captionValue = edit.caption ?? image.caption ?? ''
            const hasChanges = edit.caption !== undefined || Boolean(edit.file)

            return (
              <div key={image.id} className="card p-4 flex flex-col gap-3">
                <img
                  src={edit.previewUrl ?? image.url}
                  alt={image.caption || ''}
                  className="w-full aspect-[3/4] object-cover bg-white/5"
                />
                <input
                  type="text"
                  className="input-dark text-sm"
                  placeholder="Caption"
                  value={captionValue}
                  onChange={(e) => handleEditChange(image.id, 'caption', e.target.value)}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleEditChange(image.id, 'file', e.target.files?.[0] ?? null)}
                  className="text-white/60 text-xs"
                />
                <div className="flex items-center justify-between mt-1">
                  <button
                    type="button"
                    onClick={() => handleSave(image)}
                    disabled={!hasChanges || savingId === image.id}
                    className="text-white/50 hover:text-white font-['Space_Grotesk'] text-xs uppercase tracking-widest disabled:opacity-30 disabled:hover:text-white/50"
                  >
                    {savingId === image.id ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(image)}
                    disabled={deletingId === image.id}
                    className="text-white/50 hover:text-[#c81e1e] font-['Space_Grotesk'] text-xs uppercase tracking-widest disabled:opacity-40"
                  >
                    {deletingId === image.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Lookbook
