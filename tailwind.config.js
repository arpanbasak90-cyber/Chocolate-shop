/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chocolate: {
          50: '#fbf7f4',
          100: '#f6ece6',
          200: '#ebd7cb',
          300: '#dbbba8',
          400: '#c5957d',
          500: '#b07559',
          600: '#945b41',
          700: '#754533',
          800: '#522f23',
          900: '#341d16',
          950: '#1e0f0b',
        },
        caramel: {
          100: '#fef3e7',
          200: '#fce2c4',
          300: '#f9cb97',
          400: '#f3aa62',
          500: '#e5852f',
          600: '#ca651b',
          700: '#9e4915',
        },
        gold: {
          100: '#fdf9e7',
          200: '#f9eec2',
          300: '#f3dc8f',
          400: '#e9be4d',
          500: '#d4a017',
          600: '#b88210',
        },
        cream: {
          50: '#fefdfa',
          100: '#fdfbf5',
          200: '#faf5e8',
          300: '#f3ead3',
          400: '#e8dab5',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'chocolate-gradient': 'linear-gradient(135deg, #1e0f0b 0%, #341d16 50%, #522f23 100%)',
        'caramel-gradient': 'linear-gradient(135deg, #e5852f 0%, #ca651b 100%)',
        'gold-shimmer': 'linear-gradient(90deg, #d4a017 0%, #f3dc8f 50%, #d4a017 100%)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}

