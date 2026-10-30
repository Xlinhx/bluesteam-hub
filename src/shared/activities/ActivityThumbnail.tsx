import { useState } from 'react';
import type { InteractiveCategoryKind } from '../data/categoryArtworkMap';
import { interactiveArtworkFallback, resolveInteractiveArtwork } from '../data/interactiveArtwork';
import './activity-thumbnail.css';
export function ActivityThumbnail({ content, kind, variant = 'card' }: {
  content: { id: string; coverUrl?: string | null; thumbnailUrl?: string; templateKey?: string };
  kind: InteractiveCategoryKind; variant?: 'card' | 'row' | 'identity';
}) {
  const artwork = resolveInteractiveArtwork(content, kind);
  const fallback = interactiveArtworkFallback(kind);
  const [failed, setFailed] = useState<string | null>(null);
  return <img data-motion-content-id={content.id} className={`activity-thumbnail activity-thumbnail--${variant}`} src={failed === artwork.src ? fallback : artwork.src}
    style={{ objectPosition: artwork.objectPosition }} alt="" loading="lazy" decoding="async" width={640} height={400}
    onError={() => { if (failed !== artwork.src && artwork.src !== fallback) setFailed(artwork.src); }} />;
}
