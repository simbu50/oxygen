/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 50: '#f0f5fa', 600: '#0A2540', 700: '#061A30', 900: '#020F1E' },
        teal: { 500: '#00A6A6', 600: '#087E7E' },
        gold: { 500: '#F5B544', 600: '#D89B2D' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
