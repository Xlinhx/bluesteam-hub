import { describe, expect, it } from 'vitest';
import { readHomeSelection, saveHomeSelection, consumeHomeEntrance, hasSeenHomeEntrance } from '../src/shared/ui/home/useHomeEntrance';

function session() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}

describe('Home motion session policy', () => {
  it('does not consume the first entrance during an authentication remount', () => {
    const store = session();
    expect(hasSeenHomeEntrance('learner', store)).toBe(false);
    expect(hasSeenHomeEntrance('learner', store)).toBe(false);
    consumeHomeEntrance('learner', store);
    expect(hasSeenHomeEntrance('learner', store)).toBe(true);
  });
  it('plays the expressive entrance once per role and tab, without resetting the selected area', () => {
    const store = session();
    saveHomeSelection(2, store);
    expect(consumeHomeEntrance('learner', store)).toBe(true);
    expect(consumeHomeEntrance('learner', store)).toBe(false);
    expect(consumeHomeEntrance('teacher', store)).toBe(true);
    expect(consumeHomeEntrance('teacher', store)).toBe(false);
    expect(readHomeSelection(store)).toBe(2);
  });
  it('restores the selected area and tolerates invalid or blocked storage', () => {
    const store = session();
    expect(readHomeSelection(store)).toBe(0);
    saveHomeSelection(2, store);
    expect(readHomeSelection(store)).toBe(2);
    saveHomeSelection(99, store);
    expect(readHomeSelection(store)).toBe(0);
    const blocked = { getItem: () => { throw Error('blocked'); }, setItem: () => { throw Error('blocked'); } };
    expect(readHomeSelection(blocked)).toBe(0);
    expect(() => saveHomeSelection(1, blocked)).not.toThrow();
  });
});
