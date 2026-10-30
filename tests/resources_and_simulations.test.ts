import { describe, it, expect, beforeEach } from 'vitest';
import { OCEAN_RESOURCES } from '../src/domains/learner/resources/resourcesData';
import { demoStore } from '../src/shared/realtime/demoStore';

describe('Chặng 4: Resources, Media, Flashcards & Simulations Verification', () => {
  beforeEach(() => {
    demoStore.resetDemo();
  });

  describe('1. Ocean Resources Catalog Dataset', () => {
    it('should contain complete resources covering all required types', () => {
      expect(OCEAN_RESOURCES.length).toBeGreaterThanOrEqual(8);

      const types = new Set(OCEAN_RESOURCES.map((r) => r.type));
      expect(types.has('flashcard')).toBe(true);
      expect(types.has('video')).toBe(true);
      expect(types.has('coloring')).toBe(true);
      expect(types.has('worksheet')).toBe(true);
    });

    it('should have valid bilingual titles and summaries for all resources', () => {
      OCEAN_RESOURCES.forEach((r) => {
        expect(r.id).toBeTruthy();
        expect(r.titleVi).toBeTruthy();
        expect(r.titleEn).toBeTruthy();
        expect(r.summaryVi).toBeTruthy();
        expect(r.summaryEn).toBeTruthy();
        expect(r.durationMinutes).toBeGreaterThan(0);
        expect(r.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('should verify flashcards contain complete biological traits', () => {
      const flashcards = OCEAN_RESOURCES.filter((r) => r.type === 'flashcard');
      expect(flashcards.length).toBeGreaterThanOrEqual(5);

      flashcards.forEach((fc) => {
        expect(fc.flashcardData).toBeDefined();
        const data = fc.flashcardData!;
        expect(data.scientificName).toBeTruthy();
        expect(data.depthVi).toBeTruthy();
        expect(data.depthEn).toBeTruthy();
        expect(data.dietVi).toBeTruthy();
        expect(data.dietEn).toBeTruthy();
        expect(data.statusVi).toBeTruthy();
        expect(data.statusEn).toBeTruthy();
        expect(data.funFactVi).toBeTruthy();
        expect(data.funFactEn).toBeTruthy();
        expect(data.pronunciationAudioTextVi).toBeTruthy();
        expect(data.pronunciationAudioTextEn).toBeTruthy();
      });
    });

    it('should verify printable sheets have valid SVG templates and parent tips', () => {
      const printables = OCEAN_RESOURCES.filter((r) => r.type === 'coloring' || r.type === 'worksheet');
      expect(printables.length).toBeGreaterThanOrEqual(4);

      const validTemplates = ['turtle', 'clownfish', 'depth-match', 'current-maze'];
      printables.forEach((p) => {
        expect(p.printableData).toBeDefined();
        expect(validTemplates).toContain(p.printableData!.svgTemplate);
        expect(p.printableData!.instructionsVi).toBeTruthy();
        expect(p.printableData!.instructionsEn).toBeTruthy();
      });
    });

    it('should verify video lessons have structured scientific chapters without external cartoon mocks', () => {
      const videos = OCEAN_RESOURCES.filter((r) => r.type === 'video');
      expect(videos.length).toBeGreaterThanOrEqual(2);

      videos.forEach((v) => {
        expect(v.videoData).toBeDefined();
        expect(v.videoData!.chapters.length).toBeGreaterThanOrEqual(2);
        v.videoData!.chapters.forEach((ch) => {
          expect(ch.timeSeconds).toBeGreaterThanOrEqual(0);
          expect(ch.titleVi).toBeTruthy();
          expect(ch.titleEn).toBeTruthy();
          expect(ch.descVi).toBeTruthy();
          expect(ch.descEn).toBeTruthy();
        });
      });
    });
  });

  describe('2. Rescue Mission Simulation & NOAA Standards', () => {
    it('should support unlocking the Ocean Rescue Hero badge upon mission completion', () => {
      const initialBadges = demoStore.getBlueSteamProgress().badges;
      expect(initialBadges).not.toContain('badge-rescue-hero');

      demoStore.unlockBadge('badge-rescue-hero');

      const updatedBadges = demoStore.getBlueSteamProgress().badges;
      expect(updatedBadges).toContain('badge-rescue-hero');
    });

    it('should not duplicate badges if unlocked multiple times', () => {
      demoStore.unlockBadge('badge-rescue-hero');
      demoStore.unlockBadge('badge-rescue-hero');

      const badges = demoStore.getBlueSteamProgress().badges;
      const count = badges.filter((b) => b === 'badge-rescue-hero').length;
      expect(count).toBe(1);
    });
  });
});
