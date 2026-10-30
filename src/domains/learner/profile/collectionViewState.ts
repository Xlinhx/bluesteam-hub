import type { CreativeArtwork } from '../../../shared/creative/creativeStorage';

const limits = new Map<string, number>();
const key = (kind: string) => `bluesteam:profile-reveal:${kind}`;

export function readCollectionLimit(kind: CreativeArtwork['type']): number {
  if (limits.has(kind)) return limits.get(kind)!;
  try {
    const stored = Number(window.sessionStorage.getItem(key(kind)));
    if (Number.isInteger(stored) && stored >= 6 && stored <= 100000) return stored;
  } catch { /* Session storage may be disabled. */ }
  return 6;
}

export function rememberCollectionLimit(kind: CreativeArtwork['type'], count: number) {
  const limit = Math.max(6, count);
  limits.set(kind, limit);
  try { window.sessionStorage.setItem(key(kind), String(limit)); } catch { /* In-memory fallback. */ }
}
