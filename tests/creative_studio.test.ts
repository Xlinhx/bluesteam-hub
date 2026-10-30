import { describe, it, expect, beforeEach } from 'vitest';
import { creativeStorage, CreativeArtwork, HabitatPlacedItem } from '../src/shared/creative/creativeStorage';

describe('Chặng 5: Creative Studio & Persistence Tests', () => {
  beforeEach(async () => {
    await creativeStorage.clearAll();
  });

  it('should save and retrieve a 2D drawing artwork with template metadata', async () => {
    const drawingArtwork: CreativeArtwork = {
      id: 'artwork-test-1',
      type: 'drawing',
      title: 'Bức tranh Rùa Xanh',
      createdAt: Date.now(),
      previewDataUrl: 'data:image/png;base64,sampledrawing',
      drawingData: {
        template: 'turtle',
        canvasDataUrl: 'data:image/png;base64,sampledrawing',
      },
    };

    await creativeStorage.saveArtwork(drawingArtwork);

    const retrieved = await creativeStorage.getArtworkById('artwork-test-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe('artwork-test-1');
    expect(retrieved?.type).toBe('drawing');
    expect(retrieved?.title).toBe('Bức tranh Rùa Xanh');
    expect(retrieved?.drawingData?.template).toBe('turtle');
  });

  it('should save and retrieve a 3D habitat artwork with placed items', async () => {
    const items: HabitatPlacedItem[] = [
      { id: 'item-1', type: 'coral', x: -2, z: -1, rotation: 0, scale: 1 },
      { id: 'item-2', type: 'seagrass', x: 2, z: 1, rotation: 0.5, scale: 1.2 },
      { id: 'item-3', type: 'fish', x: 0, z: -2, rotation: 0, scale: 1 },
    ];

    const habitatArtwork: CreativeArtwork = {
      id: 'habitat-test-1',
      type: 'habitat',
      title: 'Sinh cảnh San Hô Đáy Biển',
      createdAt: Date.now(),
      previewDataUrl: 'data:image/png;base64,samplehabitat',
      habitatData: {
        items,
      },
    };

    await creativeStorage.saveArtwork(habitatArtwork);

    const retrieved = await creativeStorage.getArtworkById('habitat-test-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe('habitat-test-1');
    expect(retrieved?.type).toBe('habitat');
    expect(retrieved?.habitatData?.items).toHaveLength(3);
    expect(retrieved?.habitatData?.items[0].type).toBe('coral');
    expect(retrieved?.habitatData?.items[2].type).toBe('fish');
  });

  it('should list all artworks sorted chronologically descending', async () => {
    const art1: CreativeArtwork = {
      id: 'art-older',
      type: 'drawing',
      title: 'Tranh cũ',
      createdAt: 1000,
      previewDataUrl: '',
    };
    const art2: CreativeArtwork = {
      id: 'art-newer',
      type: 'habitat',
      title: 'Sinh cảnh mới',
      createdAt: 2000,
      previewDataUrl: '',
    };

    await creativeStorage.saveArtwork(art1);
    await creativeStorage.saveArtwork(art2);

    const all = await creativeStorage.getArtworks();
    expect(all).toHaveLength(2);
    expect(all[0].id).toBe('art-newer');
    expect(all[1].id).toBe('art-older');
  });

  it('should delete specified artwork correctly', async () => {
    const art: CreativeArtwork = {
      id: 'art-to-delete',
      type: 'drawing',
      title: 'Xóa tôi đi',
      createdAt: Date.now(),
      previewDataUrl: '',
    };

    await creativeStorage.saveArtwork(art);
    expect(await creativeStorage.getArtworkById('art-to-delete')).not.toBeNull();

    await creativeStorage.deleteArtwork('art-to-delete');
    expect(await creativeStorage.getArtworkById('art-to-delete')).toBeNull();
  });
});
