import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { doc, getDoc, setDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../lib/firebase'

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38']

const EMPTY_FORM = {
  name: '',
  price: '',
  colors: [], // { name, hex, image } — image is a URL, or "newFile:<index>" until upload resolves it
  sizes: [],
  // Stock grid keyed by colorIndex|size (e.g. "0|M"), or plain size when there
  // are no colors. Indexed rather than keyed by color name so renaming/removing
  // a color mid-edit doesn't silently lose already-entered stock numbers.
  stock: {},
  description: '',
  materials: '',
  images: [],
  featured: false,
  isNew: false,
}

const gridKey = (colorIdx, size) => (colorIdx === null || colorIdx === undefined ? size : `${colorIdx}|${size}`)

// Recomputes the full set of stock grid keys for the current colors/sizes,
// preserving any values that already exist for keys that still apply.
const rebuildStock = (colors, sizes, prevStock) => {
  const keys =
    colors.length > 0
      ? colors.flatMap((_, idx) => sizes.map((s) => gridKey(idx, s)))
      : sizes.map((s) => gridKey(null, s))
  return Object.fromEntries(keys.map((k) => [k, prevStock[k] ?? 0]))
}

const ProductForm = () => {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [customSize, setCustomSize] = useState('')
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
      const colors = data.colors ?? []
      const sizes = data.sizes ?? []
      const savedStock = data.stock ?? {}

      // Saved stock is keyed by color NAME; the form's grid is keyed by
      // color INDEX — convert on the way in.
      const stock = {}
      if (colors.length > 0) {
        colors.forEach((c, idx) => {
          sizes.forEach((s) => {
            stock[gridKey(idx, s)] = savedStock[`${c.name}|${s}`] ?? 0
          })
        })
      } else {
        sizes.forEach((s) => {
          stock[s] = savedStock[s] ?? 0
        })
      }

      setForm({
        name: data.name ?? '',
        price: data.price ?? '',
        colors,
        sizes,
        stock,
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
      return { ...f, sizes, stock: rebuildStock(f.colors, sizes, f.stock) }
    })
  }

  const handleAddCustomSize = () => {
    const size = customSize.trim()
    if (!size) return
    setForm((f) => {
      if (f.sizes.includes(size)) return f
      const sizes = [...f.sizes, size]
      return { ...f, sizes, stock: rebuildStock(f.colors, sizes, f.stock) }
    })
    setCustomSize('')
  }

  const handleStockChange = (colorIdx, size, value) => {
    setForm((f) => ({ ...f, stock: { ...f.stock, [gridKey(colorIdx, size)]: Number(value) || 0 } }))
  }

  const handleAddColor = () => {
    setForm((f) => {
      const colors = [...f.colors, { name: '', hex: '#c81e1e', image: f.images[0] ?? '' }]
      return { ...f, colors, stock: rebuildStock(colors, f.sizes, f.stock) }
    })
  }

  const handleColorFieldChange = (idx, field, value) => {
    setForm((f) => {
      const colors = [...f.colors]
      colors[idx] = { ...colors[idx], [field]: value }
      return { ...f, colors }
    })
  }

  const handleRemoveColor = (removeIdx) => {
    setForm((f) => {
      const colors = f.colors.filter((_, i) => i !== removeIdx)
      // Re-index the stock grid: old index -> new index, dropping the removed color.
      const stock = {}
      let newIdx = 0
      f.colors.forEach((c, oldIdx) => {
        if (oldIdx === removeIdx) return
        f.sizes.forEach((s) => {
          stock[gridKey(newIdx, s)] = f.stock[gridKey(oldIdx, s)] ?? 0
        })
        newIdx++
      })
      return { ...f, colors, stock }
    })
  }

  const handleRemoveExistingImage = (url) => {
    setForm((f) => ({
      ...f,
      images: f.images.filter((u) => u !== url),
      // Clear any color that was pointing at the image we just removed.
      colors: f.colors.map((c) => (c.image === url ? { ...c, image: '' } : c)),
    }))
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
    if (form.colors.some((c) => !c.name.trim())) {
      setError('Every color needs a name.')
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

      // A color's image may point at a not-yet-uploaded file (marked
      // "newFile:<index>") — resolve those to real URLs now that upload's done.
      const resolveImage = (img) => {
        if (typeof img === 'string' && img.startsWith('newFile:')) {
          return uploadedUrls[Number(img.split(':')[1])] ?? ''
        }
        return img ?? ''
      }
      const colors = form.colors.map((c) => ({
        name: c.name.trim(),
        hex: c.hex,
        image: resolveImage(c.image),
      }))

      // Convert the index-keyed grid back into the name-keyed map Firestore stores.
      const stock = {}
      if (colors.length > 0) {
        colors.forEach((c, idx) => {
          form.sizes.forEach((s) => {
            stock[`${c.name}|${s}`] = form.stock[gridKey(idx, s)] ?? 0
          })
        })
      } else {
        form.sizes.forEach((s) => {
          stock[s] = form.stock[gridKey(null, s)] ?? 0
        })
      }

      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        colors,
        sizes: form.sizes,
        stock,
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

  // All pickable images for the color-image chooser: existing uploaded URLs
  // plus not-yet-uploaded new files (referenced by "newFile:<index>" until saved).
  const pickableImages = [
    ...form.images.map((url) => ({ key: url, src: url })),
    ...newFiles.map((f, i) => ({ key: `newFile:${i}`, src: f.previewUrl })),
  ]

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
          <div className="flex flex-wrap gap-2 mb-3">
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
            {form.sizes
              .filter((s) => !SIZE_OPTIONS.includes(s))
              .map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleToggleSize(size)}
                  className="min-w-[48px] px-3 py-2 font-['Space_Grotesk'] text-sm bg-[#c81e1e] text-white"
                >
                  {size}
                </button>
              ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="input-dark max-w-[160px]"
              placeholder='Custom, e.g. "30x32"'
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddCustomSize()
                }
              }}
            />
            <button type="button" onClick={handleAddCustomSize} className="btn-outline px-4">
              Add
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest">
              Colors
            </label>
            <button type="button" onClick={handleAddColor} className="text-[#c81e1e] font-['Space_Grotesk'] text-xs uppercase tracking-widest hover:underline">
              + Add Color
            </button>
          </div>

          {form.colors.length === 0 ? (
            <p className="text-white/30 font-['Space_Grotesk'] text-xs">
              No colors added — this product will be treated as single-color, with stock tracked by size only.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {form.colors.map((color, idx) => (
                <div key={idx} className="border border-white/10 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) => handleColorFieldChange(idx, 'hex', e.target.value)}
                      className="w-9 h-9 bg-transparent border border-white/15 cursor-pointer flex-shrink-0"
                    />
                    <input
                      type="text"
                      className="input-dark flex-1"
                      placeholder="Color name, e.g. Black"
                      value={color.name}
                      onChange={(e) => handleColorFieldChange(idx, 'name', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(idx)}
                      className="text-white/40 hover:text-[#c81e1e] font-['Space_Grotesk'] text-xs uppercase tracking-widest flex-shrink-0"
                    >
                      Remove
                    </button>
                  </div>

                  {pickableImages.length > 0 && (
                    <>
                      <span className="block text-white/40 font-['Space_Grotesk'] text-xs mb-2">
                        Representative image
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {pickableImages.map((img) => (
                          <button
                            key={img.key}
                            type="button"
                            onClick={() => handleColorFieldChange(idx, 'image', img.key)}
                            className={`w-14 h-16 overflow-hidden flex-shrink-0 transition-all ${
                              color.image === img.key
                                ? 'ring-2 ring-[#c81e1e]'
                                : 'ring-1 ring-white/10 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={img.src} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {form.sizes.length > 0 && (
          <div>
            <label className="block text-white/50 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
              Stock {form.colors.length > 0 ? 'per color / size' : 'per size'}
            </label>

            {form.colors.length === 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {form.sizes.map((size) => (
                  <div key={size}>
                    <span className="block text-white/40 font-['Space_Grotesk'] text-xs mb-1">{size}</span>
                    <input
                      type="number"
                      min="0"
                      className="input-dark"
                      value={form.stock[gridKey(null, size)] ?? 0}
                      onChange={(e) => handleStockChange(null, size, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left pr-4 pb-2 text-white/40 font-['Space_Grotesk'] text-xs uppercase">Color</th>
                      {form.sizes.map((size) => (
                        <th key={size} className="px-2 pb-2 text-white/40 font-['Space_Grotesk'] text-xs uppercase">
                          {size}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {form.colors.map((color, idx) => (
                      <tr key={idx}>
                        <td className="pr-4 py-1 text-white font-['Space_Grotesk'] text-sm whitespace-nowrap">
                          <span
                            className="inline-block w-3 h-3 mr-2 align-middle border border-white/20"
                            style={{ backgroundColor: color.hex }}
                          />
                          {color.name || '—'}
                        </td>
                        {form.sizes.map((size) => (
                          <td key={size} className="px-2 py-1">
                            <input
                              type="number"
                              min="0"
                              className="input-dark w-20"
                              value={form.stock[gridKey(idx, size)] ?? 0}
                              onChange={(e) => handleStockChange(idx, size, e.target.value)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
