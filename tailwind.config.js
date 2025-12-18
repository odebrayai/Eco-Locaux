/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#0a0a0f',
        card: '#1a1a25',
        'card-hover': '#222230',
      },
    },
  },
  plugins: [],
}
