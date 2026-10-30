import { beforeEach, expect, it, vi } from 'vitest';
import { creativeStorage, type CreativeArtwork } from '../src/shared/creative/creativeStorage';
import { CreativeDraftWriter } from '../src/shared/creative/creativeDraftWriter';
const art = (title: string): CreativeArtwork => ({ id: 'one', type: 'drawing', title, createdAt: 1, previewDataUrl: title, drawingData: { canvasDataUrl: title } });
beforeEach(async () => { vi.restoreAllMocks(); await creativeStorage.clearAll(); });
it('serializes progress and completion and prevents a queued autosave from overwriting the completed record', async () => {
  const writer = new CreativeDraftWriter('one');
  const progress = writer.write(art('draft'), { finish: false, requirePreview: false, editVersion: 1, createdAt: 1 });
  const finish = writer.write(art('finished'), { finish: true, requirePreview: true, editVersion: 2, createdAt: 1 });
  const late = writer.write(art('late'), { finish: false, requirePreview: false, editVersion: 3, createdAt: 1 });
  await Promise.all([progress, finish, late]);
  const saved = await creativeStorage.getArtworkById('one');
  expect(saved).toMatchObject({ title: 'finished', previewDataUrl: 'finished', isDraft: false, editVersion: 2, createdAt: 1 });
  expect(saved?.completedAt).toBeGreaterThan(0);
});
it('requires a fresh capture to complete instead of silently reusing a stale draft preview', async () => {
  const writer = new CreativeDraftWriter('one');
  await writer.write(art('old'), { finish: false, requirePreview: false, editVersion: 1, createdAt: 1 });
  await expect(writer.write({ ...art('new'), previewDataUrl: '' }, { finish: true, requirePreview: true, editVersion: 2, createdAt: 1 })).rejects.toThrow();
  expect(await creativeStorage.getArtworkById('one')).toMatchObject({ title: 'old', isDraft: true });
});
it('keeps the last committed base on failure and accepts a later retry', async () => {
  const writer = new CreativeDraftWriter('one');
  await writer.write(art('old'), { finish: false, requirePreview: false, editVersion: 1, createdAt: 1 });
  vi.spyOn(creativeStorage, 'saveArtwork').mockRejectedValueOnce(new Error('quota'));
  await expect(writer.write(art('failed'), { finish: true, requirePreview: true, editVersion: 2, createdAt: 1 })).rejects.toThrow('quota');
  expect(writer.completed).toBe(false);
  await writer.write(art('retry'), { finish: true, requirePreview: true, editVersion: 2, createdAt: 1 });
  expect(await creativeStorage.getArtworkById('one')).toMatchObject({ title: 'retry', isDraft: false });
});
it('keeps delivery acknowledgement when a later edit autosaves through the existing writer',async()=>{
 const writer=new CreativeDraftWriter('one');
 await writer.write(art('first'),{finish:false,requirePreview:false,editVersion:1,createdAt:1});
 const saved=(await creativeStorage.getArtworkById('one'))!;
 await creativeStorage.saveArtwork({...saved,submittedArtworkId:'teacher-copy',submittedEditVersion:1,submissionState:'submitted'});
 await writer.write(art('second'),{finish:false,requirePreview:false,editVersion:2,createdAt:1});
 expect(await creativeStorage.getArtworkById('one')).toMatchObject({submittedArtworkId:'teacher-copy',submittedEditVersion:1,submissionState:'local_only',isDraft:true,editVersion:2});
});
