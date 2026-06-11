import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm whites & beige
        ivory: '#F7F4EF',
        linen: '#EFE9E0',
        sand: '#E3D9C9',
        beige: '#D8CBB6',
        // Natural greens
        sage: '#9FB29A',
        moss: '#6E8268',
        forest: '#3C4B3A',
        // Champagne gold
        champagne: '#D8B873',
        gold: '#C7A24B',
        // Technology blues
        glacier: '#9FC2D6',
        teal: '#5E8CA0',
        midnight: '#0A0E12',
        carbon: '#11161B',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxe: '0.22em',
        wide2: '0.12em',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        silk: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '14%': { transform: 'scale(1.08)', opacity: '1' },
          '28%': { transform: 'scale(1)', opacity: '0.9' },
          '42%': { transform: 'scale(1.05)', opacity: '1' },
          '70%': { transform: 'scale(1)', opacity: '0.85' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        drift: {
          '0%': { transform: 'translate(0,0)' },
          '50%': { transform: 'translate(-2%, 2%)' },
          '100%': { transform: 'translate(0,0)' },
        },
      },
      animation: {
        heartbeat: 'heartbeat 1.6s ease-in-out infinite',
        float: 'float 7s ease-in-out infinite',
        shimmer: 'shimmer 6s linear infinite',
        drift: 'drift 18s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
