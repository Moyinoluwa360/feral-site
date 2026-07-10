import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

const PageTransition = ({ children }) => {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()

  const variants = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.35, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -8,
      transition: { duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeIn' },
    },
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative"
      >
        {/* Scanline sweep on entry */}
        {!shouldReduceMotion && (
          <motion.div
            className="fixed inset-0 z-[100] pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <motion.div
              className="w-full bg-[#c81e1e]/20"
              style={{ height: '2px' }}
              initial={{ top: 0, position: 'fixed' }}
              animate={{ top: '100vh' }}
              transition={{ duration: 0.4, ease: 'easeIn' }}
            />
          </motion.div>
        )}

        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default PageTransition
