import { describe, it, expect } from 'vitest';
import {
  FONT_EDITORIAL_SERIF,
  FONT_SANS,
  EDITORIAL_TOKENS,
  TACTILE_TOKENS,
  applyThemeVariables,
} from '../src/shared/theme/tokens';

describe('Adversarial Typography & Token Empirical Challenge (M1 Challenger 1)', () => {
  it('strictly verifies --font-editorial-serif contains Noto Serif, Playfair Display and NEVER Charter', () => {
    expect(FONT_EDITORIAL_SERIF).toContain('Noto Serif');
    expect(FONT_EDITORIAL_SERIF).toContain('Playfair Display');
    expect(FONT_EDITORIAL_SERIF.toLowerCase()).not.toContain('charter');

    expect(EDITORIAL_TOKENS.fontHeading).toBe(FONT_EDITORIAL_SERIF);
    expect(TACTILE_TOKENS.fontHeading).toBe(FONT_EDITORIAL_SERIF);
  });

  it('strictly verifies --font-sans contains Be Vietnam Pro and does not revert to system-ui alone', () => {
    expect(FONT_SANS).toContain('Be Vietnam Pro');
    expect(FONT_SANS.startsWith('system-ui')).toBe(false);

    expect(EDITORIAL_TOKENS.fontBody).toBe(FONT_SANS);
    expect(TACTILE_TOKENS.fontBody).toBe(FONT_SANS);
  });

  it('empirically verifies theme toggling preserves fonts, radiuses (28px/32px), and heading tracking over 100 cycles', () => {
    // Synthetic DOM element simulating document.documentElement
    const styleMap = new Map<string, string>();
    const classes = new Set<string>();

    const mockElement = {
      style: {
        setProperty: (k: string, v: string) => styleMap.set(k, String(v)),
        getPropertyValue: (k: string) => styleMap.get(k) || '',
      },
      classList: {
        add: (c: string) => classes.add(c),
        remove: (c: string) => classes.delete(c),
        contains: (c: string) => classes.has(c),
      },
    } as unknown as HTMLElement;

    // Stress cycle test: 100 alternating switches
    for (let i = 0; i < 100; i++) {
      const theme = i % 2 === 0 ? 'editorial' : 'tactile';
      applyThemeVariables(theme, mockElement);

      const fontHeading = mockElement.style.getPropertyValue('--font-editorial-serif');
      const fontBody = mockElement.style.getPropertyValue('--font-sans');
      const radius3xl = mockElement.style.getPropertyValue('--radius-3xl');
      const radius4xl = mockElement.style.getPropertyValue('--radius-4xl');
      const tracking = mockElement.style.getPropertyValue('--tracking-heading');

      // Assert font invariants after every single switch
      expect(fontHeading).toContain('Noto Serif');
      expect(fontHeading).toContain('Playfair Display');
      expect(fontHeading.toLowerCase()).not.toContain('charter');
      expect(fontBody).toContain('Be Vietnam Pro');

      // Assert Apple standard radiuses (28px - 32px)
      expect(radius3xl).toBe('28px');
      expect(radius4xl).toBe('32px');
      expect(tracking).toBe('-0.02em');

      // Assert theme classes are mutually exclusive
      if (theme === 'editorial') {
        expect(mockElement.classList.contains('theme-editorial')).toBe(true);
        expect(mockElement.classList.contains('theme-tactile')).toBe(false);
      } else {
        expect(mockElement.classList.contains('theme-tactile')).toBe(true);
        expect(mockElement.classList.contains('theme-editorial')).toBe(false);
      }
    }
  });

  it('evaluates deep oceanic navy (#102A38) RGB math and WCAG AAA contrast ratio', () => {
    const hex = '#102A38';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    expect(r).toBe(16);
    expect(g).toBe(42);
    expect(b).toBe(56);

    // Relative luminance calculation according to WCAG 2.1
    const sRgbLuminance = (red: number, green: number, blue: number) => {
      const a = [red, green, blue].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    const contrastRatio = (l1: number, l2: number) => {
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    };

    const lumNavy = sRgbLuminance(r, g, b);
    const lumWhite = sRgbLuminance(255, 255, 255);
    const lumIvory = sRgbLuminance(0xf6, 0xf3, 0xeb); // Living ivory #F6F3EB

    const contrastWhite = contrastRatio(lumWhite, lumNavy);
    const contrastIvory = contrastRatio(lumIvory, lumNavy);

    // WCAG AAA requires >= 7.0:1 for normal text and >= 4.5:1 for large headings
    expect(contrastWhite).toBeGreaterThanOrEqual(7.0);
    expect(contrastIvory).toBeGreaterThanOrEqual(7.0);
  });
});
