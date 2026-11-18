/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#F4C542',
          'yellow-light': '#FDEEC9',
          'yellow-dark': '#D9A726',
          navy: '#111827',
          'navy-light': '#1F2937',
          'navy-card': '#1E293B',
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#64748B'
        },
        risk: {
          low: '#10B981',       // Green
          'low-bg': '#ECFDF5',
          medium: '#F59E0B',    // Orange/Amber
          'medium-bg': '#FFFBEB',
          high: '#EF4444',      // Red
          'high-bg': '#FEF2F2'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
