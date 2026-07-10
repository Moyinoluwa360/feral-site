import { Link } from 'react-router-dom'
import { useState } from 'react'
import { FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer className="bg-black border-t border-[#c81e1e]/60">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo2.jpeg"
                alt="FERAL"
                className="w-12 h-12 object-cover opacity-90"
                style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}
              />
              <span
                className="text-white text-2xl"
                style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700, letterSpacing: '0.15em' }}
              >
                FERAL
              </span>
            </div>
            <p className="text-white/50 font-['Space_Grotesk'] text-sm leading-relaxed max-w-xs">
              Built in the dark. Worn in the wild. Technical streetwear for those who refuse to be tamed.
            </p>
            <p
              className="text-[#c81e1e] text-xs uppercase tracking-[0.3em]"
              style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
            >
              EST. 2026 — ZERO COMPROMISE
            </p>
          </div>

          {/* Column 2: Links */}
          <div>
            <h3
              className="text-white text-lg mb-6 uppercase tracking-widest"
              style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
            >
              Navigate
            </h3>
            <ul className="flex flex-col gap-3">
              {[
                { label: 'Shop', to: '/shop' },
                { label: 'Lookbook', to: '/lookbook' },
                { label: 'About', to: '/about' },
                { label: 'Contact', to: '/contact' },
                { label: 'Cart', to: '/cart' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/50 hover:text-[#c81e1e] transition-colors font-['Space_Grotesk'] text-sm uppercase tracking-wider"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Newsletter */}
          <div>
            <h3
              className="text-white text-lg mb-2 uppercase tracking-widest"
              style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
            >
              Join The Pack
            </h3>
            <p className="text-white/40 font-['Space_Grotesk'] text-sm mb-5">
              Early access to drops. No noise.
            </p>

            {subscribed ? (
              <p
                className="text-[#c81e1e] text-sm uppercase tracking-widest"
                style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
              >
                YOU'RE IN THE PACK.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                <input
                  type="email"
                  className="input-dark"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn-primary text-sm py-3">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 px-4 md:px-8 py-5">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 font-['Space_Grotesk'] text-xs">
            &copy; {new Date().getFullYear()} FERAL. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-[#c81e1e] transition-colors"
              aria-label="Instagram"
            >
              <FiInstagram size={18} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-[#c81e1e] transition-colors"
              aria-label="Twitter"
            >
              <FiTwitter size={18} />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-[#c81e1e] transition-colors"
              aria-label="YouTube"
            >
              <FiYoutube size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
