/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#29ABE2',
          navy: '#0a1628',
          gold: '#C9A84C',
          dark: '#061020',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Hind Siliguri', 'sans-serif'],
      },
    },
  },
  plugins: [],
}