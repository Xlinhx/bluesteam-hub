import { ThemeTokens, ThemeStrategy } from '../types/variant';

// Canonical Typography Constants (BlueSTEAM v2)
export const FONT_EDITORIAL_SERIF = '"Noto Serif", "Playfair Display", Georgia, serif';
export const FONT_SANS = '"Be Vietnam Pro", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
export const FONT_MONO_EDITORIAL = '"JetBrains Mono", Menlo, Consolas, monospace';
export const FONT_MONO_TACTILE = '"SF Mono", "Roboto Mono", Menlo, Consolas, monospace';

export const EDITORIAL_TOKENS: ThemeTokens = {
  surfaceBase: '#f8f6f0',       // Warm museum ivory (Mục 26)
  surfaceElevated: '#ffffff',   // Crisp exhibit white
  surfaceInteractive: '#f0ece1',// Subtle warm stone hover
  surfaceSunken: '#eae6dc',     // Recessed shelf
  textPrimary: '#171c22',       // Graphite ink
  textSecondary: '#4a5568',     // Architectural slate
  textMuted: '#718096',         // Subdued caption
  borderSoft: '#e2ded4',        // Hairline divider
  borderStrong: '#cbc4b4',      // Framed exhibit edge
  accentPrimary: '#144566',     // Deep Oceanic Indigo
  accentSecondary: '#854d0e',   // Warm Ochre
  radiusBase: '6px',
  shadowBase: '0 2px 10px rgba(23, 28, 34, 0.04), 0 1px 3px rgba(23, 28, 34, 0.03)',
  fontHeading: FONT_EDITORIAL_SERIF,
  fontBody: FONT_SANS,
  fontMono: FONT_MONO_EDITORIAL,
};

export const TACTILE_TOKENS: ThemeTokens = {
  surfaceBase: '#1c232b',       // Deep instrument slate (Mục 27)
  surfaceElevated: '#252f3a',   // Machined bevel plate
  surfaceInteractive: '#2f3c4a',// Tactile pressed state
  surfaceSunken: '#131920',     // Inset dial groove
  textPrimary: '#f1f5f9',       // High-contrast luminous white
  textSecondary: '#94a3b8',     // Instrument slate grey
  textMuted: '#64748b',         // Dimmed meter label
  borderSoft: '#334155',        // Defined mechanical groove
  borderStrong: '#475569',      // Chamfered metal edge
  accentPrimary: '#0284c7',     // Instrument Signal Cyan
  accentSecondary: '#f59e0b',   // Cautionary Amber Dial
  radiusBase: '10px',
  shadowBase: '0 4px 14px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  fontHeading: FONT_EDITORIAL_SERIF,
  fontBody: FONT_SANS,
  fontMono: FONT_MONO_TACTILE,
};

export function applyThemeVariables(theme: ThemeStrategy, root: HTMLElement = document.documentElement) {
  const tokens = theme === 'editorial' ? EDITORIAL_TOKENS : TACTILE_TOKENS;

  root.style.setProperty('--color-surface', tokens.surfaceBase);
  root.style.setProperty('--color-surface-elevated', tokens.surfaceElevated);
  root.style.setProperty('--color-surface-interactive', tokens.surfaceInteractive);
  root.style.setProperty('--color-surface-sunken', tokens.surfaceSunken);
  root.style.setProperty(
    '--color-surface-overlay',
    theme === 'editorial' ? 'rgba(248, 246, 240, 0.96)' : 'rgba(28, 35, 43, 0.96)'
  );

  root.style.setProperty('--color-text-primary', tokens.textPrimary);
  root.style.setProperty('--color-text-secondary', tokens.textSecondary);
  root.style.setProperty('--color-text-muted', tokens.textMuted);
  root.style.setProperty('--color-text-inverse', theme === 'editorial' ? '#ffffff' : '#0f172a');

  root.style.setProperty('--color-border-soft', tokens.borderSoft);
  root.style.setProperty('--color-border-strong', tokens.borderStrong);
  root.style.setProperty('--color-border-focus', theme === 'editorial' ? '#144566' : '#38bdf8');

  root.style.setProperty('--color-accent-primary', tokens.accentPrimary);
  root.style.setProperty('--color-accent-secondary', tokens.accentSecondary);
  root.style.setProperty('--color-accent-highlight', theme === 'editorial' ? '#0284c7' : '#38bdf8');
  root.style.setProperty(
    '--color-accent-muted',
    theme === 'editorial' ? '#e0f2fe' : 'rgba(2, 132, 199, 0.15)'
  );

  root.style.setProperty('--radius-xs', '4px');
  root.style.setProperty('--radius-sm', theme === 'editorial' ? '4px' : '6px');
  root.style.setProperty('--radius-md', tokens.radiusBase);
  root.style.setProperty('--radius-lg', theme === 'editorial' ? '10px' : '16px');
  root.style.setProperty('--radius-xl', theme === 'editorial' ? '14px' : '22px');
  root.style.setProperty('--radius-2xl', theme === 'editorial' ? '20px' : '24px');
  root.style.setProperty('--radius-3xl', '28px');
  root.style.setProperty('--radius-4xl', '32px');

  root.style.setProperty(
    '--shadow-subtle',
    theme === 'editorial'
      ? '0 1px 3px rgba(18, 56, 75, 0.04), 0 2px 6px rgba(18, 56, 75, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
      : '0 2px 6px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
  );
  root.style.setProperty(
    '--shadow-card',
    theme === 'editorial'
      ? '0 4px 12px -2px rgba(18, 56, 75, 0.05), 0 12px 28px -6px rgba(18, 56, 75, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.85)'
      : '0 4px 14px rgba(0, 0, 0, 0.35), 0 1px 3px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
  );
  root.style.setProperty('--shadow-elevated', tokens.shadowBase);
  root.style.setProperty(
    '--shadow-tactile',
    theme === 'editorial'
      ? '0 4px 0 #0F3E4C, 0 12px 24px -4px rgba(18, 56, 75, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
      : '0 4px 0 #000000, 0 10px 24px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.18)'
  );
  root.style.setProperty(
    '--shadow-floating',
    theme === 'editorial'
      ? '0 20px 48px -12px rgba(16, 42, 56, 0.20), 0 8px 16px -4px rgba(16, 42, 56, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
      : '0 20px 48px rgba(0, 0, 0, 0.60), 0 4px 12px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.20)'
  );
  root.style.setProperty(
    '--shadow-overlay',
    theme === 'editorial'
      ? '0 24px 64px -12px rgba(16, 42, 56, 0.28), 0 4px 16px rgba(16, 42, 56, 0.08)'
      : '0 24px 64px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
  );
  root.style.setProperty(
    '--shadow-glow-cyan',
    theme === 'editorial'
      ? '0 0 20px -2px rgba(46, 230, 202, 0.40), 0 4px 16px rgba(23, 101, 122, 0.25)'
      : '0 0 24px rgba(46, 230, 202, 0.50), 0 0 8px rgba(46, 230, 202, 0.30)'
  );
  root.style.setProperty(
    '--shadow-glow-coral',
    theme === 'editorial'
      ? '0 0 20px -2px rgba(246, 118, 80, 0.40), 0 4px 16px rgba(201, 86, 52, 0.25)'
      : '0 0 24px rgba(246, 118, 80, 0.50), 0 0 8px rgba(246, 118, 80, 0.30)'
  );
  root.style.setProperty(
    '--shadow-glow-gold',
    theme === 'editorial'
      ? '0 0 20px -2px rgba(229, 169, 60, 0.40), 0 4px 16px rgba(180, 130, 30, 0.25)'
      : '0 0 24px rgba(229, 169, 60, 0.50), 0 0 8px rgba(229, 169, 60, 0.30)'
  );

  root.style.setProperty('--font-editorial-serif', tokens.fontHeading);
  root.style.setProperty('--font-sans', tokens.fontBody);
  root.style.setProperty('--font-mono', tokens.fontMono);
  root.style.setProperty('--tracking-heading', '-0.02em');

  if (theme === 'tactile') {
    root.classList.add('theme-tactile');
    root.classList.remove('theme-editorial');
  } else {
    root.classList.add('theme-editorial');
    root.classList.remove('theme-tactile');
  }
}

export const R2_TOKENS = {
  bg: {
    ivory: '#FAF8F5',
    sand: '#EFEAE1',
  },
  surface: {
    card: '#FFFFFF',
    oceanDeep: '#0D2230',
  },
  text: {
    primary: '#12384B',
    secondary: '#436475',
    muted: '#6B8594',
  },
  brand: {
    teal: '#15586E',
    coral: '#E0654E',
    gold: '#E89B2D',
  },
  status: {
    success: '#1F9D6A',
    warning: '#D97706',
    danger: '#DC2626',
  },
  radii: {
    card: '24px',
    panel: '28px',
    pill: '9999px',
    input: '14px',
  },
  layout: {
    headerHeight: '76px',
    maxWidthCatalog: '1360px',
    maxWidthTeacher: '1400px',
    drawerWidth: '560px',
  },
} as const;
