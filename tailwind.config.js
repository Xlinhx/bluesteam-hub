/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Canonical Living Ocean Palette (BlueSTEAM v2)
        living: {
          ivory: '#F6F3EB',
          navy: '#12384B',
          deepNavy: '#102A38',      // Deep oceanic navy (R1 & Project Spec)
          oceanicNavy: '#102A38',   // Canonical alias
          navyDeep: '#102A38',      // Canonical alias
          teal: '#17657A',
          coral: '#F67650',
          coralHover: '#e0643f',
          gold: '#E5A93C',
          sand: '#EAE4D5',
          deep: '#0B232F',
        },
        // Top-level oceanic navy aliases
        oceanicNavy: '#102A38',
        deepOceanNavy: '#102A38',
        // Semantic dynamic tokens driven by CSS variables
        surface: {
          DEFAULT: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
          interactive: 'var(--color-surface-interactive)',
          sunken: 'var(--color-surface-sunken)',
          overlay: 'var(--color-surface-overlay)',
        },
        ink: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
        },
        brand: {
          primary: 'var(--color-accent-primary)',
          secondary: 'var(--color-accent-secondary)',
          highlight: 'var(--color-accent-highlight)',
          muted: 'var(--color-accent-muted)',
        },
        borderUi: {
          soft: 'var(--color-border-soft)',
          strong: 'var(--color-border-strong)',
          focus: 'var(--color-border-focus)',
        },
        // Depth-specific palette for ocean simulations & atmosphere
        ocean: {
          navy: '#102A38',
          deepNavy: '#102A38',
          sunlit: '#1a5f7a',
          twilight: '#0c3547',
          midnight: '#071e2e',
          abyssal: '#030d17',
          hadal: '#01050a',
          biolum: '#2ee6ca',
          thermal: '#e07a5f',
          sediment: '#7d6b56',
        }
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        editorial: ['"Newsreader"', '"Noto Serif"', 'Georgia', 'serif'],
        serif: ['"Newsreader"', '"Noto Serif"', 'Georgia', 'serif'],
        playfair: ['"Playfair Display"', '"Newsreader"', 'Georgia', 'serif'],
        display: ['"Newsreader"', '"Playfair Display"', '"Noto Serif"', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      letterSpacing: {
        heading: '-0.02em',
        'tight-heading': '-0.02em',
      },
      borderRadius: {
        xs: 'var(--radius-xs, 4px)',
        sm: 'var(--radius-sm, 6px)',
        DEFAULT: 'var(--radius-md, 10px)',
        md: 'var(--radius-md, 10px)',
        lg: 'var(--radius-lg, 16px)',
        xl: 'var(--radius-xl, 20px)',
        '2xl': 'var(--radius-2xl, 24px)',
        '3xl': 'var(--radius-3xl, 28px)',
        '4xl': 'var(--radius-4xl, 32px)',
        full: '9999px',
      },
      boxShadow: {
        subtle: 'var(--shadow-subtle)',
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
        tactile: 'var(--shadow-tactile)',
        floating: 'var(--shadow-floating)',
        overlay: 'var(--shadow-overlay)',
        'glow-cyan': 'var(--shadow-glow-cyan)',
        'glow-coral': 'var(--shadow-glow-coral)',
        'glow-gold': 'var(--shadow-glow-gold)',
      },
      transitionTimingFunction: {
        tactile: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        editorial: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
};
