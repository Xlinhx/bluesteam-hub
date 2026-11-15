import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

describe('learner source pack', () => {
  const read = () => JSON.parse(readFileSync('server/seed-data/learner-ocean.json', 'utf8'));
  it('retains both Excel axes and places reviewed rows by documented habitat', () => {
    const pack = read();
    expect(pack.zones.filter((zone: any) => zone.axis === 'vertical')).toHaveLength(5);
    expect(pack.zones.filter((zone: any) => zone.axis === 'horizontal')).toHaveLength(6);
    expect(pack.species.filter((item: any) => item.zone === 'offshore')).toHaveLength(0);
    expect(pack.species.find((item: any) => item.id === 'upper-2')).toMatchObject({
      title: 'Cá heo mũi chai', group: 'Động vật có vú biển',
    });
    expect(pack.species.some((item: any) => !item.group)).toBe(false);
    expect(pack.species.find((item: any) => item.id === 'deep-3')).toMatchObject({ zone: 'reef', source: { row: 3 } });
    expect(pack.species.find((item: any) => item.id === 'middle-19')?.relatedSources).toEqual([expect.objectContaining({ row: 8 })]);
    expect(pack.disposition.filter((row: any) => ['horizontal', 'vertical-algae'].includes(row.source) && row.status === 'pending')).toHaveLength(0);
    expect(pack.collections.find((item: any) => item.id === 'food-chain-11')?.facts[0].text).toContain('ô trống');
    expect(pack.species.find((item: any) => item.id === 'reef-4')).toMatchObject({ title: 'San hô cành' });
    for (const id of ['reef-13', 'reef-15']) {
      const item = pack.species.find((item: any) => item.id === id);
      expect(item.images).toHaveLength(1);
      expect(existsSync('public' + item.images[0])).toBe(true);
    }
  });
  it('keeps paired pages, downloadable bytes and a trace for each PDF page', () => {
    const pack = read();
    expect(pack.disposition.filter((row: any) => row.page)).toHaveLength(155);
    expect(pack.version).toBe('ocean-v7');
    expect(pack.resources).toHaveLength(27);
    expect([...new Set(pack.resources.map((item: any) => item.kind))]).toEqual(['flashcard']);
    expect(pack.resources.find((item: any) => item.id === 'flashcards-32')).toMatchObject({ pages: [32, 33] });
    expect(pack.resources.some((item: any) => item.id === 'flashcards-31')).toBe(false);
    for (const item of pack.resources.filter((item: any) => item.file)) {
      expect(existsSync('public' + item.file)).toBe(true);
    }
  });
  it('ships narration for each sourced reef fact, the inquiry and zone introductions', () => {
    const pack = read();
    const reef = pack.zones.find((zone: any) => zone.id === 'reef');
    const tracks = [reef.inquiry.audio, ...pack.zones.filter((zone: any) => zone.intro).map((zone: any) => zone.audio),
      ...pack.species.filter((item: any) => item.zone === 'reef').flatMap((item: any) => [item.audio, ...item.facts.map((fact: any) => fact.audio)])];
    expect(tracks.length).toBeGreaterThan(10);
    for (const track of tracks) {
      expect(pack.assets[track]?.textSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(existsSync('public' + track)).toBe(true);
    }
  });

  it('ships the child-facing reef audio while retaining the original Excel fact', () => {
    const pack = read();
    const brainCoral = pack.species.find((item: any) => item.id === 'reef-2');
    const fact = brainCoral.facts[0];
    expect(fact.text).toContain('bề mặt có các rãnh giống hình bộ não');
    expect(fact.spokenText).toContain('Bé nhìn kỹ nhé!');
    expect(fact.audio).toMatch(/^\/assets\/learner-content\/v3\/audio\//);
    expect(pack.assets[fact.audio]?.textSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(existsSync('public' + fact.audio)).toBe(true);
  });
});
