import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { doc, getDoc, setDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../lib/firebase'

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38']

const EMPTY_FORM = {
  name: '',
  price: '',
  sizes: [],
  stock: {},
  description: '',
  materials: '',
  images: [],
  featured: false,
  isNew: false,
}

const ProductForm = () => {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [newFiles, setNewFiles] = useState([])
  const [removedImageUrls, setRemovedImageUrls] = useState([])
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditing) return
    const load = async () => {
      const snap = await getDoc(doc(db, 'products', id))
      if (!snap.exists()) {
        setError('Product not found.')
        setLoading(false)
        return
      }
      const data = snap.data()
      setForm({
        name: data.name ?? '',
        price: data.price ?? '',
        sizes: data.sizes ?? [],
        stock: data.stock ?? {},
        description: data.description ?? '',
        materials: data.materials ?? '',
        images: data.images ?? [],
        featured: Boolean(data.featured),
        isNew: Boolean(data.new),
      })
      setLoading(false)
    }
    load()
  }, [id, isEditing])

  const handleToggleSize = (size) => {
    setForm((f) => {
      const selected = f.sizes.includes(size)
      const sizes = selected ? f.sizes.filter((s) => s !== size) : [...f.sizes, size]
      const stock = { ...f.stock }
      if (selected) {
        delete stock[size]
      } else {
        stock[size] = stock[size] ?? 0
      }
      return { ...f, sizes, stock }
    })
  }

  const handleStockChange = (size, value) => {
    setForm((f) => ({ ...f, stock: { ...f.stock, [size]: Number(value) || 0 } }))
  }

  const handleRemoveExistingImage = (url) => {
    setForm((f) => ({ ...f, images: f.images.filter((u) => u !== url) }))
    setRemovedImageUrls((prev) => [...prev, url])
  }

  const handleAddFiles = (e) => {
    const files = Array.from(e.target.files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    setNewFiles((prev) => [...prev, ...files])
    e.target.value = ''
  }

  // Revoke object URLs for new-file previews on unmount (using a ref so this
  // doesn't fire on every newFiles change — only when the component goes away).
  const newFilesRef = useRef(newFiles)
  newFilesRef.current = newFiles
  useEffect(() => {
    return () => newFilesRef.current.forEach((f) => URL.revokeObjectURL(f.previewUrl))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim() || !form.price) {
      setError('Name and price are required.')
      return
    }

    setSaving(true)
    try {
      const productRef = isEditing ? doc(db, 'products', id) : doc(collection(db, 'products'))
      const productId = productRef.id

      // Delete images the admin removed from an existing product. ref() itself
      // throws (synchronously) for URLs that aren't valid Firebase Storage
      // URLs — e.g. seeded products using external Unsplash URLs — so this
      // needs its own try/catch rather than just chaining .catch().
      await Promise.all(
        removedImageUrls.map(async (url) => {
          try {
            await deleteObject(ref(storage, url))
          } catch {
            // Invalid URL, already gone, or unreachable — not fatal to the save.
          }
        })
      )

      // Upload any newly-added files.
      const uploadedUrls = await Promise.all(
        newFiles.map(async ({ file }) => {
          const path = `products/${productId}/${Date.now()}-${file.name}`
          const fileRef = ref(storage, path)
          await uploadBytes(fileRef, file)
          return getDownloadURL(fileRef)
        })
      )

      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        sizes: form.sizes,
        stock: form.stock,
        description: form.description,
        materials: form.materials,
        images: [...form.images, ...uploadedUrls],
        featured: form.featured,
        new: form.isNew,
      }

      if (isEditing) {
        await updateDoc(productRef, payload)
      } else {
        // createdAt is set once, here, and never touched by later edits —
        // it's the "uploaded" date the storefront sorts newest-first by.
        await setDoc(productRef, { ...payload, createdAt: serverTimestamp() })
      }

      navigate('/products')
    } catch (err) {
      setError(err.message || 'Failed to save product.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-white/40 font-['Space_Grotesk'] text-sm">Loading…</p>
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-white text-2xl">
          {isEditing ? 'Edit Product' : 'New Product'}
        </h1>
        <Link to="/products" className="text-white/40 hover:text-white font-['Space_Grotesk'] text-sm">
          ← Back to Products
        </Link>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 border border-[#c81e1e]/40 bg-[#c81e1e]/10">
          <p className="text-[#c81e1e] font-['Space_Grotesk'] text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-2">
            <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
              Name *
            </label>
            <input
              type="text"
              className="input-dark"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
              Price *
            </label>
            <input
              type="number"
              min="0"
              step="1"
              className="input-dark"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
            Sizes
          </label>
          <div className="flex flex-wrap gap-2">
            {SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleToggleSize(size)}
                className={`min-w-[48px] px-3 py-2 font-['Space_Grotesk'] text-sm transition-colors ${
                  form.sizes.includes(size)
                    ? 'bg-[#c81e1e] text-white'
                    : 'border border-white/15 text-white/50 hover:border-white/40 hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {form.sizes.length > 0 && (
          <div>
            <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
              Stock per size
            </label>
            <div className="grid grid-cols-4 gap-3">
              {form.sizes.map((size) => (
                <div key={size}>
                  <span className="block text-white/40 font-['Space_Grotesk'] text-xs mb-1">{size}</span>
                  <input
                    type="number"
                    min="0"
                    className="input-dark"
                    value={form.stock[size] ?? 0}
                    onChange={(e) => handleStockChange(size, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
            Description
          </label>
          <textarea
            className="input-dark"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
            Materials
          </label>
          <textarea
            className="input-dark"
            rows={2}
            value={form.materials}
            onChange={(e) => setForm((f) => ({ ...f, materials: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
            Images
          </label>
          <div className="flex flex-wrap gap-3 mb-3">
            {form.images.map((url) => (
              <div key={url} className="relative">
                <img src={url} alt="" className="w-20 h-24 object-cover bg-white/5" />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(url)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-[#c81e1e] text-white text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
            {newFiles.map(({ previewUrl }, i) => (
              <div key={i} className="relative">
                <img
                  src={previewUrl}
                  alt=""
                  className="w-20 h-24 object-cover bg-white/5 opacity-60"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                  new
                </span>
              </div>
            ))}
          </div>
          <input type="file" accept="image/*" multiple onChange={handleAddFiles} className="text-white/60 text-sm" />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-white/60 font-['Space_Grotesk'] text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-white/60 font-['Space_Grotesk'] text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.isNew}
              onChange={(e) => setForm((f) => ({ ...f, isNew: e.target.checked }))}
            />
            New Arrival
          </label>
        </div>

        <button type="submit" disabled={saving} className="btn-primary self-start px-8 py-3">
          {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Product'}
        </button>
      </form>
    </div>
  )
}

export default ProductForm
