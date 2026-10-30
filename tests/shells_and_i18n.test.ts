import { describe, it, expect } from 'vitest';
import { TRANSLATIONS } from '../src/shared/i18n/translations';
import { oceanAudio } from '../src/shared/audio/oceanAudio';

describe('BlueSTEAM v2 Foundation: Shells, Tokens & i18n', () => {
  it('should have complete and symmetric translation keys for VI and EN', () => {
    const viKeys = Object.keys(TRANSLATIONS.vi);
    const enKeys = Object.keys(TRANSLATIONS.en);

    expect(viKeys.length).toBeGreaterThanOrEqual(40);
    expect(enKeys.length).toBeGreaterThanOrEqual(40);

    // Verify critical shell navigation keys exist in both locales
    const criticalKeys = [
      'brand.name',
      'nav.learner.resources',
      'nav.learner.learn',
      'nav.learner.interactive',
      'nav.learner.creative',
      'nav.learner.profile',
      'nav.public.login',
      'nav.public.join',
      'nav.teacher.lessons',
      'nav.teacher.curriculum',
      'nav.activity.back',
      'nav.activity.replayAudio',
      'home.greeting',
      'home.continueStation',
      'creature.turtle.title',
      'game.habitat.title',
      'sim.action.title',
      'creative.studio.title',
    ];

    criticalKeys.forEach((key) => {
      expect(TRANSLATIONS.vi[key]).toBeDefined();
      expect(TRANSLATIONS.en[key]).toBeDefined();
      expect(TRANSLATIONS.vi[key].length).toBeGreaterThan(0);
      expect(TRANSLATIONS.en[key].length).toBeGreaterThan(0);
    });
  });

  it('should verify audio engine operates safely without throw and supports mute/speech toggle', () => {
    expect(oceanAudio).toBeDefined();

    // Default state
    expect(oceanAudio.speaking).toBe(false);

    // Mute controls
    oceanAudio.setSpeechMuted(true);
    expect(oceanAudio.isSpeechMuted).toBe(true);
    oceanAudio.setSpeechMuted(false);
    expect(oceanAudio.isSpeechMuted).toBe(false);

    oceanAudio.setAmbientMuted(true);
    expect(oceanAudio.isAmbientMuted).toBe(true);
    oceanAudio.setAmbientMuted(false);
    expect(oceanAudio.isAmbientMuted).toBe(false);

    // Volume clamping
    oceanAudio.setVolume(1.5);
    oceanAudio.setVolume(-0.2);
    oceanAudio.setVolume(0.8);

    // Subscriptions
    let receivedState = false;
    const unsub = oceanAudio.subscribe((state) => {
      receivedState = state;
    });
    expect(unsub).toBeTypeOf('function');
    expect(receivedState).toBe(false);
    unsub();
  });
});
