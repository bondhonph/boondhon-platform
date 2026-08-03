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
        display: ['Noto Serif Bengali', 'serif'],
        body: ['Anek Bangla', 'Noto Sans Bengali', 'sans-serif'],
        sans: ['Anek Bangla', 'Noto Sans Bengali', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
