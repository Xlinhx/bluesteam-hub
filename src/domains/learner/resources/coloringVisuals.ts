import type { ResourceDto } from '../../../shared/api/catalog';

const PREVIEW_ASSETS = [
  '/assets/generated/craft/turtle_coloring_lineart_v2.png',
  '/assets/generated/craft/octopus_coloring_lineart_v2.png',
  '/assets/generated/craft/clownfish_coloring_lineart.png',
  '/assets/generated/craft/artwork_crayon_whale.png',
  '/assets/generated/craft/starfish_coloring_lineart.png',
  '/assets/generated/craft/coral_coloring_lineart_v2.png',
] as const;

/** Keeps the coloring catalog visually complete when an API record has no preview. */
export function getColoringPreviewAsset(resource: Pick<ResourceDto, 'title' | 'mediaUrl'>, index = 0): string | null {
  const title = resource.title.toLocaleLowerCase('vi-VN');
  if (title.includes('rùa')) return PREVIEW_ASSETS[0];
  if (title.includes('bạch tuộc')) return PREVIEW_ASSETS[1];
  if (title.includes('cá hề') || title.includes('cá cam')) return PREVIEW_ASSETS[2];
  if (title.includes('cá voi')) return PREVIEW_ASSETS[3];
  if (title.includes('sao biển')) return PREVIEW_ASSETS[4];
  if (title.includes('san hô')) return PREVIEW_ASSETS[5];
  return resource.mediaUrl || PREVIEW_ASSETS[index % PREVIEW_ASSETS.length];
}

export function getColoringGroupAsset(index: number): string {
  return PREVIEW_ASSETS[(index + 2) % PREVIEW_ASSETS.length];
}

/** Match illustrations to the group meaning; unknown groups retain their own cover. */
export function getColoringGroupIllustration(title: string): string | null {
  const name = title.toLocaleLowerCase('vi-VN');
  if (name.includes('bạn dưới biển')) return '/assets/generated/creative/learner-v3/c03-group-friends.webp';
  if (name.includes('san hô')) return '/assets/generated/creative/learner-v3/c03-group-reef.webp';
  if (name.includes('cát') || name.includes('bờ biển')) return '/assets/generated/creative/learner-v3/c03-group-beach.webp';
  if (name.includes('sạch')) return '/assets/generated/creative/learner-v3/group-clean-v2.png';
  return null;
}
