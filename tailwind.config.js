/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        dark: {
          bg: '#0f172a',
          'bg-secondary': '#1e293b',
          'bg-tertiary': '#334155',
          text: '#f1f5f9',
          'text-secondary': '#e2e8f0',
          'text-muted': '#94a3b8',
        },
        accent: {
          cyan: '#06b6d4',
          'cyan-light': '#22d3ee',
          purple: '#a855f7',
          'purple-light': '#c084fc',
        },
      },
    },
  },
  plugins: [],
}

