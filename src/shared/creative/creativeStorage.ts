import {
  exportDraftsToJson,
  importDraftsFromJson,
  migrateLegacyArtworkRecord,
  type LegacySubmissionState,
} from './localDraftMigration';
import { collectionIndexKey, collectionPageLimit, COMPLETED_COLLECTION_INDEX, SCOPED_COLLECTION_INDEX, readCompletedPage, scopedCollectionIndexKey, type ArtworkPageOptions, type CompletedArtworkPage } from './collectionPaging';
import { readSavedArtwork, type SavedArtworkView } from './artworkCompletion';

export interface HabitatPlacedItem {
  id: string;
  type: 'coral' | 'seagrass' | 'rock' | 'fish' | 'turtle' | 'anemone';
  x: number;
  z: number;
  rotation: number;
  scale: number;
}

export interface CreativeArtwork {
  studyContext?: { learnerId: string; contextId: string };
  sourceSnapshot?: import('./contentSnapshot').ImmutableContentSnapshot;
  pendingDelivery?: {code:string;editVersion:number;alias:string;preview:string;document:unknown};
  habitatChallenge?: {sessionId:string;code:string;alias:string;challenge:import('@bluesteam/contracts').HabitatChallengeSnapshot};
  id: string;
  type: 'drawing' | 'habitat' | 'scan';
  title: string;
  createdAt: number;
  updatedAt?: number;
  isDraft?: boolean;
  completedAt?: number;
  sourceArtworkId?: string;
  previewDataUrl: string;
  schemaVersion?: number;
  clientSubmissionId?: string;
  submissionState?: LegacySubmissionState;
  submittedRoomId?: string | null;
  submittedRoundId?: string | null;
  submittedArtworkId?: string | null;
  lastSubmissionError?: string | null;
  editVersion?: number;
  submittedEditVersion?: number;
  templateConfig?: Record<string, unknown>;
  scanData?:import('./scanning/scanDocument').ScanDocument;
  drawingData?: {
    template?: string;
    canvasDataUrl: string;
    document?:{schemaVersion:2;templateId:string;paintDataUrl:string};
  };
  habitatData?: {
    items: HabitatPlacedItem[];
    project?: import('./habitatProject').HabitatProject;
  };
}

const DB_NAME = 'ocean_creative_db';
const DB_VERSION = 4;
const STORE_NAME = 'ocean_artworks';

// In-memory fallback store for Node/Vitest environment
const inMemoryStore: Record<string, CreativeArtwork> = {};
export const CREATIVE_ARTWORKS_CHANGED_EVENT = 'bluesteam:creative-artworks-changed';
export class CreativeDatabaseBlockedError extends Error {
  constructor() { super('Đóng các tab BlueSTEAM cũ rồi thử lại để nâng cấp bộ sưu tập.'); }
}
const notifyChange = () => {
  if (typeof window !== 'undefined') window.dispatchEvent?.(new Event(CREATIVE_ARTWORKS_CHANGED_EVENT));
};

function getIDB(): IDBFactory | null {
  if (typeof window !== 'undefined' && window.indexedDB) {
    return window.indexedDB;
  }
  if (typeof window !== 'undefined' && typeof document !== 'undefined') throw new Error('Trình duyệt chưa cho phép lưu tác phẩm trên thiết bị.');
  return null;
}

let pendingOpen: Promise<IDBDatabase> | null = null;
let upgradeBlocked = false;
function openDatabase(): Promise<IDBDatabase> {
  const idb = getIDB();
  if (!idb) {
    return Promise.reject(new Error('IndexedDB not supported in current environment'));
  }

  if (upgradeBlocked) return Promise.reject(new CreativeDatabaseBlockedError());
  if (pendingOpen) return pendingOpen;
  const opening = new Promise<IDBDatabase>((resolve, reject) => {
    const request = idb.open(DB_NAME, DB_VERSION);
    let blocked = false;
    request.onblocked = () => {
      blocked = true;
      upgradeBlocked = true;
      reject(new CreativeDatabaseBlockedError());
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      const store = request.transaction!.objectStore(STORE_NAME);
      if (!store.indexNames.contains(COMPLETED_COLLECTION_INDEX)) {
        store.createIndex(COMPLETED_COLLECTION_INDEX, '__collectionKey');
      }
      if (!store.indexNames.contains(SCOPED_COLLECTION_INDEX)) {
        store.createIndex(SCOPED_COLLECTION_INDEX, '__scopedCollectionKey');
        const scan = store.openCursor();
        scan.onsuccess = () => {
          const cursor = scan.result;
          if (!cursor) return;
          const raw = cursor.value;
          const art = migrateLegacyArtworkRecord(raw);
          cursor.update({ ...raw, __collectionKey: collectionIndexKey(art), __scopedCollectionKey: scopedCollectionIndexKey(art) });
          cursor.continue();
        };
      }
    };

    request.onsuccess = () => {
      if (blocked) { upgradeBlocked = false; request.result.close(); return; }
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };

    request.onerror = () => {
      upgradeBlocked = false;
      reject(request.error);
    };
  });
  pendingOpen = opening;
  const clear = () => { if (pendingOpen === opening) pendingOpen = null; };
  void opening.then(clear, clear);
  return opening;
}

export const creativeStorage = {
  async saveArtwork(artwork: CreativeArtwork): Promise<void> {
    const normalized = migrateLegacyArtworkRecord(artwork);
    const idb = getIDB();
    if (!idb) {
      inMemoryStore[normalized.id] = { ...normalized };
      notifyChange();
      return;
    }

    try {
      const db = await openDatabase();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put({ ...normalized, __collectionKey: collectionIndexKey(normalized), __scopedCollectionKey: scopedCollectionIndexKey(normalized) });

        tx.oncomplete = () => { db.close(); notifyChange(); resolve(); };
        tx.onabort = tx.onerror = () => { db.close(); reject(tx.error || new Error('Chưa thể lưu thay đổi trên thiết bị.')); };
        req.onerror = () => {
          if (req.error && req.error.name === 'QuotaExceededError') {
            reject(new Error('Chưa thể lưu tranh: Bộ nhớ thiết bị đã đầy.'));
          } else {
            reject(req.error);
          }
        };
      });
    } catch (err) {
      throw err;
    }
  },

  async getCompletedArtworkPage(kind: CreativeArtwork['type'], options: ArtworkPageOptions = {}): Promise<CompletedArtworkPage> {
    const limit = collectionPageLimit(options.limit);
    if (!getIDB()) {
      const all = Object.values(inMemoryStore)
        .filter(art => options.scope === undefined || scopedCollectionIndexKey(art)?.[0] === options.scope)
        .map(readSavedArtwork).filter((art): art is SavedArtworkView => art !== null && art.type === kind);
      const ordered = all.sort((a, b) => (b.savedAt ?? -1) - (a.savedAt ?? -1) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
      const after = options.cursor;
      const available = ordered.filter(art => {
        const order = art.savedAt === null ? Number.MAX_VALUE : -art.savedAt;
        return !after || order > after.order || (order === after.order && art.id > after.id);
      });
      const items = available.slice(0, limit);
      const last = items.at(-1);
      return { items, total: ordered.length, nextCursor: available.length > limit && last ? { order: last.savedAt === null ? Number.MAX_VALUE : -last.savedAt, id: last.id } : null };
    }
    const db = await openDatabase();
    try { return await readCompletedPage(db, kind, options); }
    catch (error) { db.close(); throw error; }
  },

  async getArtworks(): Promise<CreativeArtwork[]> {
    const idb = getIDB();
    if (!idb) {
      return Object.values(inMemoryStore)
        .map((r) => migrateLegacyArtworkRecord(r))
        .sort((a, b) => b.createdAt - a.createdAt);
    }

    try {
      const db = await openDatabase();
      return new Promise<CreativeArtwork[]>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        tx.oncomplete = () => db.close();
        tx.onabort = tx.onerror = () => { db.close(); reject(tx.error || new Error('Chưa đọc được tác phẩm trên thiết bị.')); };
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          const results = ((req.result as CreativeArtwork[]) || []).map((r) =>
            migrateLegacyArtworkRecord(r),
          );
          results.sort((a, b) => b.createdAt - a.createdAt);
          resolve(results);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      throw err;
    }
  },

  async getArtworkById(id: string): Promise<CreativeArtwork | null> {
    const idb = getIDB();
    if (!idb) {
      return inMemoryStore[id] ? migrateLegacyArtworkRecord(inMemoryStore[id]) : null;
    }

    try {
      const db = await openDatabase();
      return new Promise<CreativeArtwork | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        tx.oncomplete = () => db.close();
        tx.onabort = tx.onerror = () => { db.close(); reject(tx.error || new Error('Chưa đọc được tác phẩm trên thiết bị.')); };
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);

        req.onsuccess = () =>
          resolve(req.result ? migrateLegacyArtworkRecord(req.result) : null);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      throw err;
    }
  },


  async exportBundle(): Promise<string> {
    const all = await this.getArtworks();
    return exportDraftsToJson(all);
  },

  async recoverFromBundle(serializedJson: string): Promise<CreativeArtwork[]> {
    const drafts = importDraftsFromJson(serializedJson);
    for (const draft of drafts) {
      await this.saveArtwork(draft);
    }
    return this.getArtworks();
  },

  async deleteArtwork(id: string): Promise<void> {
    const idb = getIDB();
    delete inMemoryStore[id];

    if (!idb) { notifyChange(); return; }

    try {
      const db = await openDatabase();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);

        tx.oncomplete = () => { db.close(); notifyChange(); resolve(); };
        tx.onabort = tx.onerror = () => { db.close(); reject(tx.error || new Error('Chưa thể lưu thay đổi trên thiết bị.')); };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      throw err;
    }
  },

  async clearAll(): Promise<void> {
    for (const key in inMemoryStore) {
      delete inMemoryStore[key];
    }

    const idb = getIDB();
    if (!idb) { notifyChange(); return; }

    try {
      const db = await openDatabase();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();

        tx.oncomplete = () => { db.close(); notifyChange(); resolve(); };
        tx.onabort = tx.onerror = () => { db.close(); reject(tx.error || new Error('Chưa thể lưu thay đổi trên thiết bị.')); };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      throw err;
    }
  },
};
