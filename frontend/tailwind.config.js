/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2322E3',
        secondary: '#2d6a4f',
        accent: '#ff6b35',
      }
    },
  },
  plugins: [],
}