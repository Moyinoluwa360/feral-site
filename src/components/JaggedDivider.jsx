const JaggedDivider = ({ flip = false, color = '#0a0a0a', height = 32 }) => {
  const points = []
  const segments = 20
  const w = 1000
  const h = height * 2

  points.push(`0,${h}`)
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * w
    const y = i % 2 === 0 ? 0 : h
    points.push(`${x},${y}`)
  }
  points.push(`${w},${h}`)
  points.push(`0,${h}`)

  const svgStyle = {
    width: '100%',
    height: `${height}px`,
    display: 'block',
    transform: flip ? 'scaleY(-1)' : 'none',
    flexShrink: 0,
  }

  return (
    <svg
      style={svgStyle}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <polygon points={points.join(' ')} fill={color} />
    </svg>
  )
}

export default JaggedDivider
