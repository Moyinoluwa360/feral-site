import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import GlitchText from '../components/GlitchText'

const NotFound = () => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="/logo2.jpeg"
          alt=""
          aria-hidden="true"
          className="w-[60vw] max-w-2xl opacity-[0.04] grayscale"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center"
      >
        <GlitchText
          as="h1"
          className="text-white/30"
          style={{
            fontSize: 'clamp(6rem, 20vw, 16rem)',
            display: 'block',
            lineHeight: 0.9,
            letterSpacing: '-0.02em',
          }}
          always={!shouldReduceMotion}
        >
          404
        </GlitchText>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <GlitchText
            as="h2"
            className="text-white mb-4"
            style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)', display: 'block', lineHeight: 1 }}
          >
            YOU'VE GONE FERAL
          </GlitchText>

          <p className="text-white/30 font-['Space_Grotesk'] text-sm mb-10 max-w-xs mx-auto">
            This page doesn't exist. You wandered too far. We like that.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn-primary text-sm">
              RETURN TO BASE
            </Link>
            <Link to="/shop" className="btn-outline text-sm">
              SHOP THE DROP
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Corner accents */}
      <div className="absolute top-20 left-4 w-16 h-16 border-t border-l border-[#c81e1e]/20 pointer-events-none" />
      <div className="absolute top-20 right-4 w-16 h-16 border-t border-r border-[#c81e1e]/20 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b border-l border-[#c81e1e]/20 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b border-r border-[#c81e1e]/20 pointer-events-none" />
    </div>
  )
}

export default NotFound
