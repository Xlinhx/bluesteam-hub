import { describe, it, expect } from 'vitest';
import { VARIANTS, VariantId } from '../src/shared/types/variant';
import { EDITORIAL_TOKENS, TACTILE_TOKENS } from '../src/shared/theme/tokens';
import { matchRoute } from '../src/app/router';

describe('Variant Hypotheses & Semantic Routing', () => {
  it('should define exactly 6 structured variants with proper IA and Theme strategies', () => {
    const variantKeys = Object.keys(VARIANTS) as VariantId[];
    expect(variantKeys.length).toBe(6);

    expect(VARIANTS.v1).toMatchObject({ ia: 'journey', theme: 'editorial', name: 'Expedition Atlas' });
    expect(VARIANTS.v2).toMatchObject({ ia: 'journey', theme: 'tactile', name: 'Expedition Lab' });
    expect(VARIANTS.v3).toMatchObject({ ia: 'explore', theme: 'editorial', name: 'Discovery Gallery' });
    expect(VARIANTS.v4).toMatchObject({ ia: 'explore', theme: 'tactile', name: 'Discovery Workshop' });
    expect(VARIANTS.v5).toMatchObject({ ia: 'classroom', theme: 'editorial', name: 'Classroom Observatory' });
    expect(VARIANTS.v6).toMatchObject({ ia: 'classroom', theme: 'tactile', name: 'Classroom Lab' });
  });

  it('should verify Editorial and Tactile theme tokens have distinct aesthetic properties', () => {
    // Editorial uses warm ivory base and refined serif
    expect(EDITORIAL_TOKENS.surfaceBase).toBe('#f8f6f0');
    expect(EDITORIAL_TOKENS.fontHeading).toContain('serif');

    // Tactile uses deep slate base and technical sans/mono
    expect(TACTILE_TOKENS.surfaceBase).toBe('#1c232b');
    expect(TACTILE_TOKENS.textPrimary).toBe('#f1f5f9');
  });

  it('should accurately match semantic parameterized routes', () => {
    const unitMatch = matchRoute('/student/unit/:unitId', '/student/unit/unit-ocean-depth');
    expect(unitMatch.matches).toBe(true);
    expect(unitMatch.params.unitId).toBe('unit-ocean-depth');

    const expMatch = matchRoute('/student/experience/:experienceId', '/student/experience/exp-sim-water-column');
    expect(expMatch.matches).toBe(true);
    expect(expMatch.params.experienceId).toBe('exp-sim-water-column');

    const sessionMatch = matchRoute('/session/:sessionId/present', '/session/room-4829/present');
    expect(sessionMatch.matches).toBe(true);
    expect(sessionMatch.params.sessionId).toBe('room-4829');

    const mismatch = matchRoute('/student/unit/:unitId', '/teacher/dashboard');
    expect(mismatch.matches).toBe(false);
  });
});
