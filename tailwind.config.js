/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Foundation — Warm Grey
        linen: '#F4F3F1',
        parchment: '#ECEAE7',
        stone: '#DCDAD6',
        pewter: '#8F9490',
        flint: '#5E6460',
        ink: '#252220',
        
        // Brand — Forest Green (UI Only)
        forest: {
          DEFAULT: '#2D4A2D',
          dark: '#1E3320',
          light: '#3D6640',
          tint: '#EBF0EB',
        },
        
        // Gold — Premium Accent
        gold: {
          DEFAULT: '#B8973A',
          light: '#D4AF5A',
          tint: '#F7F4EA',
        },
        
        // Score Semantics
        score: {
          under: '#2D6B4A',
          even: '#8A9890',
          bogey: '#C07840',
          double: '#A84830',
        },
        
        // Strokes Gained
        sg: {
          strong: '#2D6B4A',
          gain: '#5A9E7A',
          neutral: '#B8973A',
          loss: '#C07840',
          weak: '#A84830',
        },
      },
      fontFamily: {
        // Typography — per Golf Intelligence dashboard
        display: ['"Cormorant Garamond"', 'serif'],
        mono: ['"DM Mono"', 'monospace'],
        body: ['Outfit', 'sans-serif'],
      },
      fontSize: {
        // Hero metrics
        'hero': ['60px', { lineHeight: '1', fontWeight: '300' }],
        // Stat card values
        'stat': ['38px', { lineHeight: '1', fontWeight: '400' }],
        // Heading sizes
        'h1': ['clamp(42px, 5vw, 68px)', { lineHeight: '1.05', fontWeight: '300' }],
        'h2': ['clamp(28px, 4vw, 42px)', { lineHeight: '1.15', fontWeight: '300' }],
        'h3': ['clamp(20px, 3vw, 28px)', { lineHeight: '1.2', fontWeight: '400' }],
      },
      borderRadius: {
        'card': '10px',
        'stat': '8px',
        'pill': '100px',
      },
      boxShadow: {
        'card': '0 2px 16px rgba(42,37,32,.06)',
        'stat': '0 1px 4px rgba(42,37,32,.04)',
      },
      backgroundImage: {
        'gradient-card': 'linear-gradient(160deg, #FFFFFF 0%, #FAFAF9 100%)',
        'gradient-hero': 'linear-gradient(160deg, #FFFFFF 0%, #F7F6F4 100%)',
        'gradient-forest': 'linear-gradient(135deg, #1E3320 0%, #2D4A2D 100%)',
      },
    },
  },
  plugins: [],
}
