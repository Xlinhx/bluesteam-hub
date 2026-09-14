import { describe, it, expect, beforeEach } from 'vitest';
import { oceanShowcaseStore, WindDirection, WindStrength } from '../src/demo/storage/oceanShowcaseStore';

describe('Chặng 6: Teacher Suite & Broadcast Synchronization', () => {
  beforeEach(() => {
    oceanShowcaseStore.resetAll();
  });

  it('should initialize with default class session state', () => {
    const state = oceanShowcaseStore.getState();
    expect(state.classCode).toBe('482915');
    expect(state.className).toBe('Lớp Sao Biển');
    expect(state.teacherName).toBe('Cô Linh');
    expect(state.activeStep).toBe(4);
    expect(state.isSimulationRunning).toBe(false);
    expect(state.isSessionEnded).toBe(false);
  });

  it('should broadcast activeStep changes to subscribed presentation screens', () => {
    let receivedStep = 0;
    const unsub = oceanShowcaseStore.subscribe((state) => {
      receivedStep = state.activeStep;
    });

    oceanShowcaseStore.setActiveStep(2);
    expect(receivedStep).toBe(2);
    expect(oceanShowcaseStore.getState().activeStep).toBe(2);

    oceanShowcaseStore.setActiveStep(5);
    expect(receivedStep).toBe(5);

    unsub();
  });

  it('should synchronize wind simulation parameters in real-time', () => {
    let lastDirection: WindDirection = 'right';
    let lastStrength: WindStrength = 'gentle';
    let isRunning = false;

    const unsub = oceanShowcaseStore.subscribe((state) => {
      lastDirection = state.windDirection;
      lastStrength = state.windStrength;
      isRunning = state.isSimulationRunning;
    });

    oceanShowcaseStore.setWindDirection('left');
    expect(lastDirection).toBe('left');

    oceanShowcaseStore.setWindStrength('strong');
    expect(lastStrength).toBe('strong');

    oceanShowcaseStore.setSimulationRunning(true);
    expect(isRunning).toBe(true);

    unsub();
  });

  it('should mark session as ended when teacher finishes class', () => {
    let sessionEnded = false;
    const unsub = oceanShowcaseStore.subscribe((state) => {
      sessionEnded = state.isSessionEnded;
    });

    oceanShowcaseStore.endSession();
    expect(sessionEnded).toBe(true);
    expect(oceanShowcaseStore.getState().isSessionEnded).toBe(true);

    unsub();
  });
});
