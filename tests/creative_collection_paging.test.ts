import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { creativeStorage, type CreativeArtwork } from '../src/shared/creative/creativeStorage';

const art = (id: string, extra: Partial<CreativeArtwork> = {}): CreativeArtwork => ({ id, type: 'drawing', title: id, createdAt: 100, previewDataUrl: 'image-' + id, ...extra });
let factory: IDBFactory;
beforeEach(() => {
  factory = new IDBFactory();
  vi.stubGlobal('window', Object.assign(new EventTarget(), { indexedDB: factory }));
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
});
afterEach(() => vi.unstubAllGlobals());

describe('indexed completed collection paging', () => {
  it('opens all three pages concurrently on a new empty database', async () => {
    const result = await Promise.all((['drawing', 'scan', 'habitat'] as const).map(kind => creativeStorage.getCompletedArtworkPage(kind)));
    expect(result.map(page => page.total)).toEqual([0, 0, 0]);
  });
  it('reads bounded pages in completion order with stable ties, independent type totals and no drafts', async () => {
    for (let i = 0; i < 15; i++) await creativeStorage.saveArtwork(art(String(i).padStart(2, '0'), { completedAt: 200 - i }));
    await creativeStorage.saveArtwork(art('scan', { type: 'scan' }));
    await creativeStorage.saveArtwork(art('draft', { isDraft: true, completedAt: 900 }));
    const first = await creativeStorage.getCompletedArtworkPage('drawing');
    expect(first.total).toBe(15);
    expect(first.items.map(a => a.id)).toEqual(['00', '01', '02', '03', '04', '05']);
    const second = await creativeStorage.getCompletedArtworkPage('drawing', { cursor: first.nextCursor });
    expect(second.items.map(a => a.id)).toEqual(['06', '07', '08', '09', '10', '11']);
    const last = await creativeStorage.getCompletedArtworkPage('drawing', { cursor: second.nextCursor });
    expect(last.items.map(a => a.id)).toEqual(['12', '13', '14']);
    expect(last.nextCursor).toBeNull();
    expect((await creativeStorage.getCompletedArtworkPage('scan')).total).toBe(1);
    expect((await creativeStorage.getCompletedArtworkPage('habitat')).items).toEqual([]);
  });
  it('backfills a version 2 database without changing originals, layers, scenes or delivery identity', async () => {
    const original = art('legacy', { drawingData: { canvasDataUrl: 'paint', document: { schemaVersion: 2, templateId: 'turtle', paintDataUrl: 'layer' } }, submissionState: 'submitted', submittedArtworkId: 'server-id' });
    const scan = art('legacy-scan', { type: 'scan', scanData: { schemaVersion: 1, originalDataUrl: 'original-scan', cutoutDataUrl: 'cutout', environmentId: 'reef', motion: 'swim', crop: { x: 0, y: 0, width: 100, height: 100 } } });
    const habitat = art('legacy-habitat', { type: 'habitat', habitatData: { items: [], project: { version: 1, activeSceneId: 'b', scenes: [{ id: 'a', title: 'A', items: [] }, { id: 'b', title: 'B', items: [] }] } } });
    await new Promise<void>((resolve, reject) => {
      const open = factory.open('ocean_creative_db', 2);
      open.onupgradeneeded = () => open.result.createObjectStore('ocean_artworks', { keyPath: 'id' });
      open.onerror = () => reject(open.error);
      open.onsuccess = () => { const db = open.result, tx = db.transaction('ocean_artworks', 'readwrite'); for (const record of [original, scan, habitat]) tx.objectStore('ocean_artworks').put(record); tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => reject(tx.error); };
    });
    expect((await creativeStorage.getCompletedArtworkPage('drawing')).items.map(a => a.id)).toEqual(['legacy']);
    expect(await creativeStorage.getArtworkById('legacy')).toMatchObject(original);
    expect(await creativeStorage.getArtworkById('legacy-scan')).toMatchObject(scan);
    expect(await creativeStorage.getArtworkById('legacy-habitat')).toMatchObject(habitat);
    expect((await creativeStorage.getCompletedArtworkPage('habitat')).items[0].sceneCount).toBe(2);
    const exported = JSON.parse(await creativeStorage.exportBundle());
    expect(exported.items.find((a: CreativeArtwork) => a.id === 'legacy').drawingData.document.paintDataUrl).toBe('layer');
  });
  it('uses an exclusive cursor after deletion and indexes completion transitions and stable ties correctly', async () => {
    await creativeStorage.saveArtwork(art('a', { completedAt: 200 }));
    await creativeStorage.saveArtwork(art('b', { completedAt: 200 }));
    await creativeStorage.saveArtwork(art('c', { isDraft: true, completedAt: 300 }));
    const first = await creativeStorage.getCompletedArtworkPage('drawing', { limit: 1 });
    expect(first.items.map(a => a.id)).toEqual(['a']);
    await creativeStorage.deleteArtwork('a');
    expect((await creativeStorage.getCompletedArtworkPage('drawing', { cursor: first.nextCursor })).items.map(a => a.id)).toEqual(['b']);
    await creativeStorage.saveArtwork(art('c', { isDraft: false, completedAt: 300 }));
    expect((await creativeStorage.getCompletedArtworkPage('drawing')).items.map(a => a.id)).toEqual(['c', 'b']);
    await creativeStorage.saveArtwork(art('b', { isDraft: true }));
    expect((await creativeStorage.getCompletedArtworkPage('drawing')).total).toBe(1);
  });
  it('keeps unknown dates last and recovers a complete indexed collection after export, clear and import', async () => {
    await creativeStorage.saveArtwork(art('unknown', { createdAt: 1e20 }));
    await creativeStorage.saveArtwork(art('b', { completedAt: 300, updatedAt: 999 }));
    await creativeStorage.saveArtwork(art('a', { completedAt: 300 }));
    const bundle = await creativeStorage.exportBundle();
    await creativeStorage.clearAll();
    expect((await creativeStorage.getCompletedArtworkPage('drawing')).total).toBe(0);
    await creativeStorage.recoverFromBundle(bundle);
    const page = await creativeStorage.getCompletedArtworkPage('drawing');
    expect(page.items.map(art => art.id)).toEqual(['a', 'b', 'unknown']);
    expect(page.items[2].savedAt).toBeNull();
    expect(page.items[2].previewDataUrl).toBe('image-unknown');
    expect(page.total).toBe(3);
  });
  it('reports an upgrade blocked by an old tab, then recovers without losing records after it closes', async () => {
    const old = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = factory.open('ocean_creative_db', 2);
      request.onupgradeneeded = () => request.result.createObjectStore('ocean_artworks', { keyPath: 'id' });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = old.transaction('ocean_artworks', 'readwrite');
      tx.objectStore('ocean_artworks').put(art('blocked-legacy'));
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
    });
    await expect(creativeStorage.getCompletedArtworkPage('drawing')).rejects.toThrow('Đóng các tab');
    await expect(creativeStorage.getCompletedArtworkPage('scan')).rejects.toThrow('Đóng các tab');
    old.close();
    await new Promise<void>((resolve, reject) => {
      const check = factory.open('ocean_creative_db', 3);
      check.onsuccess = () => { check.result.close(); resolve(); }; check.onerror = () => reject(check.error);
    });
    expect((await creativeStorage.getCompletedArtworkPage('drawing')).items.map(a => a.id)).toEqual(['blocked-legacy']);
  });
});
