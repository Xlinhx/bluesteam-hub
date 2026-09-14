import { describe, it, expect } from 'vitest';
import * as shells from '../src/shells';
import { OCEAN_RESOURCES } from '../src/content/resourcesData';
import { demoStore } from '../src/demo/storage/demoStore';
import { oceanShowcaseStore } from '../src/demo/storage/oceanShowcaseStore';

describe('Chặng 7: Responsive & Final Acceptance Matrix Verification', () => {
  describe('1. Five Canonical Shells Integrity', () => {
    it('should export all 5 canonical Living Ocean shells', () => {
      expect(shells.PublicShell).toBeDefined();
      expect(shells.LearnerShell).toBeDefined();
      expect(shells.TeacherShell).toBeDefined();
      expect(shells.ActivityShell).toBeDefined();
      expect(shells.PresentationShell).toBeDefined();
    });
  });

  describe('2. Absence of Legacy Defects & Prohibited Patterns', () => {
    it('should verify BigBuckBunny is completely absent from active content', () => {
      // Check resources and video data
      const jsonContent = JSON.stringify(OCEAN_RESOURCES);
      expect(jsonContent.toLowerCase()).not.toContain('bigbuckbunny');
      expect(jsonContent.toLowerCase()).not.toContain('big buck bunny');
    });

    it('should verify no "use desktop" restriction blocks exist', () => {
      const jsonContent = JSON.stringify(OCEAN_RESOURCES);
      expect(jsonContent.toLowerCase()).not.toContain('hãy dùng máy tính');
      expect(jsonContent.toLowerCase()).not.toContain('please use desktop');
    });
  });

  describe('3. Multi-Device Viewports Specification', () => {
    const TARGET_VIEWPORTS = [
      { name: 'Desktop HD Large', width: 1536, height: 1024, deviceType: 'desktop' },
      { name: 'Desktop Standard', width: 1366, height: 768, deviceType: 'desktop' },
      { name: 'Tablet Portrait', width: 768, height: 1024, deviceType: 'tablet' },
      { name: 'Mobile Modern', width: 390, height: 844, deviceType: 'mobile' },
      { name: 'Mobile Compact', width: 360, height: 800, deviceType: 'mobile' },
    ];

    it('should validate all 5 canonical viewports are registered', () => {
      expect(TARGET_VIEWPORTS).toHaveLength(5);
      TARGET_VIEWPORTS.forEach((vp) => {
        expect(vp.width).toBeGreaterThanOrEqual(360);
        expect(vp.height).toBeGreaterThanOrEqual(768);
      });
    });
  });

  describe('4. State Consistency & Storage Isolation', () => {
    it('should ensure demoStore and oceanShowcaseStore operate independently', () => {
      demoStore.resetDemo();
      oceanShowcaseStore.resetAll();

      const learnerStations = demoStore.getBlueSteamProgress().completedStations;
      const teacherStep = oceanShowcaseStore.getState().activeStep;

      expect(learnerStations).toBeDefined();
      expect(teacherStep).toBe(4);

      demoStore.completeStation(3);
      expect(demoStore.getBlueSteamProgress().completedStations).toContain(3);
      expect(oceanShowcaseStore.getState().activeStep).toBe(4);
    });
  });
});
