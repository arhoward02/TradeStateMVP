/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0a0a0a',
          panel: '#111111',
          elevated: '#161616',
          border: '#222222',
          'border-strong': '#2a2a2a',
          text: '#ffffff',
          secondary: '#b0b0b0',
          muted: '#9a9a9a',
          accent: '#FF6B1A',
          'accent-hover': '#FF7A29',
          'accent-soft': 'rgba(255, 107, 26, 0.15)',
        },
        // Keep dark-* aliases pointing at the new system so leftover classes don't break
        dark: {
          bg: '#0a0a0a',
          'bg-secondary': '#111111',
          'bg-tertiary': '#161616',
          text: '#ffffff',
          'text-secondary': '#b0b0b0',
          'text-muted': '#9a9a9a',
        },
        accent: {
          cyan: '#FF6B1A',
          'cyan-light': '#FF7A29',
          purple: '#FF6B1A',
          'purple-light': '#FF7A29',
        },
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FF6B1A',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
      },
    },
  },
  plugins: [],
}
