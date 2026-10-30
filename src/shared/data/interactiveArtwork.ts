import type { InteractiveCategoryKind } from './categoryArtworkMap';

const base = '/assets/generated/interactive/v5';
export const INTERACTIVE_ARTWORK: Record<InteractiveCategoryKind, string> = {
  model3d: `${base}/world-model3d.webp`, game: `${base}/world-game.webp`, simulation: `${base}/world-simulation.webp`, scenario: `${base}/world-scenario.webp`,
};
export const INTERACTIVE_BACKDROP = [
  { id: 'top-wash', src: `${base}/top-wash-transparent-v2.webp`, mobile: `${base}/top-wash-transparent-v2.webp` },
  { id: 'left-reef', src: `${base}/coast-left-fixed-v1.webp`, mobile: `${base}/coast-left-fixed-v1.webp` },
  { id: 'right-shore', src: `${base}/coast-right-fixed-v1.webp`, mobile: `${base}/coast-right-fixed-v1.webp` },
];
const fallbacks: Record<InteractiveCategoryKind, string> = {
  game: '/assets/generated/interactive/habitat-scene.png', model3d: '/assets/generated/creatures/green_turtle_hero.jpg',
  simulation: '/assets/generated/simulations/sim_coastal_bay_landscape.png', scenario: '/assets/generated/simulations/sim_bottle_beach.png',
};
export function interactiveArtworkFallback(kind: InteractiveCategoryKind): string {
  return fallbacks[kind];
}
const CANONICAL_BY_CONTENT_ID: Record<string, string> = {
  // Seed activities used by the teacher/learner visual references.
  'fa993c7f-53e4-49cf-bde5-0f8582e1c04a': '/assets/generated/interactive/v5/activity-sorting-v4.webp',
  'd895988a-da2a-466e-88e0-f52c3a6de53a': '/assets/generated/interactive/v5/activity-matching-v3.webp',
  'cab7e857-13c6-4005-b96d-2ee902bd079b': '/assets/generated/interactive/v5/activity-choice-v3.webp',
  '88806f89-bd2f-434f-8f5e-e020f80708b7': '/assets/generated/interactive/v5/activity-sorting-v4.webp',
  '83239afa-a26e-44ca-a4eb-a09a7f7e2da2': '/assets/generated/interactive/activity-sorting-composite.jpg',
};
export function resolveInteractiveArtwork(content: { id: string; coverUrl?: string | null; thumbnailUrl?: string; templateKey?: string }, kind: InteractiveCategoryKind) {
  const canonicalSrc = CANONICAL_BY_CONTENT_ID[content.id];
  return { src: canonicalSrc || content.coverUrl || content.thumbnailUrl || fallbacks[kind], aspectRatio: 1.6, objectPosition: '50% 50%' };
}
export function interactiveMechanicLabel(templateKey?: string) {
  return ({ sorting: 'Phân loại', matching: 'Ghép cặp', choice: 'Chọn đáp án', scenario: 'Tình huống' } as Record<string, string>)[templateKey || ''] || 'Khám phá';
}
export function interactiveContentLabel(id: string, kind: InteractiveCategoryKind) {
  const known: Record<string, string> = {
    'fa993c7f-53e4-49cf-bde5-0f8582e1c04a': 'Phân loại',
    'd895988a-da2a-466e-88e0-f52c3a6de53a': 'Ghép cặp',
    'cab7e857-13c6-4005-b96d-2ee902bd079b': 'Chọn đáp án',
  };
  return known[id] || ({ game: 'Trò chơi', model3d: 'Khám phá 3D', simulation: 'Mô phỏng', scenario: 'Tình huống' } as const)[kind];
}
