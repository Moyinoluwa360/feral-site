import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { FiMail, FiMapPin, FiCheck } from 'react-icons/fi'
import { FaInstagram, FaTiktok } from 'react-icons/fa'
import { db } from '../lib/firebase'
import GlitchText from '../components/GlitchText'

const Contact = () => {
  const shouldReduceMotion = useReducedMotion()

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    if (!form.email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email.'
    if (!form.subject.trim()) e.subject = 'Subject is required.'
    if (!form.message.trim()) e.message = 'Message is required.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setSubmitError('')
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'contactMessages'), {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        read: false,
        createdAt: serverTimestamp(),
      })
      setSubmitted(true)
    } catch {
      setSubmitError('Failed to send. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16">
      {/* Header */}
      <div className="border-b border-white/5 py-16 px-4 md:px-8">
        <div className="max-w-screen-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[#c81e1e] font-['Space_Grotesk'] text-xs uppercase tracking-[0.4em] mb-3">
              Get In Touch
            </p>
            <GlitchText
              as="h1"
              className="text-white"
              style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', display: 'block', lineHeight: 1 }}
            >
              CONTACT
            </GlitchText>
          </motion.div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: Brand Info */}
          <motion.div
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <img
                src="/logo2.jpeg"
                alt="F3RAL"
                className="w-14 h-14 object-cover grayscale"
                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
              />
              <span
                className="text-white text-2xl"
                style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700, letterSpacing: '0.15em' }}
              >
                F3RAL
              </span>
            </div>

            <p className="text-white/40 font-['Space_Grotesk'] text-sm leading-relaxed mb-10 max-w-sm">
              We operate at the edge. Reach us for collaborations, press enquiries, wholesale, or just to say you've gone f3ral.
            </p>

            <div className="flex flex-col gap-5 mb-10">
              <div className="flex items-start gap-4">
                <FiMail size={16} className="text-[#c81e1e] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-['Space_Grotesk'] text-sm">olanrewajurauf088@gmail.com</p>
                  <p className="text-white/30 font-['Space_Grotesk'] text-xs">General enquiries</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <FiMapPin size={16} className="text-[#c81e1e] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-['Space_Grotesk'] text-sm">Lagos</p>
                  <p className="text-white/30 font-['Space_Grotesk'] text-xs">Nigeria</p>
                </div>
              </div>
            </div>

            <div>
              <p
                className="text-white/30 text-xs uppercase tracking-[0.3em] mb-4"
                style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
              >
                Follow The Pack
              </p>
              <div className="flex items-center gap-5">
                <a
                  href="https://www.tiktok.com/@f3ral_district?_r=1&_t=ZS-98uD4XQcEKd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/40 hover:text-[#c81e1e] transition-colors font-['Space_Grotesk'] text-sm"
                >
                  <FaTiktok size={18} />
                  <span>TikTok</span>
                </a>
                <a
                  href="https://www.instagram.com/f3ra_1?utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/40 hover:text-[#c81e1e] transition-colors font-['Space_Grotesk'] text-sm"
                >
                  <FaInstagram size={18} />
                  <span>Instagram</span>
                </a>
              </div>
            </div>

            {/* Decorative element */}
            <div className="mt-16 border-l-2 border-[#c81e1e] pl-6">
              <p
                className="text-white/20 text-xs uppercase tracking-[0.3em]"
                style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
              >
                Response time: 24-48 hours
              </p>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-start gap-6 py-12"
              >
                <div
                  className="w-16 h-16 bg-[#c81e1e] flex items-center justify-center"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
                >
                  <FiCheck size={28} className="text-white" />
                </div>

                <GlitchText
                  as="h2"
                  className="text-white"
                  style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', display: 'block', lineHeight: 1 }}
                >
                  MESSAGE SENT.
                </GlitchText>
                <p className="text-[#c81e1e] font-['Big_Shoulders_Stencil'] font-bold text-sm uppercase tracking-widest">
                  WE'LL BE IN TOUCH.
                </p>
                <p className="text-white/40 font-['Space_Grotesk'] text-sm">
                  Expect a response within 24-48 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-outline text-sm mt-4"
                >
                  SEND ANOTHER
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                {submitError && (
                  <div className="px-4 py-3 border border-[#c81e1e]/40 bg-[#c81e1e]/10">
                    <p className="text-[#c81e1e] font-['Space_Grotesk'] text-sm">{submitError}</p>
                  </div>
                )}
                <div>
                  <label className="block text-white/40 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    className={`input-dark ${errors.name ? 'border-[#c81e1e]' : ''}`}
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange('name')}
                  />
                  {errors.name && (
                    <p className="text-[#c81e1e] font-['Space_Grotesk'] text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white/40 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className={`input-dark ${errors.email ? 'border-[#c81e1e]' : ''}`}
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange('email')}
                  />
                  {errors.email && (
                    <p className="text-[#c81e1e] font-['Space_Grotesk'] text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white/40 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    className={`input-dark ${errors.subject ? 'border-[#c81e1e]' : ''}`}
                    placeholder="What's this about?"
                    value={form.subject}
                    onChange={handleChange('subject')}
                  />
                  {errors.subject && (
                    <p className="text-[#c81e1e] font-['Space_Grotesk'] text-xs mt-1">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white/40 font-['Space_Grotesk'] text-xs uppercase tracking-widest mb-2">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    className={`input-dark resize-none ${errors.message ? 'border-[#c81e1e]' : ''}`}
                    placeholder="Tell us what you need..."
                    value={form.message}
                    onChange={handleChange('message')}
                  />
                  {errors.message && (
                    <p className="text-[#c81e1e] font-['Space_Grotesk'] text-xs mt-1">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-sm py-4 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'SENDING…' : 'SEND MESSAGE'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Contact
