import { expect, it } from 'vitest';
import { resolveInteractiveArtwork } from '../src/shared/data/interactiveArtwork';
it('uses the same canonical cover for both audiences and never falls back to another activity', () => {
  const content = { id: 'canonical-a', coverUrl: '/a.webp', templateKey: 'sorting' };
  expect(resolveInteractiveArtwork(content, 'game').src).toBe('/a.webp');
  expect(resolveInteractiveArtwork({ ...content, id: 'canonical-b', coverUrl: '/b.webp' }, 'game').src).toBe('/b.webp');
  expect(resolveInteractiveArtwork({ id: 'model', coverUrl: null }, 'model3d').src).not.toEqual(resolveInteractiveArtwork({ id: 'game' }, 'game').src);
});

it('uses the matching rendition for the canonical shadow activity across surfaces', () => {
  const content = { id: 'd895988a-da2a-466e-88e0-f52c3a6de53a', coverUrl: '/unrelated.webp', templateKey: 'matching' };
  expect(resolveInteractiveArtwork(content, 'game').src).toBe('/assets/generated/interactive/v5/activity-matching-v3.webp');
});

it('exposes a distinct kind fallback when a canonical asset fails', async () => {
  const { interactiveArtworkFallback } = await import('../src/shared/data/interactiveArtwork');
  const canonical = resolveInteractiveArtwork({ id: 'd895988a-da2a-466e-88e0-f52c3a6de53a' }, 'game');
  expect(interactiveArtworkFallback('game')).not.toBe(canonical.src);
  expect(interactiveArtworkFallback('model3d')).not.toBe(interactiveArtworkFallback('game'));
});

it('uses approved mechanic-specific renditions for the visible sorting and choice activities', () => {
  expect(resolveInteractiveArtwork({id:'fa993c7f-53e4-49cf-bde5-0f8582e1c04a'}, 'game').src).toContain('activity-sorting-v4.webp');
  expect(resolveInteractiveArtwork({id:'cab7e857-13c6-4005-b96d-2ee902bd079b'}, 'game').src).toContain('activity-choice-v3.webp');
});

it('preserves an unknown activity cover even when its template is a known mechanic', () => {
  expect(resolveInteractiveArtwork({id:'12345678-1234-1234-1234-123456789abc',coverUrl:'/custom-cover.webp',templateKey:'matching'}, 'game').src).toBe('/custom-cover.webp');
});

it('composes the shared fixed coast and top wash as separate layers', async () => {
  const { INTERACTIVE_BACKDROP } = await import('../src/shared/data/interactiveArtwork');
  expect(INTERACTIVE_BACKDROP.map(layer => layer.id)).toEqual(['top-wash','left-reef','right-shore']);
  expect(INTERACTIVE_BACKDROP[1].src).toContain('coast-left-fixed-v1.webp');
  expect(INTERACTIVE_BACKDROP[2].src).toContain('coast-right-fixed-v1.webp');
});
