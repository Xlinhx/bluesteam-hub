import { describe, it, expect, beforeEach } from 'vitest';
import {
  migrateLegacyArtworkRecord,
  migrateDraftCollection,
  exportDraftsToJson,
  importDraftsFromJson,
  R2_CREATIVE_SCHEMA_VERSION,
} from '../src/shared/creative/localDraftMigration';
import {
  creativeStorage,
  type CreativeArtwork,
} from '../src/shared/creative/creativeStorage';

describe('Task 8 — Local Creative Draft Migration, Export & Recovery', () => {
  beforeEach(async () => {
    await creativeStorage.clearAll();
  });

  it('migrates legacy v1 drawing and habitat fixtures idempotently across multiple runs without data loss', async () => {
    const legacyDrawing: CreativeArtwork = {
      id: 'legacy-draw-001',
      type: 'drawing',
      title: 'Tranh vẽ cá hề v1',
      createdAt: 1700000001000,
      previewDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB',
      drawingData: {
        template: 'clownfish',
        canvasDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB',
      },
    };

    const legacyHabitat: CreativeArtwork = {
      id: 'legacy-hab-002',
      type: 'habitat',
      title: 'Sa bàn rạn san hô v1',
      createdAt: 1700000002000,
      previewDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAC',
      habitatData: {
        items: [
          { id: 'item-1', type: 'coral', x: -1.5, z: 2.25, rotation: 0.5, scale: 1.2 },
          { id: 'item-2', type: 'fish', x: 0.8, z: -0.4, rotation: 1.1, scale: 0.9 },
        ],
      },
    };

    const store = new Map<string, CreativeArtwork>();
    store.set(legacyDrawing.id, legacyDrawing);
    store.set(legacyHabitat.id, legacyHabitat);

    // First migration pass
    const pass1 = await migrateDraftCollection(
      Array.from(store.values()),
      async (draft) => {
        store.set(draft.id, draft);
      },
      async (id) => store.get(id) || null,
    );

    expect(pass1.upgradedCount).toBe(2);
    expect(pass1.migrated[0].schemaVersion).toBe(R2_CREATIVE_SCHEMA_VERSION);
    expect(pass1.migrated[0].clientSubmissionId).toBe(
      'sub-legacy-draw-001-1700000001000',
    );
    expect(pass1.migrated[1].habitatData?.items).toEqual([
      { id: 'item-1', type: 'coral', x: -1.5, z: 2.25, rotation: 0.5, scale: 1.2 },
      { id: 'item-2', type: 'fish', x: 0.8, z: -0.4, rotation: 1.1, scale: 0.9 },
    ]);

    // Second migration pass must be a no-op (upgradedCount = 0) and produce identical records
    const pass2 = await migrateDraftCollection(
      Array.from(store.values()),
      async (draft) => {
        store.set(draft.id, draft);
      },
      async (id) => store.get(id) || null,
    );

    expect(pass2.upgradedCount).toBe(0);
    expect(pass2.migrated).toEqual(pass1.migrated);
    expect(migrateLegacyArtworkRecord(pass1.migrated[0])).toEqual(pass1.migrated[0]);
  });

  it('exports drafts to JSON and recovers them into creativeStorage preserving pending/submitted state and scene items', async () => {
    await creativeStorage.saveArtwork({
      id: 'draft-recover-1',
      type: 'drawing',
      title: 'Tranh rùa xanh chờ gửi',
      createdAt: 1700000010000,
      previewDataUrl: 'data:image/png;base64,AAA',
      submissionState: 'pending',
      clientSubmissionId: 'sub-fixed-turtle-001',
      lastSubmissionError: 'Mất kết nối mạng',
    });

    const jsonBundle = await creativeStorage.exportBundle();
    expect(jsonBundle).toContain('sub-fixed-turtle-001');

    // Simulate recovering from bundle into another storage instance
    await creativeStorage.clearAll();
    expect(await creativeStorage.getArtworks()).toHaveLength(0);

    const recovered = await creativeStorage.recoverFromBundle(jsonBundle);
    expect(recovered).toHaveLength(1);
    expect(recovered[0].id).toBe('draft-recover-1');
    expect(recovered[0].clientSubmissionId).toBe('sub-fixed-turtle-001');
    expect(recovered[0].submissionState).toBe('pending');

    const afterAck = recovered[0];
    // Verify raw JSON helpers also round-trip cleanly
    const reimported = importDraftsFromJson(exportDraftsToJson([afterAck!]));
    expect(reimported[0].submissionState).toBe('pending');
  });
});
