module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lunar: {
          50: '#e2f5e9',
          100: '#b6e6ca',
          200: '#9bc5ac',
          300: '#84a893',
          400: '#6e8d7b',
          500: '#5b7465',
          600: '#485d51',
          700: '#37483e',
          800: '#29362e',
          900: '#161f1a',
          950: '#0c120f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
