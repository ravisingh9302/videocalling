/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        myping: {
          '0%, 100%': { border:"0px solid green" },
          '50%': { border:'15px solid green' },
        }
      }
    }
  },
  plugins: [],
}

