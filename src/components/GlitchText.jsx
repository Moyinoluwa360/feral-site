import { useState } from 'react'
import { useReducedMotion } from 'framer-motion'

const GlitchText = ({
  children,
  always = false,
  outline = false,
  className = '',
  as: Tag = 'span',
  style = {},
}) => {
  const [hovered, setHovered] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const isGlitching = !shouldReduceMotion && (always || hovered)

  const baseStyle = {
    fontFamily: "'Big Shoulders Stencil', sans-serif",
    fontWeight: 700,
    textTransform: 'uppercase',
    display: 'inline-block',
    letterSpacing: '0.05em',
    ...(outline
      ? { WebkitTextStroke: '2px white', color: 'transparent' }
      : {}),
    ...(isGlitching
      ? { animation: 'glitch 0.5s steps(1) infinite' }
      : {}),
    ...style,
  }

  return (
    <Tag
      className={className}
      style={baseStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Tag>
  )
}

export default GlitchText
