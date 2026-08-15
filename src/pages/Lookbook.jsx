import { motion, useReducedMotion } from 'framer-motion'
import { useLookbookImages } from '../hooks/useLookbookImages'
import GlitchText from '../components/GlitchText'
import ClawWatermark from '../components/ClawWatermark'
import SEOHead from '../components/SEOHead'

const ImageCard = ({ image, index, shouldReduceMotion }) => {
  return (
    <motion.div
      className="relative group overflow-hidden col-span-1"
      style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: shouldReduceMotion ? 0 : (index % 4) * 0.1 }}
    >
      <div className="overflow-hidden aspect-[3/4]">
        <motion.img
          src={image.url}
          alt={image.caption || `Lookbook ${index + 1}`}
          className="w-full h-full object-cover"
          loading="lazy"
          whileHover={shouldReduceMotion ? {} : { scale: 1.06 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        {/* Red overlay on hover */}
        <div className="absolute inset-0 bg-[#c81e1e]/0 group-hover:bg-[#c81e1e]/15 transition-colors duration-400 pointer-events-none" />
      </div>

      {/* Caption */}
      {image.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent py-4 px-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p
            className="text-white text-xs uppercase tracking-[0.3em]"
            style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
          >
            {image.caption}
          </p>
        </div>
      )}

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
  const { images, loading } = useLookbookImages()

  return (
    <>
      <SEOHead
        title="Lookbook"
        description="F3RAL editorial lookbook — shot on location. No retouching. No compromise."
        path="/lookbook"
      />
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
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white/3 animate-pulse aspect-[3/4]"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}
                />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-24">
              <p
                className="text-white/20 text-4xl uppercase mb-4"
                style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
              >
                COMING SOON
              </p>
              <p className="text-white/30 font-['Space_Grotesk'] text-sm">
                The lookbook is being shot right now.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((image, i) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  index={i}
                  shouldReduceMotion={shouldReduceMotion}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 pb-16 text-center">
          <p className="text-white/15 font-['Big_Shoulders_Stencil'] font-bold text-xs uppercase tracking-[0.5em]">
            F3RAL — DROP 001 — VISUAL FIELD
          </p>
        </div>
      </div>
    </>
  )
}

export default Lookbook
