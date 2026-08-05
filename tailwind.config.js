/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', xs: '1.25rem', sm: '1.5rem', lg: '2rem', xl: '2.5rem' },
      screens: { '2xl': '1320px' },
    },
    extend: {
      // Small phones (320–420px) are a real slice of the traffic for a Diwali
      // shop, and several layouts need one step below Tailwind's `sm`.
      screens: { xs: '420px' },
      colors: {
        bg: '#FFF7EC',
        primary: {
          DEFAULT: '#C84D0E',
          50: '#FDF2E9',
          100: '#FADFC7',
          200: '#F5BE93',
          300: '#EE9A60',
          400: '#E2762F',
          500: '#C84D0E',
          600: '#A63E0A',
          700: '#7F2F08',
          800: '#571F05',
          900: '#331203',
        },
        secondary: {
          DEFAULT: '#FF8A00',
          50: '#FFF4E5',
          100: '#FFE4BF',
          200: '#FFCE85',
          300: '#FFB44B',
          400: '#FF9E1E',
          500: '#FF8A00',
          600: '#DB6F00',
          700: '#A85400',
          800: '#743A00',
          900: '#452200',
        },
        dark: '#2C0F05',
        gold: {
          DEFAULT: '#FFD56A',
          soft: '#FFE9AE',
          deep: '#E5B23C',
        },
        ink: '#3B1F14',
        muted: '#806253',
        card: '#FFFFFF',
        line: 'rgba(255,180,70,.25)',
        'line-strong': 'rgba(200,77,14,.18)',
      },
      fontFamily: {
        // The *Fallback* families are metric-matched (see globals.css) so the
        // webfont swap does not reflow the page.
        display: ['"Playfair Display Variable"', 'Playfair Fallback', 'Georgia', 'serif'],
        sans: [
          '"Inter Variable"',
          'Inter Fallback',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        'display-sm': ['clamp(2rem,6vw,2.75rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(2.5rem,7vw,4rem)', { lineHeight: '1.04', letterSpacing: '-0.025em' }],
        'display-lg': ['clamp(3rem,8.5vw,5.75rem)', { lineHeight: '0.98', letterSpacing: '-0.03em' }],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(90,40,10,.06), 0 12px 32px -12px rgba(90,40,10,.10)',
        card: '0 1px 2px rgba(90,40,10,.04), 0 8px 24px -12px rgba(120,55,15,.18)',
        lift: '0 18px 48px -18px rgba(140,60,15,.32), 0 4px 12px -6px rgba(140,60,15,.16)',
        glow: '0 0 0 1px rgba(255,213,106,.35), 0 10px 40px -8px rgba(255,138,0,.45)',
        'glow-lg': '0 0 0 1px rgba(255,213,106,.45), 0 18px 60px -10px rgba(255,138,0,.55)',
        gold: '0 12px 40px -12px rgba(229,178,60,.55)',
        inset: 'inset 0 1px 0 rgba(255,255,255,.7)',
      },
      backgroundImage: {
        'flame': 'linear-gradient(115deg,#FF8A00 0%,#C84D0E 55%,#A63E0A 100%)',
        'flame-soft': 'linear-gradient(120deg,#FFD56A 0%,#FF8A00 48%,#C84D0E 100%)',
        'gold-sheen': 'linear-gradient(100deg,transparent 20%,rgba(255,255,255,.55) 50%,transparent 80%)',
        'warm-fade': 'linear-gradient(180deg,#FFF7EC 0%,#FFEFDC 40%,#FFF7EC 100%)',
        'radial-glow': 'radial-gradient(closest-side,var(--tw-gradient-stops))',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-14px,0)' },
        },
        'float-slow': {
          '0%,100%': { transform: 'translate3d(0,0,0) rotate(0deg)' },
          '50%': { transform: 'translate3d(0,-22px,0) rotate(3deg)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'gradient-pan': {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-glow': {
          '0%,100%': { opacity: '.55', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.06)' },
        },
        'spark-rise': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0' },
          '10%': { opacity: '1' },
          '100%': { transform: 'translateY(-140px) scale(.2)', opacity: '0' },
        },
        'draw-line': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'ripple-out': {
          '0%': { transform: 'scale(0)', opacity: '.45' },
          '100%': { transform: 'scale(2.6)', opacity: '0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 11s ease-in-out infinite',
        shimmer: 'shimmer 2.2s ease-in-out infinite',
        'gradient-pan': 'gradient-pan 12s ease infinite',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'spark-rise': 'spark-rise 3s ease-out infinite',
        marquee: 'marquee 32s linear infinite',
        'ripple-out': 'ripple-out .6s ease-out forwards',
      },
      transitionTimingFunction: {
        luxe: 'cubic-bezier(.22,1,.36,1)',
        'luxe-in': 'cubic-bezier(.62,.05,.36,1)',
      },
      transitionDuration: { 400: '400ms', 600: '600ms', 900: '900ms' },
      spacing: {
        // Height of the header at rest (announcement strip + nav bar). Used as
        // the main content offset and as the hero's viewport subtraction.
        // Defined in globals.css so it can shrink on small screens, where a
        // fixed 122px bar eats a sixth of the viewport.
        header: 'var(--header-h)',
        nav: 'var(--nav-h)',
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
