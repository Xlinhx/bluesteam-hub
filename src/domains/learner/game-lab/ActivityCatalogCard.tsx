import { Play, Volume2 } from 'lucide-react';
import { ActivityThumbnail } from '../../../shared/activities/ActivityThumbnail';
import type { InteractiveCategoryKind } from '../../../shared/data/categoryArtworkMap';
import { oceanAudio } from '../../../shared/audio/oceanAudio';

export interface CatalogActivity { id: string; title: string; coverUrl?: string | null; thumbnailUrl?: string; templateKey?: string; config?: Record<string, any> }
export function ActivityCatalogCard({ item, kind, onOpen }: { item: CatalogActivity; kind: string; onOpen: () => void }) {
  return <article className="ocean-activity-card">
    <button className="ocean-activity-card__preview" aria-label={`Mở ${item.title}`} onClick={onOpen}><ActivityThumbnail content={item} kind={kind as InteractiveCategoryKind}/></button>
    <div className="ocean-activity-card__footer"><h2>{item.title}</h2><button className="ocean-audio-button" aria-label={`Nghe tên: ${item.title}`} onClick={() => oceanAudio.speak(item.title)}><Volume2 size={22}/></button><button className="ocean-play-button" onClick={onOpen}><Play size={20} fill="currentColor"/>{kind === 'model3d' ? 'Khám phá' : 'Chơi ngay'}</button></div>
  </article>;
}
