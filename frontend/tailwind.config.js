/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f6f8f0',
          100: '#e8edda',
          200: '#d4ddb8',
          300: '#AFC36D', // Vert pastel doux
          400: '#8FA24A', // Vert olive clair
          500: '#636B2F', // Vert olive moyen - couleur principale
          600: '#556028',
          700: '#475221',
          800: '#3F4A1F', // Vert olive foncé
          900: '#2e3616',
        },
        secondary: {
          50: '#f4f5ee',
          100: '#e5e8d8',
          200: '#cdd3b5',
          300: '#b0b98e',
          400: '#8FA24A', // Vert olive clair
          500: '#3F4A1F', // Vert olive foncé - secondaire
          600: '#363f1b',
          700: '#2e3616',
          800: '#252c12',
          900: '#1c210d',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        border: {
          DEFAULT: '#e5e5e5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.8' },
        },
      },
    },
  },
  plugins: [],
}
