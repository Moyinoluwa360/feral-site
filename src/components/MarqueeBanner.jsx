import { useReducedMotion } from 'framer-motion'

const MARQUEE_TEXT = 'FERAL \u2022 UNTAMED \u2022 FERAL \u2022 UNTAMED \u2022 FERAL \u2022 UNTAMED \u2022 FERAL \u2022 UNTAMED \u2022 '

const MarqueeBanner = ({ opacity = 0.18, fontSize = '6rem', className = '' }) => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div
      className={`marquee-container w-full overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
      style={{ opacity }}
    >
      <div
        className="marquee-track whitespace-nowrap"
        style={{
          animation: shouldReduceMotion ? 'none' : 'marquee 35s linear infinite',
          display: 'inline-flex',
        }}
      >
        {/* Two copies for seamless loop */}
        <span
          style={{
            fontFamily: "'Big Shoulders Stencil', sans-serif",
            fontWeight: 700,
            fontSize,
            lineHeight: 1,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'white',
          }}
        >
          {MARQUEE_TEXT}
        </span>
        <span
          style={{
            fontFamily: "'Big Shoulders Stencil', sans-serif",
            fontWeight: 700,
            fontSize,
            lineHeight: 1,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'white',
          }}
        >
          {MARQUEE_TEXT}
        </span>
      </div>
    </div>
  )
}

export default MarqueeBanner
