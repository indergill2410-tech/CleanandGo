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
          bg:        '#F5F0EB',
          surface:   '#FEFCF9',
          primary:   '#2C4A6E',
          accent:    '#4A7FA5',
          highlight: '#7BA7C7',
          text:      '#1C2B3A',
          muted:     '#7A8A96',
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
