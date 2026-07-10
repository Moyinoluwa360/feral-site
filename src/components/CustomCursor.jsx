import { useEffect, useState, useRef } from 'react'
import { motion, useSpring, useReducedMotion } from 'framer-motion'

const CustomCursor = () => {
  const shouldReduceMotion = useReducedMotion()
  const [isTouch, setIsTouch] = useState(false)
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 })
  const [isVisible, setIsVisible] = useState(false)

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 }
  const outerX = useSpring(-100, springConfig)
  const outerY = useSpring(-100, springConfig)

  useEffect(() => {
    if ('ontouchstart' in window) {
      setIsTouch(true)
      return
    }

    const handleMouseMove = (e) => {
      const x = e.clientX
      const y = e.clientY
      setMousePos({ x, y })
      outerX.set(x)
      outerY.set(y)
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    document.body.style.cursor = 'none'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.body.style.cursor = ''
    }
  }, [isVisible, outerX, outerY])

  if (isTouch || shouldReduceMotion) return null

  return (
    <>
      {/* Outer ring — follows with spring lag */}
      <motion.div
        style={{
          x: outerX,
          y: outerY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        className="pointer-events-none fixed top-0 left-0 z-[9999] w-10 h-10 rounded-full border border-[#c81e1e] mix-blend-difference"
      />

      {/* Inner dot — tracks precisely */}
      <div
        className="pointer-events-none fixed top-0 left-0 z-[9999] w-2 h-2 rounded-full bg-[#c81e1e]"
        style={{
          transform: `translate(calc(${mousePos.x}px - 50%), calc(${mousePos.y}px - 50%))`,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
      />
    </>
  )
}

export default CustomCursor
