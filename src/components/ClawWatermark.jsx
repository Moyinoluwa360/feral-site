import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

const ClawWatermark = ({
  position = { top: '50%', left: '50%' },
  size = 480,
}) => {
  const ref = useRef(null)
  const shouldReduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [-60, 60])

  return (
    <div
      ref={ref}
      className="absolute pointer-events-none overflow-hidden"
      style={{
        ...position,
        transform: position.top === '50%' && position.left === '50%'
          ? 'translate(-50%, -50%)'
          : undefined,
        zIndex: 0,
      }}
    >
      <motion.div
        style={{ y }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                rotate: [-3, 3, -3],
                translateY: [0, -20, 0],
              }
        }
        transition={
          shouldReduceMotion
            ? {}
            : {
                duration: 8,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'loop',
              }
        }
      >
        <img
          src="/logo2.jpeg"
          alt=""
          aria-hidden="true"
          style={{
            width: size,
            height: size,
            objectFit: 'cover',
            opacity: 0.08,
            filter: 'grayscale(100%)',
          }}
        />
      </motion.div>
    </div>
  )
}

export default ClawWatermark
