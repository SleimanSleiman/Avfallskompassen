/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Arial', 'sans-serif'],
      },
      fontWeight: {
        'black': '900',
      },
      colors: {
        nsr: {
          teal: '#007788',     // top bar
          tealDark: '#003F44', // dark strip (a bit darker)
          sky: '#E6F6F7',      // pale background accent
          ink: '#0B1F22',      // text color
          accent: '#e8c222',   // accent color for buttons
        },
      },
      boxShadow: {
        soft: '0 8px 24px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}