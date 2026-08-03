import { motion, useReducedMotion } from 'framer-motion'
import GlitchText from '../components/GlitchText'
import ClawWatermark from '../components/ClawWatermark'

const LOOKBOOK_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=800&q=80',
    alt: 'Editorial 01',
    span: 'full',
    caption: 'SEASON 01 — APEX',
  },
  {
    url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
    alt: 'Editorial 02',
    span: 'half',
    caption: 'UNTAMED / OUTERWEAR',
  },
  {
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    alt: 'Editorial 03',
    span: 'half',
    caption: 'TECHNICAL SERIES',
  },
  {
    url: 'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=800&q=80',
    alt: 'Editorial 04',
    span: 'half',
    caption: 'BUILT IN THE DARK',
  },
  {
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    alt: 'Editorial 05',
    span: 'half',
    caption: 'F3RAL MOTION',
  },
  {
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
    alt: 'Editorial 06',
    span: 'full',
    caption: 'ZERO COMPROMISE',
  },
  {
    url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
    alt: 'Editorial 07',
    span: 'half',
    caption: 'EDGE TERRITORY',
  },
  {
    url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80',
    alt: 'Editorial 08',
    span: 'half',
    caption: 'PRIMAL INSTINCT',
  },
  {
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    alt: 'Editorial 09',
    span: 'half',
    caption: 'STRUCTURED CHAOS',
  },
  {
    url: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&q=80',
    alt: 'Editorial 10',
    span: 'half',
    caption: 'NOCTURNAL WEAR',
  },
  {
    url: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?w=800&q=80',
    alt: 'Editorial 11',
    span: 'half',
    caption: 'SIGNAL / NOISE',
  },
  {
    url: 'https://images.unsplash.com/photo-1520975700000-85de1327ff64?w=800&q=80',
    alt: 'Editorial 12',
    span: 'half',
    caption: 'AFTERBURN',
  },
]

const ImageCard = ({ image, index, shouldReduceMotion }) => {
  const isFull = image.span === 'full'

  return (
    <motion.div
      className={`relative group overflow-hidden ${isFull ? 'col-span-1 md:col-span-2' : 'col-span-1'}`}
      style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: shouldReduceMotion ? 0 : (index % 4) * 0.1 }}
    >
      <div className={`overflow-hidden ${isFull ? 'aspect-[21/9]' : 'aspect-[3/4]'}`}>
        <motion.img
          src={image.url}
          alt={image.alt}
          className="w-full h-full object-cover"
          whileHover={shouldReduceMotion ? {} : { scale: 1.06 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        {/* Red overlay on hover */}
        <div className="absolute inset-0 bg-[#c81e1e]/0 group-hover:bg-[#c81e1e]/15 transition-colors duration-400 pointer-events-none" />
      </div>

      {/* Caption */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent py-4 px-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <p
          className="text-white text-xs uppercase tracking-[0.3em]"
          style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
        >
          {image.caption}
        </p>
      </div>

      {/* Index number */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-white/40 font-['Space_Grotesk'] text-xs">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
    </motion.div>
  )
}

const Lookbook = () => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16">
      {/* Header */}
      <div className="relative overflow-hidden py-20 px-4 md:px-8 border-b border-white/5">
        <ClawWatermark position={{ top: '50%', left: '10%' }} size={350} />

        <div className="max-w-screen-xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[#c81e1e] font-['Space_Grotesk'] text-xs uppercase tracking-[0.4em] mb-3">
              Editorial
            </p>
            <GlitchText
              as="h1"
              className="text-white"
              style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', display: 'block', lineHeight: 1 }}
            >
              VISUAL FIELD
            </GlitchText>
            <p className="text-white/30 font-['Space_Grotesk'] text-sm mt-4 max-w-md">
              Drop 001 editorial. Shot on location. No retouching. No compromise.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LOOKBOOK_IMAGES.map((image, i) => (
            <ImageCard
              key={i}
              image={image}
              index={i}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 pb-16 text-center">
        <p className="text-white/15 font-['Big_Shoulders_Stencil'] font-bold text-xs uppercase tracking-[0.5em]">
          F3RAL — DROP 001 — VISUAL FIELD
        </p>
      </div>
    </div>
  )
}

export default Lookbook
