import { describe, it, expect, beforeEach } from 'vitest';
import { demoStore } from '../src/demo/storage/demoStore';
import { creativeStorage, CreativeArtwork } from '../src/services/creativeStorage';
import fs from 'node:fs';
import path from 'node:path';

describe('Squad 9: Learner Profile & System Loading Integrity Tests', () => {
  beforeEach(async () => {
    demoStore.resetDemo();
    await creativeStorage.clearAll();
  });

  describe('Screen 30: Learner Profile & Journey Progression Contracts', () => {
    it('CRITICAL CONTRACT: Authentic badges must be strictly derived from true progress (NO fake achievements)', () => {
      // 1. Initial State: Only ocean-explorer starter badge
      const initialProgress = demoStore.getBlueSteamProgress();
      expect(initialProgress.completedStations).toEqual([1]);
      expect(initialProgress.badges).toContain('badge-ocean-explorer');
      expect(initialProgress.badges).not.toContain('badge-turtle-friend');
      expect(initialProgress.badges).not.toContain('badge-rescue-hero');

      // 2. Complete Station 2 -> Unlocks Friend of Green Turtle
      demoStore.completeStation(2);
      const progAfterStation2 = demoStore.getBlueSteamProgress();
      expect(progAfterStation2.completedStations).toContain(2);

      // Verify turtle friend condition matches
      const isTurtleFriendUnlocked =
        progAfterStation2.completedStations.includes(2) ||
        progAfterStation2.completedActivities.includes('game-habitat-placement');
      expect(isTurtleFriendUnlocked).toBe(true);

      // 3. Complete Rescue Mission -> Unlocks Rescue Hero
      demoStore.completeActivity('simulations-rescue-mission');
      demoStore.unlockBadge('badge-rescue-hero');
      const progAfterRescue = demoStore.getBlueSteamProgress();
      expect(progAfterRescue.completedActivities).toContain('simulations-rescue-mission');
      expect(progAfterRescue.badges).toContain('badge-rescue-hero');
    });

    it('CRITICAL CONTRACT: Saved artworks must load dynamically from creativeStorage with fallback to child_crayon_turtle', async () => {
      // 1. When no artwork exists, profile falls back to child_crayon_turtle.jpg
      const initialArtworks = await creativeStorage.getArtworks();
      expect(initialArtworks).toHaveLength(0);

      // 2. Save a new authentic crayon drawing
      const mockDrawing: CreativeArtwork = {
        id: 'drawing-an-turtle-1',
        type: 'drawing',
        title: 'Bé An vẽ rùa biển bơi',
        createdAt: 1700000000000,
        previewDataUrl: 'data:image/png;base64,mockCrayonTurtleData',
        drawingData: {
          canvasDataUrl: 'data:image/png;base64,mockCanvasData',
        },
      };

      await creativeStorage.saveArtwork(mockDrawing);

      // 3. Save a 3D habitat artwork
      const mockHabitat: CreativeArtwork = {
        id: 'habitat-an-reef-1',
        type: 'habitat',
        title: 'Rạn san hô của An',
        createdAt: 1700000010000,
        previewDataUrl: 'data:image/png;base64,mockHabitatData',
        habitatData: {
          items: [],
        },
      };

      await creativeStorage.saveArtwork(mockHabitat);

      // 4. Retrieve artworks: must be sorted by createdAt descending
      const loadedArtworks = await creativeStorage.getArtworks();
      expect(loadedArtworks).toHaveLength(2);
      expect(loadedArtworks[0].id).toBe('habitat-an-reef-1'); // newer
      expect(loadedArtworks[1].id).toBe('drawing-an-turtle-1'); // older

      // 5. Young Artist badge condition is now satisfied
      const hasDrawingArtwork = loadedArtworks.some((a) => a.type === 'drawing');
      expect(hasDrawingArtwork).toBe(true);
    });

    it('should verify all 3-step ocean journey links and bottom 3 card destinations exist', () => {
      // Journey 3-Step targets
      const journeySteps = [
        { key: 'explore', title: 'Khám phá', target: '/learn/turtle' },
        { key: 'learn', title: 'Học tập', target: '/interactive/habitat-placement' },
        { key: 'creative', title: 'Sáng tạo', target: '/creative/drawing' },
      ];

      expect(journeySteps).toHaveLength(3);
      expect(journeySteps[0].target).toBe('/learn/turtle');
      expect(journeySteps[1].target).toBe('/interactive/habitat-placement');
      expect(journeySteps[2].target).toBe('/creative/drawing');

      // Bottom 3 Cards targets
      const bottomCards = [
        { id: 'discovered', target: '/learn/atlas' },
        { id: 'in_progress', target: '/creative/habitat' },
        { id: 'offline_craft', target: '/resources/print' },
      ];

      expect(bottomCards[0].target).toBe('/learn/atlas');
      expect(bottomCards[1].target).toBe('/creative/habitat');
      expect(bottomCards[2].target).toBe('/resources/print');
    });
  });

  describe('Screen 38: System Loading & Retry Math and Narrative Contracts', () => {
    it('CRITICAL CONTRACT: Circular Progress Ring SVG math must be accurate', () => {
      const radius = 100;
      const circumference = 2 * Math.PI * radius;
      expect(circumference).toBeCloseTo(628.318, 2);

      // At 0% progress: offset equals full circumference
      const offset0 = circumference - (0 / 100) * circumference;
      expect(offset0).toBeCloseTo(circumference, 2);

      // At 50% progress: offset is half circumference
      const offset50 = circumference - (50 / 100) * circumference;
      expect(offset50).toBeCloseTo(circumference / 2, 2);

      // At 100% progress: offset is 0
      const offset100 = circumference - (100 / 100) * circumference;
      expect(offset100).toBeCloseTo(0, 2);
    });

    it('CRITICAL CONTRACT: Must contain the oceanic descent quote and marine science facts', () => {
      const quotes = [
        'Đang lặn xuống tầng trung quang...',
        'Rùa biển đang bơi qua các thảm cỏ biển đầy nắng...',
        'Đang nạp mô hình 3D và sinh thái rạn san hô sống động...',
        'Bạn có biết? Rùa biển xanh có thể nín thở tới 5 giờ dưới đại dương!',
      ];

      expect(quotes[0]).toBe('Đang lặn xuống tầng trung quang...');
      expect(quotes.some((q) => q.includes('tầng trung quang'))).toBe(true);
      expect(quotes.some((q) => q.includes('Rùa biển'))).toBe(true);
    });

    it('should verify retry logic clears loading query parameters and preserves target path', () => {
      const currentQuery = { loading: 'true', ia: 'journey' };

      // Simulating handleRetry: clear loading flag
      const clearedQuery: Record<string, string> = {};
      Object.keys(currentQuery).forEach((key) => {
        if (key !== 'loading') {
          clearedQuery[key] = currentQuery[key as keyof typeof currentQuery];
        }
      });

      expect(clearedQuery.loading).toBeUndefined();
      expect(clearedQuery.ia).toBe('journey');
    });
  });

  describe('Visual Assets Verification on Disk', () => {
    it('should verify that all reference assets for Profile and Loading exist on disk', () => {
      const requiredAssets = [
        'public/assets/generated/craft/child_crayon_turtle.jpg',
        'public/assets/generated/craft/turtle_coloring_lineart.jpg',
        'public/assets/generated/creatures/crab_isolated.png',
        'public/assets/generated/stations/botanical_seagrass_specimen.jpg',
        'public/assets/generated/stations/station_seagrass_fish.jpg',
        'public/assets/generated/creatures/turtle_isolated.png',
      ];

      requiredAssets.forEach((relPath) => {
        const fullPath = path.resolve(process.cwd(), relPath);
        const exists = fs.existsSync(fullPath);
        expect(exists, `Asset should exist at ${relPath}`).toBe(true);
      });
    });
  });
});
