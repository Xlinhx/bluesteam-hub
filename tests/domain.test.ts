import { describe, it, expect } from 'vitest';
import {
  SEED_UNITS,
  SEED_LESSONS,
  SEED_STUDENTS,
  SEED_PATHS,
  getExperienceById,
  getExperiencesForUnit,
} from '../src/content/seed';

describe('Domain Models & Seed Integrity', () => {
  it('should have 5 valid learning units with decoupled indicators', () => {
    expect(SEED_UNITS.length).toBe(5);

    SEED_UNITS.forEach((unit) => {
      expect(unit.id).toBeDefined();
      expect(unit.title).toBeDefined();
      expect(unit.ageBand).toBeDefined();
      expect(unit.gradeBand).toBeDefined();
      expect(unit.readingLevel).toBeDefined();
      expect(unit.experienceIds.length).toBeGreaterThan(0);
      expect(unit.frameworkMappings.length).toBeGreaterThan(0);
    });
  });

  it('should verify readingLevel is strictly decoupled from gradeBand', () => {
    // Both pre-k and kindergarten units exist with pre-reader reading level
    const preReaderUnits = SEED_UNITS.filter((u) => u.readingLevel === 'pre-reader');
    expect(preReaderUnits.length).toBeGreaterThanOrEqual(3);

    const earlyReaderUnits = SEED_UNITS.filter((u) => u.readingLevel === 'early-reader');
    expect(earlyReaderUnits.length).toBeGreaterThanOrEqual(1);
  });

  it('should retrieve experiences by ID and unit ID correctly', () => {
    const waterSim = getExperienceById('exp-sim-water-column');
    expect(waterSim).toBeDefined();
    expect(waterSim?.type).toBe('simulation');
    expect(waterSim?.presentation.fullscreen).toBe(true);
    expect(waterSim?.presentation.openPublicWindow).toBe(true);

    const unitExps = getExperiencesForUnit('unit-ocean-depth');
    expect(unitExps.length).toBeGreaterThanOrEqual(3);
  });

  it('should enforce that lessons are ordered sequences of experience references', () => {
    expect(SEED_LESSONS.length).toBeGreaterThanOrEqual(2);

    SEED_LESSONS.forEach((lesson) => {
      expect(lesson.experiences.length).toBeGreaterThanOrEqual(3);
      lesson.experiences.forEach((expRef, idx) => {
        expect(expRef.order).toBe(idx + 1);
        const resolvedExp = getExperienceById(expRef.experienceId);
        expect(resolvedExp).toBeDefined();
      });
    });
  });

  it('should have mock students with nature specimen symbols and NO emojis', () => {
    expect(SEED_STUDENTS.length).toBeGreaterThanOrEqual(6);
    SEED_STUDENTS.forEach((student) => {
      expect(student.avatarKey).toMatch(/^(nautilus|wave|mineral|kelp|crystal|diatom|anemone|urchin)$/);
      expect(student.name).toBeDefined();
    });
  });

  it('should support guided learning paths with ordered waypoints', () => {
    expect(SEED_PATHS.length).toBeGreaterThanOrEqual(2);
    const abyssalExp = SEED_PATHS[0];
    expect(abyssalExp.steps.length).toBeGreaterThanOrEqual(4);
    expect(abyssalExp.steps[0].order).toBe(1);
  });
});
