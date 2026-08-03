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
    },
  },
  plugins: [],
}
