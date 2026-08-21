/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', xs: '1.25rem', sm: '1.5rem', lg: '2rem', xl: '2.5rem' },
      screens: { '2xl': '1200px' },
    },
    extend: {
      // Small phones (320–420px) are a real slice of the traffic for a Diwali
      // shop, and several layouts need one step below Tailwind's `sm`.
      screens: { xs: '420px' },

      /* ------------------------------------------------------------------ *
       * Palette.
       *
       * Warm and festive, but tuned for reading rather than for spectacle:
       *
       *  - `primary` is the deep end of the ember ramp. It is what carries
       *    text and icons, so its DEFAULT clears 4.5:1 on the page background
       *    (the old #C84D0E sat at 4.31:1 and missed).
       *  - `secondary` is the bright amber the brand is recognised by. It is a
       *    fill, never a text colour — every surface painted with it pairs
       *    with `text-dark` (9.7:1) instead of white (2.4:1, which is what the
       *    previous flame gradient shipped).
       *  - `mint` / `berry` / `royal` give categories distinct identities so a
       *    grid is scannable by colour, not only by label.
       * ------------------------------------------------------------------ */
      colors: {
        bg: '#FDF3E2',
        primary: {
          DEFAULT: '#954C05',
          50: '#FFF7EA',
          100: '#FFEDD2',
          200: '#FFCB70',
          300: '#FFB238',
          400: '#FF9500',
          500: '#E67A00',
          600: '#BE6103',
          700: '#954C05',
          800: '#6F3A09',
          900: '#4A270A',
        },
        secondary: {
          DEFAULT: '#FFB238',
          50: '#FFF8EC',
          100: '#FFEFD4',
          200: '#FFDEA8',
          300: '#FFCB70',
          400: '#FFBC52',
          500: '#FFB238',
          600: '#F09A12',
          700: '#C77A06',
          800: '#955A08',
          900: '#603A08',
        },
        mint: {
          DEFAULT: '#0FAE94',
          100: '#E4FBF6',
          300: '#4FE0C8',
          400: '#22C9AE',
          500: '#0FAE94',
          700: '#0A7A6B',
          800: '#086154',
        },
        berry: {
          DEFAULT: '#DD2476',
          100: '#FFEAF1',
          300: '#FF8AA8',
          400: '#F5567F',
          500: '#DD2476',
          700: '#93154D',
          800: '#6F0F3A',
        },
        royal: {
          DEFAULT: '#A352DD',
          100: '#F6EAFF',
          300: '#DBA3FF',
          400: '#C273F5',
          500: '#A352DD',
          700: '#6F2EA3',
          800: '#542178',
        },
        dark: '#2B1408',
        gold: {
          DEFAULT: '#FFB238',
          soft: '#FFCB70',
          deep: '#E67A00',
        },
        ink: '#3D2414',
        muted: '#7A5B42',
        subtle: '#A5815D',
        card: '#FFFBF4',
        line: 'rgba(122,91,66,.16)',
        'line-strong': 'rgba(122,91,66,.30)',
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
        // Was 11px. Eyebrows, badges and stock pills all use this size, and at
        // 11px with .18em tracking they were decorative rather than legible.
        '2xs': ['0.75rem', { lineHeight: '1.05rem' }],
        // Headlines were tuned for impact (up to 5.75rem) and overran the line
        // on every screen between 640 and 1024px. These top out a third
        // smaller, which is where a headline stops being a poster and starts
        // being something you read.
        'display-sm': [
          'clamp(1.75rem,4.5vw,2.375rem)',
          { lineHeight: '1.18', letterSpacing: '-0.012em' },
        ],
        'display-md': [
          'clamp(2.125rem,5.5vw,3.125rem)',
          { lineHeight: '1.12', letterSpacing: '-0.016em' },
        ],
        'display-lg': [
          'clamp(2.375rem,6vw,3.75rem)',
          { lineHeight: '1.08', letterSpacing: '-0.02em' },
        ],
      },
      // Roughly halved. A 3rem radius on a product tile reads as a pill rather
      // than as a card, and it clips the corners of the artwork inside it.
      borderRadius: {
        xl: '0.75rem',
        '2xl': '0.875rem',
        '3xl': '1.125rem',
        '4xl': '1.375rem',
        '5xl': '1.75rem',
      },
      /* ------------------------------------------------------------------ *
       * Shadows.
       *
       * Every one of these is now a plain warm-grey drop shadow. The old set
       * layered a coloured 1px ring under a 40px orange bloom, which on a
       * cream page made buttons look lit from within and made it hard to tell
       * a hovered card from a selected one. Depth is depth; colour should
       * carry meaning.
       * ------------------------------------------------------------------ */
      boxShadow: {
        soft: '0 1px 2px rgba(61,36,20,.04), 0 6px 16px -10px rgba(61,36,20,.14)',
        card: '0 1px 2px rgba(61,36,20,.05), 0 8px 20px -14px rgba(61,36,20,.18)',
        lift: '0 10px 28px -14px rgba(61,36,20,.24), 0 2px 6px -3px rgba(61,36,20,.10)',
        glow: '0 4px 12px -6px rgba(149,76,5,.30)',
        'glow-lg': '0 8px 20px -8px rgba(149,76,5,.36)',
        gold: '0 8px 22px -14px rgba(149,76,5,.40)',
        inset: 'inset 0 1px 0 rgba(255,255,255,.7)',
      },
      backgroundImage: {
        // `flame` is the primary action fill: amber with dark text, not orange
        // with white text. See the palette note above.
        flame: 'linear-gradient(135deg,#FFCB70 0%,#FFB238 55%,#FFA51F 100%)',
        'flame-soft': 'linear-gradient(120deg,#FFE7BC 0%,#FFCB70 50%,#FFB238 100%)',
        'gold-sheen':
          'linear-gradient(100deg,transparent 20%,rgba(255,255,255,.55) 50%,transparent 80%)',
        'warm-fade': 'linear-gradient(180deg,#FDF3E2 0%,#FBEBD3 40%,#FDF3E2 100%)',
        'radial-glow': 'radial-gradient(closest-side,var(--tw-gradient-stops))',
      },
      keyframes: {
        // Idle motion is halved. A 22px bob with a 3deg rotation is hard to
        // read past, and there were six of them on the hero at once.
        float: {
          '0%,100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-8px,0)' },
        },
        'float-slow': {
          '0%,100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-12px,0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'gradient-pan': {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        // Opacity only — the scale pulse made low-stock dots twitch.
        'pulse-glow': {
          '0%,100%': { opacity: '.6' },
          '50%': { opacity: '1' },
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
        float: 'float 7s ease-in-out infinite',
        'float-slow': 'float-slow 12s ease-in-out infinite',
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
