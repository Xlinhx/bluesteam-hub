import { afterEach, expect, it, vi } from 'vitest';
import { creativeStorage } from '../src/shared/creative/creativeStorage';
import { IDBFactory } from 'fake-indexeddb';
afterEach(() => vi.unstubAllGlobals());
it('announces committed local mutations so a visible collection can refresh', async () => {
  const browser = Object.assign(new EventTarget(), { indexedDB: new IDBFactory() });
  vi.stubGlobal('window', browser);
  const listener = vi.fn(); browser.addEventListener('bluesteam:creative-artworks-changed', listener);
  await creativeStorage.saveArtwork({id:'event-save',type:'drawing',title:'Cá',createdAt:1,previewDataUrl:'image'});
  expect(listener).toHaveBeenCalledTimes(1);
  expect((await creativeStorage.getArtworks()).map(art=>art.id)).toEqual(['event-save']);
  await creativeStorage.deleteArtwork('event-save');
  expect(listener).toHaveBeenCalledTimes(2);
  expect(await creativeStorage.getArtworks()).toEqual([]);
});
it('rejects a blocked browser database instead of reporting a durable save', async () => {
  vi.stubGlobal('window', { indexedDB: { open: () => { throw new DOMException('Blocked', 'SecurityError'); } } });
  await expect(creativeStorage.saveArtwork({id:'blocked-save',type:'drawing',title:'Con cua',createdAt:1,previewDataUrl:'data:image/png;base64,AA'})).rejects.toThrow();
});
it('waits for commit and reports an aborted write transaction', async () => {
  let transaction: any;
  vi.stubGlobal('window', { indexedDB: { open: () => { const request: any = {}; queueMicrotask(() => {request.result={transaction:()=>{transaction={objectStore:()=>({put:()=>{const put:any={};queueMicrotask(()=>{put.onsuccess?.();queueMicrotask(()=>{transaction.error=new DOMException('Full','QuotaExceededError');transaction.onabort?.();});});return put;}}),close:()=>{}};return transaction;},close:()=>{}};request.onsuccess();});return request;} } });
  await expect(creativeStorage.saveArtwork({id:'aborted-save',type:'drawing',title:'Con cua',createdAt:1,previewDataUrl:'data:image/png;base64,AA'})).rejects.toThrow();
});
