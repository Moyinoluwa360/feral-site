import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import GlitchText from '../components/GlitchText'
import ClawWatermark from '../components/ClawWatermark'
import JaggedDivider from '../components/JaggedDivider'

const PILLARS = [
  {
    label: 'QUALITY',
    desc: 'Premium materials. Constructed to last. Every piece built to be worn and lived in.',
  },
  {
    label: 'IDENTITY',
    desc: 'Raw, unapologetic, and unmistakably yours. No unnecessary noise. No chasing hype.',
  },
  {
    label: 'INSTINCT',
    desc: 'We don\'t tell you who to become. We remind you to trust what you already know.',
  },
]

const MANIFESTO_LINES = [
  'F3RAL was never created to follow trends.',
  'It was created for those who move differently.',
]

const About = () => {
  const shouldReduceMotion = useReducedMotion()

  const lineVariants = {
    hidden: { y: shouldReduceMotion ? 0 : 60, opacity: 0 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      transition: { duration: shouldReduceMotion ? 0 : 0.7, delay: shouldReduceMotion ? 0 : i * 0.2, ease: [0.16, 1, 0.3, 1] },
    }),
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16">

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4">
        {/* Product background — mobile only */}
        <div className="absolute inset-0 block md:hidden pointer-events-none">
          <img
            src="/product1.jpeg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ filter: 'brightness(0.18) contrast(1.2) saturate(1.3)' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #0a0a0a 0%, transparent 22%, transparent 78%, #0a0a0a 100%)' }} />
        </div>

        {/* Desktop watermark */}
        <div className="hidden md:block">
          <ClawWatermark position={{ top: '50%', left: '50%' }} size={680} />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[#c81e1e] font-['Space_Grotesk'] text-xs uppercase tracking-[0.4em] mb-8"
          >
            EST. 2026 — BUILT IN THE DARK
          </motion.p>

          <div className="overflow-hidden mb-4">
            {MANIFESTO_LINES.map((line, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={lineVariants}
                initial="hidden"
                animate="visible"
              >
                <GlitchText
                  as={i === 0 ? 'h1' : 'h2'}
                  className="text-white block"
                  style={{
                    fontSize: i === 0 ? 'clamp(2.2rem, 7vw, 7rem)' : 'clamp(1.6rem, 5vw, 5rem)',
                    lineHeight: 1.05,
                    letterSpacing: '0.03em',
                  }}
                  always={i === 0}
                >
                  {line}
                </GlitchText>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: 0 }}
            className="h-px bg-[#c81e1e] max-w-xs mx-auto mt-10 mb-10"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="text-white/40 font-['Space_Grotesk'] text-base md:text-lg leading-relaxed max-w-xl mx-auto"
          >
            Rooted in instinct. Driven by individuality. Built for those who refuse to be defined.
          </motion.p>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <JaggedDivider color="#111111" height={40} />
        </div>
      </section>

      {/* ── THE STORY ── */}
      <section className="bg-[#111111] py-24 px-4 md:px-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

            {/* Left — image */}
            <motion.div
              initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div
                className="relative overflow-hidden"
                style={{ clipPath: 'polygon(0 0, calc(100% - 28px) 0, 100% 28px, 100% 100%, 28px 100%, 0 calc(100% - 28px))' }}
              >
                <img
                  src="/logo1.jpeg"
                  alt="F3RAL brand"
                  className="w-full object-cover aspect-[4/5]"
                  style={{ filter: 'contrast(1.2) brightness(0.85)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#c81e1e]/10 via-transparent to-[#0a0a0a]/60" />

                {/* Corner label */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="h-px bg-[#c81e1e]/50 mb-3" />
                  <p
                    className="text-[#c81e1e] text-xs uppercase tracking-[0.3em]"
                    style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
                  >
                    F3RAL — MINDSET OVER MAINSTREAM
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right — text */}
            <motion.div
              initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <p className="text-[#c81e1e] font-['Space_Grotesk'] text-xs uppercase tracking-[0.4em] mb-4">
                Our Story
              </p>
              <GlitchText
                as="h2"
                className="text-white mb-8"
                style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', display: 'block', lineHeight: 1 }}
              >
                THE MINDSET
              </GlitchText>

              <div className="space-y-5 font-['Space_Grotesk'] leading-relaxed">
                <p className="text-white/60 text-sm md:text-base">
                  F3RAL represents a mindset that rejects conformity. We believe the strongest statement
                  isn't made by speaking louder — it's made by staying authentic.
                </p>
                <p className="text-white/50 text-sm">
                  Every collection is designed with purpose, combining premium quality, comfort, and
                  timeless silhouettes with a raw, unapologetic identity. No unnecessary noise.
                  No chasing hype. Just pieces built to be worn, lived in, and remembered.
                </p>
                <p className="text-white/50 text-sm">
                  F3RAL is for the creators, the risk-takers, the outsiders, and everyone who refuses
                  to let the world define who they should be.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <JaggedDivider color="#111111" height={40} flip />

      {/* ── PILLARS ── */}
      <section className="py-24 px-4 md:px-8 relative overflow-hidden">
        <ClawWatermark position={{ top: '50%', right: '-5%' }} size={440} />

        <div className="max-w-screen-xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-14 text-center"
          >
            <p className="text-[#c81e1e] font-['Space_Grotesk'] text-xs uppercase tracking-[0.4em] mb-3">
              What We Stand For
            </p>
            <GlitchText
              as="h2"
              className="text-white"
              style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)', display: 'block', lineHeight: 1 }}
            >
              BUILT WITH PURPOSE
            </GlitchText>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5">
            {PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.label}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : i * 0.15 }}
                className="bg-[#0a0a0a] p-10 relative group overflow-hidden"
                style={{ clipPath: i === 0 ? 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' : 'none' }}
              >
                <div className="absolute inset-0 bg-[#c81e1e]/0 group-hover:bg-[#c81e1e]/5 transition-colors duration-500" />
                <div className="absolute top-0 left-0 w-full h-px bg-[#c81e1e]/0 group-hover:bg-[#c81e1e]/60 transition-colors duration-300" />

                <span
                  className="block text-[#c81e1e] mb-6 relative z-10"
                  style={{
                    fontFamily: "'Big Shoulders Stencil', sans-serif",
                    fontWeight: 700,
                    fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                    letterSpacing: '0.08em',
                  }}
                >
                  {pillar.label}
                </span>
                <p className="text-white/40 font-['Space_Grotesk'] text-sm leading-relaxed relative z-10 group-hover:text-white/60 transition-colors duration-300">
                  {pillar.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING STATEMENT ── */}
      <section
        className="relative py-32 px-4 md:px-8 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0000 0%, #0a0a0a 60%, #0d0000 100%)' }}
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #c81e1e 0, #c81e1e 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px',
          }}
        />

        <ClawWatermark position={{ top: '50%', left: '50%' }} size={600} />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[#c81e1e] font-['Space_Grotesk'] text-xs uppercase tracking-[0.4em] mb-8">
              The Reminder
            </p>

            <div className="space-y-4 mb-10">
              <p
                className="text-white/80 font-['Space_Grotesk'] text-lg md:text-xl leading-relaxed"
              >
                We don't tell you who to become.
              </p>
              <p
                className="text-white/60 font-['Space_Grotesk'] text-base md:text-lg leading-relaxed"
              >
                We remind you to trust your instincts.
              </p>
            </div>

            <div className="h-px bg-white/10 max-w-xs mx-auto mb-10" />

            <GlitchText
              as="p"
              className="text-[#c81e1e]"
              style={{
                fontFamily: "'Big Shoulders Stencil', sans-serif",
                fontWeight: 700,
                fontSize: 'clamp(3.5rem, 12vw, 10rem)',
                lineHeight: 0.95,
                letterSpacing: '0.05em',
                display: 'block',
              }}
              always
            >
              STAY F3RAL.
            </GlitchText>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 md:px-8 bg-[#111111] text-center">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[#c81e1e] font-['Space_Grotesk'] text-xs uppercase tracking-[0.4em] mb-4">
            For the outsiders. For the risk-takers.
          </p>
          <GlitchText
            as="h2"
            className="text-white mb-6"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', display: 'block', lineHeight: 1 }}
          >
            JOIN THE MOVEMENT
          </GlitchText>
          <p className="text-white/40 font-['Space_Grotesk'] text-sm mb-8 max-w-sm mx-auto">
            For the creators, the outsiders, and everyone who refuses to be defined.
          </p>
          <Link to="/shop" className="btn-primary text-sm">
            SHOP THE DROP
          </Link>
        </motion.div>
      </section>

    </div>
  )
}

export default About
