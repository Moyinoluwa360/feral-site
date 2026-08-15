import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const loadSubscribers = async () => {
    setLoading(true)
    const snap = await getDocs(query(collection(db, 'subscribers'), orderBy('createdAt', 'desc')))
    setSubscribers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => {
    loadSubscribers()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return subscribers
    return subscribers.filter((s) => s.email?.toLowerCase().includes(q))
  }, [subscribers, search])

  const handleDelete = async (subscriber) => {
    if (!window.confirm(`Remove ${subscriber.email} from the list?`)) return
    setDeletingId(subscriber.id)
    try {
      await deleteDoc(doc(db, 'subscribers', subscriber.id))
      setSubscribers((prev) => prev.filter((s) => s.id !== subscriber.id))
    } finally {
      setDeletingId(null)
    }
  }

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(filtered.map((s) => s.email).join(', '))
    } catch {
      // Clipboard access denied — not fatal, admin can still select manually.
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-white text-2xl">Subscribers</h1>
        {subscribers.length > 0 && (
          <button onClick={handleCopyAll} className="btn-outline px-4 py-2 text-sm">
            Copy All Emails
          </button>
        )}
      </div>

      <input
        type="text"
        className="input-dark max-w-sm mb-6"
        placeholder="Search by email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p className="text-white/40 font-['Space_Grotesk'] text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-white/40 font-['Space_Grotesk'] text-sm">No subscribers found.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-white/40 font-['Space_Grotesk'] text-xs uppercase tracking-widest">
                <th className="p-4 font-normal">Email</th>
                <th className="p-4 font-normal">Subscribed</th>
                <th className="p-4 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((subscriber) => {
                const createdAt = subscriber.createdAt?.toDate?.()
                const dateStr = createdAt
                  ? createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—'

                return (
                  <tr key={subscriber.id} className="border-b border-white/5 last:border-0">
                    <td className="p-4 text-white font-['Space_Grotesk'] text-sm">{subscriber.email}</td>
                    <td className="p-4 text-white/50 font-['Space_Grotesk'] text-sm">{dateStr}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(subscriber)}
                        disabled={deletingId === subscriber.id}
                        className="text-white/50 hover:text-[#c81e1e] font-['Space_Grotesk'] text-xs uppercase tracking-widest disabled:opacity-40"
                      >
                        {deletingId === subscriber.id ? 'Removing…' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Subscribers
