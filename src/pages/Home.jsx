import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'
import MarqueeBanner from '../components/MarqueeBanner'
import ClawWatermark from '../components/ClawWatermark'
import JaggedDivider from '../components/JaggedDivider'
import GlitchText from '../components/GlitchText'
import SEOHead from '../components/SEOHead'

// product1 = black/red, product2 = charcoal/silver
const HERO_IMAGES = ['/product1.jpeg', '/product2.jpeg']

const HeroPanel = ({ side, src, variant }) => {
  const isLeft = side === 'left'
  // filter: darken the white background so it blends into the dark page
  const colorFilter = src === '/product1.jpeg'
    ? 'brightness(0.22) contrast(1.25) saturate(1.6)'  // keep red warmth
    : 'brightness(0.22) contrast(1.25) saturate(0.55)'  // stay monochrome

  const innerGrad = isLeft
    ? 'linear-gradient(to right, #0a0a0a 2%, transparent 28%, transparent 42%, #0a0a0a 100%)'
    : 'linear-gradient(to left,  #0a0a0a 2%, transparent 28%, transparent 42%, #0a0a0a 100%)'
  const vignetteGrad = 'linear-gradient(to bottom, #0a0a0a 0%, transparent 18%, transparent 82%, #0a0a0a 100%)'

  return (
    <div className={`absolute top-0 bottom-0 w-[44%] overflow-hidden hidden lg:block ${isLeft ? 'left-0' : 'right-0'}`}>
      <AnimatePresence mode="sync">
        <motion.img
          key={`${side}-${variant}`}
          src={src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1.13 }}
          exit={{ opacity: 0, scale: 1.0 }}
          transition={{
            opacity: { duration: 2.0, ease: 'easeInOut' },
            scale: { duration: 9, ease: 'linear' },
          }}
          style={{ filter: colorFilter }}
        />
      </AnimatePresence>
      {/* Gradient: blend inner edge + outer edge into page dark */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: innerGrad }} />
      {/* Top / bottom vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: vignetteGrad }} />
    </div>
  )
}

const Home = () => {
  const shouldReduceMotion = useReducedMotion()
  const { products } = useProducts()
  // Always the 5 most-recently-uploaded products — not gated by the
  // "Featured" flag, so this doesn't depend on how many products happen to
  // be marked featured.
  const featuredProducts = useMemo(
    () =>
      [...products]
        .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
        .slice(0, 5),
    [products]
  )
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [heroVariant, setHeroVariant] = useState(0)

  // swap which product appears on which side every 7 seconds
  useEffect(() => {
    if (shouldReduceMotion) return
    const id = setInterval(() => setHeroVariant(v => 1 - v), 7000)
    return () => clearInterval(id)
  }, [shouldReduceMotion])

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    if (email.trim()) {
      setSubmitted(true)
      setEmail('')
    }
  }

  const lineVariants = {
    hidden: { y: shouldReduceMotion ? 0 : 80, opacity: 0 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      transition: { duration: shouldReduceMotion ? 0 : 0.7, delay: shouldReduceMotion ? 0 : i * 0.25, ease: [0.16, 1, 0.3, 1] },
    }),
  }

  return (
    <>
    <SEOHead path="/" />
    <div className="bg-[#0a0a0a]">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Product image panels — background atmosphere */}
        {!shouldReduceMotion && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Desktop: two side panels */}
            <HeroPanel
              side="left"
              src={heroVariant === 0 ? HERO_IMAGES[1] : HERO_IMAGES[0]}
              variant={heroVariant}
            />
            <HeroPanel
              side="right"
              src={heroVariant === 0 ? HERO_IMAGES[0] : HERO_IMAGES[1]}
              variant={heroVariant}
            />
            {/* Mobile: single full-bleed image */}
            <div className="absolute inset-0 block lg:hidden">
              <AnimatePresence mode="sync">
                <motion.img
                  key={`mobile-bg-${heroVariant}`}
                  src={HERO_IMAGES[1 - heroVariant]}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ opacity: { duration: 2.0, ease: 'easeInOut' } }}
                  style={{ filter: 'brightness(0.18) contrast(1.2) saturate(1.3)' }}
                />
              </AnimatePresence>
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #0a0a0a 0%, transparent 22%, transparent 78%, #0a0a0a 100%)' }} />
            </div>
          </div>
        )}

        {/* Marquee background */}
        <div className="absolute inset-0 flex flex-col justify-center pointer-events-none">
          <MarqueeBanner opacity={0.05} fontSize="8rem" />
        </div>

        {/* Claw watermark — shifted left slightly so it doesn't clash with right panel */}
        <ClawWatermark position={{ top: '55%', right: '15%' }} size={480} />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[#c81e1e] font-['Space_Grotesk'] text-xs uppercase tracking-[0.4em] mb-3 md:mb-6"
          >
            DROP 001 — LIMITED EDITION
          </motion.p>

          <div className="overflow-hidden mb-2">
            {[
              {
                text: 'WEAR THE',
                style: {
                  fontSize: 'clamp(4rem, 14vw, 160px)',
                  WebkitTextStroke: '2px white',
                  color: 'transparent',
                  letterSpacing: '0.02em',
                  lineHeight: 0.95,
                },
                always: false,
              },
              {
                text: 'WILD',
                style: {
                  fontSize: 'clamp(5rem, 18vw, 200px)',
                  color: 'white',
                  letterSpacing: '0.02em',
                  lineHeight: 0.9,
                },
                always: true,
              },
            ].map(({ text, style, always }, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={lineVariants}
                initial="hidden"
                animate="visible"
              >
                <GlitchText
                  as="h1"
                  className="leading-none block"
                  style={style}
                  always={always}
                >
                  {text}
                </GlitchText>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-white/40 font-['Space_Grotesk'] text-sm md:text-base uppercase tracking-[0.3em] mt-4 mb-6 md:mt-8 md:mb-10"
          >
            Technical streetwear. Unapologetically f3ral.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 1.0 }}
          >
            <Link
              to="/shop"
              className="btn-primary text-base md:text-lg animate-pulse-red inline-flex"
              style={{ letterSpacing: '0.25em' }}
            >
              SHOP THE DROP
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-white/20 font-['Space_Grotesk'] text-[10px] uppercase tracking-[0.3em]">
            Scroll
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </section>

      {/* ── FEATURED DROPS ── */}
      <div className="relative">
        <JaggedDivider color="#111111" height={40} />

        <section className="bg-[#111111] py-12 md:py-20 px-4 md:px-8">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex items-end justify-between mb-7 md:mb-12">
              <div>
                <p className="text-[#c81e1e] font-['Space_Grotesk'] text-xs uppercase tracking-[0.4em] mb-2">
                  Curated Selection
                </p>
                <GlitchText
                  as="h2"
                  className="text-white"
                  style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '0.05em' }}
                >
                  FEATURED DROPS
                </GlitchText>
              </div>
              <Link
                to="/shop"
                className="hidden md:flex items-center gap-2 text-white/40 hover:text-[#c81e1e] transition-colors font-['Space_Grotesk'] text-sm uppercase tracking-wider"
              >
                View All &rarr;
              </Link>
            </div>

            {/* Mobile: horizontal scroll */}
            <div className="md:hidden relative">
              <div
                className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {featuredProducts.map((product, i) => (
                  <div key={product.id} className="flex-none w-[80vw] max-w-[280px]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              {/* Scroll indicator */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="w-8 h-px bg-white/20" />
                <span className="text-white/30 font-['Space_Grotesk'] text-[10px] uppercase tracking-[0.25em]">swipe</span>
                <div className="w-8 h-px bg-white/20" />
              </div>
              {/* Right fade hint */}
              <div className="absolute top-0 right-0 bottom-4 w-12 pointer-events-none bg-gradient-to-l from-[#111111] to-transparent" />
            </div>

            {/* Desktop: grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-5">
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : i * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link to="/shop" className="btn-outline text-sm">
                View All Drops
              </Link>
            </div>
          </div>
        </section>

        <JaggedDivider color="#111111" height={40} flip />
      </div>

      {/* ── BRAND STORY TEASER ── */}
      <section className="relative py-14 md:py-24 px-4 md:px-8 overflow-hidden">
        <ClawWatermark position={{ top: '50%', left: '50%' }} size={500} />

        <div className="max-w-screen-xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div
                className="relative overflow-hidden"
                style={{ clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))' }}
              >
                <img
                  src="/logo2.jpeg"
                  alt="F3RAL brand mark"
                  className="w-full max-w-sm mx-auto object-cover"
                  style={{ filter: 'contrast(1.2) brightness(0.9)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-60" />
              </div>

              <div className="absolute bottom-6 left-6">
                <p
                  className="text-[#c81e1e] text-xs uppercase tracking-[0.4em]"
                  style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
                >
                  F3RAL — EST. 2026
                </p>
              </div>
            </motion.div>

            {/* Right */}
            <motion.div
              initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <p className="text-[#c81e1e] font-['Space_Grotesk'] text-xs uppercase tracking-[0.4em] mb-4">
                The Manifesto
              </p>
              <GlitchText
                as="h2"
                className="text-white mb-6"
                style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', display: 'block', lineHeight: 1 }}
              >
                WE ARE F3RAL
              </GlitchText>
              <p className="text-white/50 font-['Space_Grotesk'] text-base leading-relaxed mb-4">
                F3RAL represents a mindset that rejects conformity. Rooted in instinct and driven by individuality — we don't make clothes for comfort zones.
              </p>
              <p className="text-white/40 font-['Space_Grotesk'] text-sm leading-relaxed mb-8">
                Every piece built to be worn, lived in, and remembered. No unnecessary noise. No chasing hype. Just raw, unapologetic identity.
              </p>
              <Link to="/about" className="btn-outline text-sm">
                Read Our Story
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── EMAIL SIGNUP ── */}
      <section
        className="relative py-14 md:py-24 px-4 md:px-8 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0000 0%, #0a0a0a 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #c81e1e 0, #c81e1e 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="max-w-2xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#c81e1e] font-['Space_Grotesk'] text-xs uppercase tracking-[0.4em] mb-4">
              Exclusive Access
            </p>
            <GlitchText
              as="h2"
              className="text-white mb-4"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', display: 'block', lineHeight: 1 }}
            >
              JOIN THE PACK
            </GlitchText>
            <p className="text-white/40 font-['Space_Grotesk'] text-sm mb-10">
              First access to drops. No spam. No noise. Just raw signal.
            </p>

            {submitted ? (
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[#c81e1e] font-['Big_Shoulders_Stencil'] font-bold text-2xl uppercase tracking-widest"
              >
                YOU'RE IN THE PACK.
              </motion.p>
            ) : (
              <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  className="input-dark flex-1"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn-primary whitespace-nowrap">
                  JOIN NOW
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
    </>
  )
}

export default Home
