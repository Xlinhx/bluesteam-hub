import { beforeEach, describe, expect, it, vi } from 'vitest';
import { demoStore } from '../src/shared/realtime/demoStore';
import { getAnimalAvatar } from '../src/shared/data/categoryArtworkMap';
import { artworkDownloadName } from '../src/shared/creative/artworkCapabilities';
const { apiFetch } = vi.hoisted(() => ({ apiFetch: vi.fn() }));
vi.mock('../src/shared/api/client', () => ({ apiFetch }));

describe('Canonical identity and truthful room failures', () => {
  it('uses the actual image format for artwork downloads', () => {
    expect(artworkDownloadName('Bạn rùa', 'data:image/jpeg;base64,AA==')).toBe('Bạn rùa.jpg');
    expect(artworkDownloadName('Biển', '/my-image.webp?cache=1')).toBe('Biển.webp');
    expect(artworkDownloadName('Biển', 'data:image/png;base64,AA==')).toBe('Biển.png');
  });
  beforeEach(() => apiFetch.mockReset());
  it('preserves the selected animal after saving and rereading a local profile', () => {
    demoStore.setProfile({ role: 'student', id: 'local-test', name: 'Chi', avatarKey: 'crab' });
    expect(demoStore.getProfile().avatarKey).toBe('crab');
  });
  it('renders historical octo identities as octopus', () => {
    expect(getAnimalAvatar('octo').key).toBe('octopus');
  });
  it('reports a blocked browser profile write instead of announcing a durable save', () => {
    vi.stubGlobal('localStorage', { setItem: () => { throw new Error('Storage blocked'); } });
    try {
      expect(() => demoStore.setProfile({ role: 'student', id: 'blocked', name: 'Chi', avatarKey: 'crab' })).toThrow('Storage blocked');
    } finally { vi.unstubAllGlobals(); }
  });
});
