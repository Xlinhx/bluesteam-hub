export interface HabitatPlacedItem {
  id: string;
  type: 'coral' | 'seagrass' | 'rock' | 'fish';
  x: number;
  z: number;
  rotation: number;
  scale: number;
}

export interface CreativeArtwork {
  id: string;
  type: 'drawing' | 'habitat';
  title: string;
  createdAt: number;
  previewDataUrl: string;
  drawingData?: {
    template?: string;
    canvasDataUrl: string;
  };
  habitatData?: {
    items: HabitatPlacedItem[];
  };
}

const DB_NAME = 'ocean_creative_db';
const DB_VERSION = 1;
const STORE_NAME = 'ocean_artworks';

// In-memory fallback store for Node/Vitest environment
const inMemoryStore: Record<string, CreativeArtwork> = {};

function getIDB(): IDBFactory | null {
  if (typeof window !== 'undefined' && window.indexedDB) {
    return window.indexedDB;
  }
  return null;
}

function openDatabase(): Promise<IDBDatabase> {
  const idb = getIDB();
  if (!idb) {
    return Promise.reject(new Error('IndexedDB not supported in current environment'));
  }

  return new Promise((resolve, reject) => {
    const request = idb.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export const creativeStorage = {
  async saveArtwork(artwork: CreativeArtwork): Promise<void> {
    const idb = getIDB();
    if (!idb) {
      inMemoryStore[artwork.id] = { ...artwork };
      return;
    }

    try {
      const db = await openDatabase();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(artwork);

        req.onsuccess = () => resolve();
        req.onerror = () => {
          if (req.error && req.error.name === 'QuotaExceededError') {
            reject(new Error('Chưa thể lưu tranh: Bộ nhớ thiết bị đã đầy.'));
          } else {
            reject(req.error);
          }
        };
      });
    } catch (err) {
      console.warn('[creativeStorage] IndexedDB fallback to memory:', err);
      inMemoryStore[artwork.id] = { ...artwork };
    }
  },

  async getArtworks(): Promise<CreativeArtwork[]> {
    const idb = getIDB();
    if (!idb) {
      return Object.values(inMemoryStore).sort((a, b) => b.createdAt - a.createdAt);
    }

    try {
      const db = await openDatabase();
      return new Promise<CreativeArtwork[]>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          const results = (req.result as CreativeArtwork[]) || [];
          results.sort((a, b) => b.createdAt - a.createdAt);
          resolve(results);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[creativeStorage] IndexedDB fallback to memory:', err);
      return Object.values(inMemoryStore).sort((a, b) => b.createdAt - a.createdAt);
    }
  },

  async getArtworkById(id: string): Promise<CreativeArtwork | null> {
    const idb = getIDB();
    if (!idb) {
      return inMemoryStore[id] || null;
    }

    try {
      const db = await openDatabase();
      return new Promise<CreativeArtwork | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);

        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      return inMemoryStore[id] || null;
    }
  },

  async deleteArtwork(id: string): Promise<void> {
    const idb = getIDB();
    delete inMemoryStore[id];

    if (!idb) return;

    try {
      const db = await openDatabase();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[creativeStorage] Error deleting artwork:', err);
    }
  },

  async clearAll(): Promise<void> {
    for (const key in inMemoryStore) {
      delete inMemoryStore[key];
    }

    const idb = getIDB();
    if (!idb) return;

    try {
      const db = await openDatabase();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[creativeStorage] Error clearing artworks:', err);
    }
  },
};
