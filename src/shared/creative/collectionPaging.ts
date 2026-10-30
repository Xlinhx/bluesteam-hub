import type { CreativeArtwork } from './creativeStorage';
import { readSavedArtwork, type SavedArtworkView } from './artworkCompletion';
import { migrateLegacyArtworkRecord } from './localDraftMigration';

export const COMPLETED_COLLECTION_INDEX = 'completed_collection';
export interface ArtworkPageCursor { order: number; id: string }
export interface ArtworkPageOptions { limit?: number; cursor?: ArtworkPageCursor | null }
export interface CompletedArtworkPage { items: SavedArtworkView[]; total: number; nextCursor: ArtworkPageCursor | null }

export function collectionIndexKey(art: CreativeArtwork): [string, number, string] | undefined {
  const saved = readSavedArtwork(art);
  return saved ? [saved.type, saved.savedAt === null ? Number.MAX_VALUE : -saved.savedAt, saved.id] : undefined;
}

export function collectionPageLimit(limit = 6): number {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100000) throw new Error('Invalid collection page size');
  return limit;
}

/** Count uses only index keys; the cursor materializes at most limit + 1 records. */
export function readCompletedPage(db: IDBDatabase, kind: CreativeArtwork['type'], options: ArtworkPageOptions): Promise<CompletedArtworkPage> {
  const limit = collectionPageLimit(options.limit), after = options.cursor;
  return new Promise((resolve, reject) => {
    const tx = db.transaction('ocean_artworks', 'readonly');
    const index = tx.objectStore('ocean_artworks').index(COMPLETED_COLLECTION_INDEX);
    const count = index.count(IDBKeyRange.bound([kind], [kind, []]));
    const range = IDBKeyRange.bound(after ? [kind, after.order, after.id] : [kind], [kind, []], Boolean(after));
    const request = index.openCursor(range);
    const items: SavedArtworkView[] = [];
    let last: ArtworkPageCursor | null = null, more = false;
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      if (items.length === limit) { more = true; return; }
      const saved = readSavedArtwork(migrateLegacyArtworkRecord(cursor.value as CreativeArtwork));
      if (saved) {
        const key = cursor.key as [string, number, string];
        items.push({ ...saved, savedAt: key[1] === Number.MAX_VALUE ? null : -key[1] });
        last = { order: key[1], id: key[2] };
      }
      cursor.continue();
    };
    tx.oncomplete = () => { db.close(); resolve({ items, total: count.result, nextCursor: more ? last : null }); };
    tx.onabort = tx.onerror = () => { db.close(); reject(tx.error || new Error('Chưa đọc được bộ sưu tập.')); };
  });
}
