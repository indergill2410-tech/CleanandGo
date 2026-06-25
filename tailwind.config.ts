import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'glass',
    'glass-strong',
    'gradient-hero',
    'gradient-card',
    'gradient-cta',
    'animate-fade-up',
    'animate-fade-in',
    'animate-pulse-soft',
    'btn-primary',
    'btn-secondary',
    'card-hover',
    'delay-100','delay-200','delay-300','delay-400','delay-500',
    { pattern: /bg-(amber|green|blue|red|purple|emerald|gray)-(100|400|500|600|700)/ },
    { pattern: /text-(amber|green|blue|red|purple|emerald|gray)-(300|400|500|600|700)/ },
    { pattern: /border-(amber|green|blue|red|purple)-(400|500)\/50/ },
  ],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        brand: {
          bg:        '#F7F3EE',
          surface:   '#FEFCF9',
          primary:   '#172434',
          accent:    '#2F7D6B',
          highlight: '#8FD8B4',
          gold:      '#F2C14E',
          text:      '#172434',
          muted:     '#5F6E78',
        },
      },
      backdropBlur: { xs: '2px' },
      animation: {
        'fade-up':    'fadeUp 0.7s ease forwards',
        'fade-in':    'fadeIn 0.5s ease forwards',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'spin-slow':  'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
