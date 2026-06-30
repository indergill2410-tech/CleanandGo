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
          bg:        '#EFF7FC',
          surface:   '#F8FBFF',
          primary:   '#0B3558',
          accent:    '#1D7ED0',
          highlight: '#7DD3FC',
          gold:      '#F5C84C',
          text:      '#0B3558',
          muted:     '#60798F',
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
