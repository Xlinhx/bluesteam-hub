import type { CreativeArtwork } from './creativeStorage';

/** A display-only projection. Working documents never enter the profile viewer. */
export interface SavedArtworkView {
  id: string;
  type: CreativeArtwork['type'];
  title: string;
  previewDataUrl: string;
  savedAt: number | null;
  sceneCount?: number;
}

const validDate = (value?: number) => typeof value === 'number' && value > 0 && Number.isFinite(new Date(value).getTime()) ? value : null;

export function readSavedArtwork(art: CreativeArtwork): SavedArtworkView | null {
  if (art.isDraft === true) return null;
  return {
    id: art.id, type: art.type, title: art.title.trim(), previewDataUrl: art.previewDataUrl,
    savedAt: validDate(art.completedAt) ?? validDate(art.updatedAt) ?? validDate(art.createdAt),
    ...(art.type === 'habitat' ? { sceneCount: art.habitatData?.project?.scenes.length || 1 } : {}),
  };
}
