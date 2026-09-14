import { describe, it, expect } from 'vitest';
import { OCEAN_RESOURCES } from '../src/content/resourcesData';

describe('Milestone 4 — Squad 5: Kho học liệu & Media Hub Verification', () => {
  describe('Screen 3 & Screen 10: Resources Catalog & Curated Overview', () => {
    it('should provide complete taxonomy coverage for all resource categories', () => {
      const types = new Set(OCEAN_RESOURCES.map((r) => r.type));
      expect(types.has('flashcard')).toBe(true);
      expect(types.has('video')).toBe(true);
      expect(types.has('coloring')).toBe(true);
      expect(types.has('worksheet')).toBe(true);
    });

    it('should satisfy design tokens and metadata specifications for all items', () => {
      OCEAN_RESOURCES.forEach((item) => {
        expect(item.id).toBeTruthy();
        expect(item.titleVi).toBeTruthy();
        expect(item.summaryVi).toBeTruthy();
        expect(item.durationMinutes).toBeGreaterThan(0);
        expect(item.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('should maintain consistent topic mapping across ecosystems', () => {
      const validTopics = ['coastal', 'reef', 'seagrass', 'openOcean', 'abyss'];
      OCEAN_RESOURCES.forEach((item) => {
        expect(validTopics).toContain(item.topic);
      });
    });
  });

  describe('Screen 11: 3D Flashcard Detail', () => {
    it('should verify all flashcards have required biological traits and pronunciation data', () => {
      const flashcards = OCEAN_RESOURCES.filter((r) => r.type === 'flashcard');
      expect(flashcards.length).toBeGreaterThanOrEqual(5);

      flashcards.forEach((fc) => {
        expect(fc.flashcardData).toBeDefined();
        const data = fc.flashcardData!;
        expect(data.scientificName).toBeTruthy();
        expect(data.depthVi).toBeTruthy();
        expect(data.dietVi).toBeTruthy();
        expect(data.statusVi).toBeTruthy();
        expect(data.funFactVi).toBeTruthy();
        expect(data.pronunciationAudioTextVi).toBeTruthy();
      });
    });

    it('should ensure green sea turtle has accurate biological depth and diet', () => {
      const turtle = OCEAN_RESOURCES.find((r) => r.id === 'flashcard-green-turtle');
      expect(turtle).toBeDefined();
      expect(turtle!.flashcardData!.scientificName).toBe('Chelonia mydas');
      expect(turtle!.flashcardData!.depthVi).toContain('0 - 50m');
      expect(turtle!.flashcardData!.dietVi).toContain('Cỏ biển');
    });
  });

  describe('Screen 12: Ocean Video Player', () => {
    it('should have authentic scientific chapters without external cartoon mocks', () => {
      const videos = OCEAN_RESOURCES.filter((r) => r.type === 'video');
      expect(videos.length).toBeGreaterThanOrEqual(2);

      videos.forEach((video) => {
        expect(video.videoData).toBeDefined();
        const chapters = video.videoData!.chapters;
        expect(chapters.length).toBeGreaterThanOrEqual(2);
        chapters.forEach((ch) => {
          expect(ch.timeSeconds).toBeGreaterThanOrEqual(0);
          expect(ch.titleVi).toBeTruthy();
          expect(ch.descVi).toBeTruthy();
        });
      });
    });

    it('should verify chapter timestamps are monotonically non-decreasing', () => {
      const videos = OCEAN_RESOURCES.filter((r) => r.type === 'video');
      videos.forEach((video) => {
        const chapters = video.videoData!.chapters;
        for (let i = 1; i < chapters.length; i++) {
          expect(chapters[i].timeSeconds).toBeGreaterThan(chapters[i - 1].timeSeconds);
        }
      });
    });
  });

  describe('Screen 13: Printable Preview A4', () => {
    it('should support printable coloring and worksheet templates with valid instructions', () => {
      const printables = OCEAN_RESOURCES.filter(
        (r) => r.type === 'coloring' || r.type === 'worksheet'
      );
      expect(printables.length).toBeGreaterThanOrEqual(4);

      printables.forEach((item) => {
        expect(item.printableData).toBeDefined();
        expect(item.printableData!.instructionsVi).toBeTruthy();
        expect(item.printableData!.svgTemplate).toBeTruthy();
      });
    });
  });
});
