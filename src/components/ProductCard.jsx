import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { CURRENCY_SYMBOL } from '../lib/shipping'

const ProductCard = ({ product }) => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div
        className="relative overflow-hidden bg-[#111111]"
        style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}
      >
        {/* Image */}
        <div className="relative overflow-hidden aspect-[3/4]">
          <motion.img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            whileHover={
              shouldReduceMotion
                ? {}
                : { scale: 1.05, skewX: -1 }
            }
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-[#c81e1e]/0 group-hover:bg-[#c81e1e]/10 transition-colors duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.new && (
              <span
                className="bg-[#c81e1e] text-white text-[10px] px-2 py-0.5 uppercase tracking-widest"
                style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
              >
                New
              </span>
            )}
            {product.featured && (
              <span
                className="bg-white/10 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 uppercase tracking-widest border border-white/20"
                style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
              >
                Featured
              </span>
            )}
          </div>

          {/* Shop Now on hover */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-black/80 backdrop-blur-sm py-3 text-center">
            <span
              className="text-[#c81e1e] text-sm uppercase tracking-widest"
              style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
            >
              Shop Now
            </span>
          </div>
        </div>

        {/* Card info */}
        <div className="p-4">
          <h3
            className="text-white text-base uppercase tracking-wide group-hover:text-[#c81e1e] transition-colors duration-200 leading-tight"
            style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
          >
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-white/60 font-['Space_Grotesk'] text-sm">
              {CURRENCY_SYMBOL}{product.price.toLocaleString()}
            </span>
          </div>

          {product.colors?.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              {product.colors.slice(0, 5).map((color) => (
                <span
                  key={color.name}
                  title={color.name}
                  className="w-3.5 h-3.5 rounded-full ring-1 ring-white/20 flex-shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
              ))}
              {product.colors.length > 5 && (
                <span className="text-white/30 font-['Space_Grotesk'] text-[10px]">
                  +{product.colors.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
