/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundColor: {
        dark: '#1a202c',
        light: '#f7fafc'
      },
      textColor: {
        dark: {
          primary: '#f7fafc',
          secondary: '#e2e8f0'
        },
        light: {
          primary: '#1a202c',
          secondary: '#4a5568'
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}