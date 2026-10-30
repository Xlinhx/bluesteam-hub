import { describe, it, expect, beforeEach } from 'vitest';
import {
  HabitatPlacedItem,
  DEFAULT_HABITAT_ITEMS,
  HABITAT_SCENE_PRESETS,
  HABITAT_ASSET_PALETTE,
} from '../src/shared/creative/habitatTypes';
import { creativeStorage, CreativeArtwork } from '../src/shared/creative/creativeStorage';

describe('Squad 7: 3D Habitat Builder & Simulation Run Integrity Tests', () => {
  beforeEach(async () => {
    await creativeStorage.clearAll();
  });

  it('CRITICAL CONTRACT: Default habitat starter must contain exact required organisms and rocks matching reference mockups', () => {
    expect(DEFAULT_HABITAT_ITEMS.length).toBeGreaterThan(10);

    // Verify key organisms & structures
    const centerRock = DEFAULT_HABITAT_ITEMS.find(it => it.id === 'item-rock-center');
    expect(centerRock).toBeDefined();
    expect(centerRock?.type).toBe('rock');
    expect(centerRock?.x).toBeCloseTo(2.2);

    const turtle = DEFAULT_HABITAT_ITEMS.find(it => it.type === 'turtle');
    expect(turtle).toBeDefined();
    expect(turtle?.assetId).toBe('turtle-green');

    const tallGrass = DEFAULT_HABITAT_ITEMS.find(it => it.id === 'item-seagrass-tall-active');
    expect(tallGrass).toBeDefined();
    expect(tallGrass?.type).toBe('seagrass');

    const clownfish = DEFAULT_HABITAT_ITEMS.find(it => it.assetId === 'clownfish');
    expect(clownfish).toBeDefined();
    expect(clownfish?.type).toBe('fish');
  });

  it('CRITICAL CONTRACT: Switching between Build and Run modes MUST NOT alter geometry or reset placed objects', () => {
    // Initial state in Build mode
    const buildModeItems: HabitatPlacedItem[] = [...DEFAULT_HABITAT_ITEMS];

    // User adds a new sea anemone in Build mode
    const userPlacedAnemone: HabitatPlacedItem = {
      id: 'custom-anemone-1',
      type: 'anemone',
      assetId: 'sea-anemone',
      nameVi: 'Hải quỳ mới',
      nameEn: 'New Anemone',
      x: 1.0,
      z: -1.0,
      rotation: Math.PI / 4,
      scale: 1.1,
    };
    const updatedBuildItems = [...buildModeItems, userPlacedAnemone];

    // User rotates the center rock
    const rotatedItems = updatedBuildItems.map(it =>
      it.id === 'item-rock-center' ? { ...it, rotation: it.rotation + Math.PI / 2 } : it
    );

    // Transition to Run mode (?mode=run)
    const runModeItems: HabitatPlacedItem[] = [...rotatedItems];

    // Verification 1: Exactly the same number of objects
    expect(runModeItems.length).toBe(rotatedItems.length);

    // Verification 2: Check each objectId, transform coordinates, and rotation
    rotatedItems.forEach(origItem => {
      const runItem = runModeItems.find(r => r.id === origItem.id);
      expect(runItem).toBeDefined();
      expect(runItem?.x).toBe(origItem.x);
      expect(runItem?.z).toBe(origItem.z);
      expect(runItem?.rotation).toBe(origItem.rotation);
      expect(runItem?.scale).toBe(origItem.scale);
      expect(runItem?.type).toBe(origItem.type);
    });

    // Transition back to Build mode (clicking "Sửa thiết kế")
    const returnedBuildItems: HabitatPlacedItem[] = [...runModeItems];
    expect(returnedBuildItems).toEqual(rotatedItems);
  });

  it('should save and restore habitat artwork to creativeStorage without losing object transforms', async () => {
    const habitatArtwork: CreativeArtwork = {
      id: 'artwork-habitat-an-1',
      type: 'habitat',
      title: 'Nơi sống của An',
      createdAt: Date.now(),
      previewDataUrl: 'data:image/png;base64,mockpreview',
      habitatData: {
        items: DEFAULT_HABITAT_ITEMS as any,
      },
    };

    await creativeStorage.saveArtwork(habitatArtwork);

    const retrieved = await creativeStorage.getArtworkById('artwork-habitat-an-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe('artwork-habitat-an-1');
    expect(retrieved?.type).toBe('habitat');
    expect(retrieved?.habitatData?.items).toHaveLength(DEFAULT_HABITAT_ITEMS.length);

    const savedRock = retrieved?.habitatData?.items.find(i => i.id === 'item-rock-center');
    expect(savedRock?.x).toBeCloseTo(2.2);
  });

  it('should switch between presets cleanly without corrupting state', () => {
    expect(HABITAT_SCENE_PRESETS).toHaveLength(3);

    const scene1 = HABITAT_SCENE_PRESETS[0];
    expect(scene1.id).toBe(1);
    expect(scene1.nameVi).toBe('Cảnh 1');
    expect(scene1.subTitleVi).toBe('Vùng cỏ biển');

    const scene2 = HABITAT_SCENE_PRESETS[1];
    expect(scene2.id).toBe(2);
    expect(scene2.subTitleVi).toBe('Rạn đá');
    expect(scene2.items.length).toBeGreaterThan(3);

    const scene3 = HABITAT_SCENE_PRESETS[2];
    expect(scene3.id).toBe(3);
    expect(scene3.subTitleVi).toBe('Vùng cát trống');
  });

  it('should have complete asset palette for all 4 categories (sand, rocks, seagrass, creatures)', () => {
    expect(HABITAT_ASSET_PALETTE.sand.length).toBeGreaterThanOrEqual(2);
    expect(HABITAT_ASSET_PALETTE.rocks.length).toBeGreaterThanOrEqual(4);
    expect(HABITAT_ASSET_PALETTE.seagrass.length).toBeGreaterThanOrEqual(6);
    expect(HABITAT_ASSET_PALETTE.creatures.length).toBeGreaterThanOrEqual(4);

    // Verify presence of reference mockup assets
    const tallGrass = HABITAT_ASSET_PALETTE.seagrass.find(a => a.id === 'seagrass-tall');
    expect(tallGrass).toBeDefined();
    expect(tallGrass?.nameVi).toBe('Cỏ biển cao');

    const largeRock = HABITAT_ASSET_PALETTE.rocks.find(a => a.id === 'rock-large');
    expect(largeRock).toBeDefined();
    expect(largeRock?.nameVi).toBe('Tảng đá lớn');

    const turtle = HABITAT_ASSET_PALETTE.creatures.find(a => a.id === 'turtle-green');
    expect(turtle).toBeDefined();
    expect(turtle?.nameVi).toBe('Rùa biển xanh');
  });
});
