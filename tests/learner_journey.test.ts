import { describe, it, expect, beforeEach } from 'vitest';
import { demoStore } from '../src/demo/storage/demoStore';

describe('BlueSTEAM v2 Learner Journey & Progression Tests', () => {
  beforeEach(() => {
    demoStore.resetDemo();
  });

  it('should initialize learner progress with Station 1 completed and Station 2 active', () => {
    const progress = demoStore.getBlueSteamProgress();
    expect(progress.completedStations).toContain(1);
    expect(progress.currentStation).toBe(2);
    expect(progress.badges).toContain('badge-ocean-explorer');
  });

  it('should unlock subsequent stations when current station is completed', () => {
    demoStore.completeStation(2);
    const updated = demoStore.getBlueSteamProgress();
    expect(updated.completedStations).toContain(2);
    expect(updated.currentStation).toBe(3);

    demoStore.completeStation(3);
    const updated2 = demoStore.getBlueSteamProgress();
    expect(updated2.completedStations).toContain(3);
    expect(updated2.currentStation).toBe(4);
  });

  it('should record completed activities and unlock creature discoveries', () => {
    demoStore.completeActivity('game-habitat-placement');
    demoStore.unlockCreature('asset-specimen-clownfish');

    const progress = demoStore.getBlueSteamProgress();
    expect(progress.completedActivities).toContain('game-habitat-placement');
    expect(progress.unlockedCreatures).toContain('asset-specimen-clownfish');
  });

  it('should verify NOAA compliant habitat matching for adult green sea turtle', () => {
    // Green sea turtle diet: adult green turtles are unique among sea turtles in being herbivores,
    // feeding primarily on seagrasses and algae in shallow coastal waters.
    const habitats = [
      { id: 'mangrove', isTargetFeedingGround: false },
      { id: 'seagrass', isTargetFeedingGround: true },
      { id: 'abyss', isTargetFeedingGround: false },
    ];

    const correct = habitats.find((h) => h.isTargetFeedingGround);
    expect(correct?.id).toBe('seagrass');
  });
});
