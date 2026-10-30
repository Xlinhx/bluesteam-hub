import { describe, expect, it } from 'vitest';
import { getColoringGroupAsset, getColoringPreviewAsset, getColoringGroupIllustration } from '../src/domains/learner/resources/coloringVisuals';

describe('creative visual asset fallbacks', () => {
  it('uses stable ocean line art for missing or known coloring records', () => {
    expect(getColoringPreviewAsset({ title: 'Tranh tô màu: Rùa biển xanh', mediaUrl: null })).toContain('turtle_coloring_lineart_v2');
    expect(getColoringPreviewAsset({ title: 'Cá voi', mediaUrl: null })).toContain('artwork_crayon_whale');
    expect(getColoringPreviewAsset({ title: 'Mẫu mới', mediaUrl: null }, 4)).toContain('starfish_coloring_lineart');
  });

  it('matches quick group illustrations by group meaning, not their ordering', () => {
    expect(getColoringGroupIllustration('Rạn san hô')).toContain('group-reef');
    expect(getColoringGroupIllustration('Bãi cát ven biển')).toContain('group-beach');
    expect(getColoringGroupIllustration('Giữ biển sạch')).toContain('group-clean');
    expect(getColoringGroupIllustration('Nhóm chưa biết')).toBeNull();
  });

  it('provides a distinct illustrated image for each quick group card', () => {
    expect(new Set([0, 1, 2].map(getColoringGroupAsset)).size).toBe(3);
  });
});
