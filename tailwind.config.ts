import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // FluxRank Brand Colors (from logo)
        brand: {
          lime: '#C2FF29',      // Primary lime green from logo
          limeLight: '#A3E635', // Secondary lime
          limeDark: '#84CC16',  // Darker lime for accents
          pink: '#EC4899',      // Hot pink from logo
          pinkLight: '#F472B6', // Lighter pink
          gray: '#D1D5DB',      // Softer light gray for text
        },
        // Dark theme colors (softer)
        dark: {
          bg: '#1A1A1A',        // Softer dark background
          surface: '#262626',   // Dark surface
          surfaceSecondary: '#404040', // Medium surface
          border: '#404040',    // Border color
        },
        // Semantic colors
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #C2FF29, 0 0 10px #C2FF29, 0 0 15px #C2FF29' },
          '100%': { boxShadow: '0 0 10px #C2FF29, 0 0 20px #C2FF29, 0 0 30px #C2FF29' },
        },
      },
    },
  },
  plugins: [],
}

export default config 