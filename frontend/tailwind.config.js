/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#ccfbf1',
          400: '#4fd1e8',
          500: '#34C1D9',
          600: '#2db0c7',
          700: '#1A8FA3',
        }
      }
    },
  },
  plugins: [],
}
