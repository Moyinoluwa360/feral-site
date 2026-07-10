/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0a0a0a',
          red: '#c81e1e',
          white: '#ffffff',
          darkred: '#8a1212',
          dim: '#1a0000',
        },
      },
      fontFamily: {
        bigShoulders: ['"Big Shoulders Stencil"', 'sans-serif'],
        spaceGrotesk: ['"Space Grotesk"', 'sans-serif'],
      },
      screens: {
        xs: '480px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
      animation: {
        scanline: 'scanline 4s linear infinite',
        'pulse-red': 'pulse-red 2.5s ease-in-out infinite',
        marquee: 'marquee 35s linear infinite',
        drift: 'drift 8s ease-in-out infinite',
        glitch: 'glitch 0.5s steps(1) infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'pulse-red': {
          '0%, 100%': { boxShadow: '0 0 0px #c81e1e' },
          '50%': { boxShadow: '0 0 20px #c81e1e, 0 0 40px rgba(200,30,30,0.4)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        drift: {
          '0%, 100%': { transform: 'rotate(-3deg) translateY(0px)' },
          '50%': { transform: 'rotate(3deg) translateY(-20px)' },
        },
        glitch: {
          '0%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-3px)' },
          '40%': { transform: 'translateX(3px)' },
          '60%': { transform: 'translateX(-2px)' },
          '80%': { transform: 'translateX(2px)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
