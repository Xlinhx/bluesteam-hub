import { describe, it, expect } from 'vitest';
import {
  SCREENS_REGISTRY,
  getScreenById,
  getScreenByIndex,
  getScreenByRoute,
  getStoredConcept,
  setStoredConcept,
  STUDENT_TOUR,
  TEACHER_TOUR,
  ROLE_GROUP_LABELS,
} from '../src/showcase/registry';
import { oceanShowcaseStore } from '../src/demo/storage/oceanShowcaseStore';

describe('Showcase Registry & 27 Variants Verification', () => {
  it('should have exactly 14 canonical screens defined', () => {
    expect(SCREENS_REGISTRY).toHaveLength(14);
    const indices = SCREENS_REGISTRY.map((s) => s.index);
    expect(indices).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });

  it('should contain exactly 27 total variants across all 14 screens', () => {
    const totalVariants = SCREENS_REGISTRY.reduce((acc, s) => acc + s.variants.length, 0);
    expect(totalVariants).toBe(27);

    // Screen 01: Landing has 3 variants (A, B, C)
    const screen01 = getScreenById('landingpage');
    expect(screen01?.variants).toHaveLength(3);
    expect(screen01?.variants.map((v) => v.key)).toEqual(['a', 'b', 'c']);

    // Screens 02-12: each has 2 variants (A, B)
    const screens02to12 = SCREENS_REGISTRY.filter((s) => s.index >= 2 && s.index <= 12);
    expect(screens02to12).toHaveLength(11);
    screens02to12.forEach((screen) => {
      expect(screen.variants).toHaveLength(2);
      expect(screen.variants.map((v) => v.key)).toEqual(['a', 'b']);
    });

    // Screen 13: Join Class has 1 variant (single)
    const screen13 = getScreenById('joinclass');
    expect(screen13?.variants).toHaveLength(1);
    expect(screen13?.variants[0].key).toBe('single');

    // Screen 14: Teacher Login has 1 variant (single)
    const screen14 = getScreenById('login');
    expect(screen14?.variants).toHaveLength(1);
    expect(screen14?.variants[0].key).toBe('single');
  });

  it('should verify that all 27 reference crop paths are well-formed and unique', () => {
    const allFiles: string[] = [];
    SCREENS_REGISTRY.forEach((screen) => {
      screen.variants.forEach((variant) => {
        expect(variant.referenceCropFile).toMatch(/^references\/.+\.png$/);
        allFiles.push(variant.referenceCropFile);
      });
    });

    expect(allFiles).toHaveLength(27);
    const uniqueFiles = new Set(allFiles);
    expect(uniqueFiles.size).toBe(27);
  });

  it('should have valid role group assignments for all screens', () => {
    const validRoles = Object.keys(ROLE_GROUP_LABELS);
    SCREENS_REGISTRY.forEach((screen) => {
      expect(validRoles).toContain(screen.roleGroup);
      expect(screen.name).toBeTruthy();
      expect(screen.description).toBeTruthy();
      expect(screen.route).toBeTruthy();
    });
  });

  it('should lookup screens correctly by id, index, and route', () => {
    expect(getScreenById('studenthome')?.name).toBe('Trang chủ của bé An');
    expect(getScreenByIndex(14)?.id).toBe('login');
    expect(getScreenByRoute('/student/journey')?.id).toBe('studentjourney');
    expect(getScreenByRoute('/teacher/live')?.id).toBe('liveclass');
    expect(getScreenByRoute('/presentation')?.id).toBe('presentation');
    expect(getScreenByRoute('/login')?.id).toBe('login');
    expect(getScreenByRoute('/')?.id).toBe('landingpage');
  });

  it('should validate localStorage concept persistence helpers', () => {
    setStoredConcept('studenthome', 'b');
    expect(getStoredConcept('studenthome')).toBe('b');

    setStoredConcept('studenthome', 'a');
    expect(getStoredConcept('studenthome')).toBe('a');
  });

  it('should validate the 2 guided tour paths', () => {
    // Student tour: 6 steps
    expect(STUDENT_TOUR).toHaveLength(6);
    expect(STUDENT_TOUR[0].screenId).toBe('landingpage');
    expect(STUDENT_TOUR[1].screenId).toBe('studenthome');
    expect(STUDENT_TOUR[2].screenId).toBe('studentjourney');
    expect(STUDENT_TOUR[3].screenId).toBe('learningunit');
    expect(STUDENT_TOUR[4].screenId).toBe('simulation');
    expect(STUDENT_TOUR[5].screenId).toBe('studentprogress');

    // Teacher tour: 7 steps
    expect(TEACHER_TOUR).toHaveLength(7);
    expect(TEACHER_TOUR[0].screenId).toBe('login');
    expect(TEACHER_TOUR[1].screenId).toBe('teacherdashboard');
    expect(TEACHER_TOUR[2].screenId).toBe('teacherlibrary');
    expect(TEACHER_TOUR[3].screenId).toBe('lessonbuilder');
    expect(TEACHER_TOUR[4].screenId).toBe('liveclass');
    expect(TEACHER_TOUR[5].screenId).toBe('presentation');
    expect(TEACHER_TOUR[6].screenId).toBe('sessionresults');
  });

  it('should manage live showcase state and reset faithfully', () => {
    const initialState = oceanShowcaseStore.getState();
    expect(initialState.totalStudents).toBe(24);
    expect(initialState.rightVotes).toBe(20);
    expect(initialState.leftVotes).toBe(4);

    // Modify state
    oceanShowcaseStore.setWindDirection('left');
    oceanShowcaseStore.setWindStrength('strong');
    expect(oceanShowcaseStore.getState().windDirection).toBe('left');
    expect(oceanShowcaseStore.getState().windStrength).toBe('strong');

    // Reset state
    oceanShowcaseStore.resetAll();
    const resetState = oceanShowcaseStore.getState();
    expect(resetState.windDirection).toBe('right');
    expect(resetState.windStrength).toBe('gentle');
    expect(resetState.rightVotes).toBe(20);
    expect(resetState.leftVotes).toBe(4);
  });
});
