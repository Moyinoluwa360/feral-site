import { useEffect, useState } from 'react'
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

const Messages = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const loadMessages = async () => {
    setLoading(true)
    const snap = await getDocs(query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc')))
    setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => {
    loadMessages()
  }, [])

  const handleToggle = async (message) => {
    const opening = openId !== message.id
    setOpenId(opening ? message.id : null)

    if (opening && !message.read) {
      await updateDoc(doc(db, 'contactMessages', message.id), { read: true })
      setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, read: true } : m)))
    }
  }

  const handleDelete = async (message) => {
    if (!window.confirm('Delete this message? This cannot be undone.')) return
    setDeletingId(message.id)
    try {
      await deleteDoc(doc(db, 'contactMessages', message.id))
      setMessages((prev) => prev.filter((m) => m.id !== message.id))
    } finally {
      setDeletingId(null)
    }
  }

  const unreadCount = messages.filter((m) => !m.read).length

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <h1 className="font-display text-white text-2xl">Messages</h1>
        {unreadCount > 0 && (
          <span className="bg-[#c81e1e] text-white text-xs px-2 py-0.5 uppercase tracking-widest font-['Space_Grotesk']">
            {unreadCount} unread
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-white/40 font-['Space_Grotesk'] text-sm">Loading…</p>
      ) : messages.length === 0 ? (
        <p className="text-white/40 font-['Space_Grotesk'] text-sm">No messages yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((message) => {
            const createdAt = message.createdAt?.toDate?.()
            const dateStr = createdAt
              ? createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—'
            const isOpen = openId === message.id

            return (
              <div key={message.id} className="card overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleToggle(message)}
                  className="w-full flex items-center gap-4 p-4 text-left"
                >
                  {!message.read && (
                    <span className="w-2 h-2 rounded-full bg-[#c81e1e] flex-shrink-0" aria-label="Unread" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-['Space_Grotesk'] text-sm truncate ${message.read ? 'text-white/60' : 'text-white'}`}>
                      {message.subject || '(No subject)'}
                    </p>
                    <p className="text-white/40 font-['Space_Grotesk'] text-xs truncate">
                      {message.name} · {message.email}
                    </p>
                  </div>
                  <span className="text-white/30 font-['Space_Grotesk'] text-xs flex-shrink-0">{dateStr}</span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 border-t border-white/10 pt-4">
                    <p className="text-white/70 font-['Space_Grotesk'] text-sm leading-relaxed whitespace-pre-wrap mb-4">
                      {message.message}
                    </p>
                    <div className="flex items-center gap-4">
                      <a
                        href={`mailto:${message.email}`}
                        className="text-white/50 hover:text-white font-['Space_Grotesk'] text-xs uppercase tracking-widest"
                      >
                        Reply by Email
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(message)}
                        disabled={deletingId === message.id}
                        className="text-white/50 hover:text-[#c81e1e] font-['Space_Grotesk'] text-xs uppercase tracking-widest disabled:opacity-40"
                      >
                        {deletingId === message.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Messages
