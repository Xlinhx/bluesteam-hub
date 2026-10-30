import { beforeEach, describe, expect, it } from 'vitest';
import { creativeStorage, type CreativeArtwork } from '../src/shared/creative/creativeStorage';
import { readSavedArtwork } from '../src/shared/creative/artworkCompletion';

const art = (id: string, extra: Partial<CreativeArtwork> = {}): CreativeArtwork => ({ id, type: 'drawing', title: id, createdAt: 10, previewDataUrl: 'preview', ...extra });

beforeEach(() => creativeStorage.clearAll());
describe('profile completed collection', () => {
  it('includes all legacy types and completed work but excludes in-progress revisions regardless of delivery state', async () => {
    const records = [art('old'), art('scan', { type: 'scan' }), art('habitat', { type: 'habitat', isDraft: false }), art('draft', { isDraft: true, submissionState: 'submitted' }), art('revision', { isDraft: true, sourceArtworkId: 'old' }), art('failed', { submissionState: 'failed', completedAt: 25 })];
    const before = structuredClone(records);
    for (const record of records) await creativeStorage.saveArtwork(record);
    const pages = await Promise.all((['drawing', 'scan', 'habitat'] as const).map(async kind => [kind, (await creativeStorage.getCompletedArtworkPage(kind)).items.map(item => item.id)]));
    expect(pages).toEqual([
      ['drawing', ['failed', 'old']], ['scan', ['scan']], ['habitat', ['habitat']],
    ]);
    expect(records).toEqual(before);
  });
  it('orders by completion time rather than later delivery updates, with stable ties and unknown dates last', async () => {
    const records = [art('b', { completedAt: 20, updatedAt: 999 }), art('a', { completedAt: 20 }), art('new', { completedAt: 30 }), art('unknown', { createdAt: 1e20 })];
    for (const record of records) await creativeStorage.saveArtwork(record);
    expect((await creativeStorage.getCompletedArtworkPage('drawing')).items.map(item => item.id)).toEqual(['new', 'a', 'b', 'unknown']);
  });
  it('keeps corrupt previews and empty titles accessible, and counts a multi-scene project once', async () => {
    expect(readSavedArtwork(art('empty', { title: '   ', previewDataUrl: '' }))?.title).toBe('');
    const project = { version: 1 as const, activeSceneId: 'a', scenes: [{ id: 'a', title: 'A', items: [] }, { id: 'b', title: 'B', items: [] }] };
    await creativeStorage.saveArtwork(art('project', { type: 'habitat', habitatData: { items: [], project } }));
    const page = await creativeStorage.getCompletedArtworkPage('habitat');
    expect(page.total).toBe(1);
    expect(page.items[0].sceneCount).toBe(2);
    expect((await creativeStorage.getCompletedArtworkPage('scan')).items).toEqual([]);
  });
  it('does not turn an out-of-range timestamp into a date that crashes the collection', () => {
    expect(readSavedArtwork(art('bad-time', { createdAt: 1e20, updatedAt: Infinity, completedAt: NaN }))?.savedAt).toBeNull();
  });
});
