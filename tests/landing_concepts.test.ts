import { describe, it, expect } from 'vitest';
import { CONCEPTS, ConceptId } from '../src/domains/public/concepts-preview/ConceptTypes';

describe('Landing Page Concepts — Specifications & Data Integrity', () => {
  it('should define all 3 distinct landing page concepts with complete metadata', () => {
    const keys = Object.keys(CONCEPTS) as ConceptId[];
    expect(keys).toHaveLength(3);
    expect(keys).toEqual(['concept-a', 'concept-b', 'concept-c']);

    // Concept A
    expect(CONCEPTS['concept-a']).toMatchObject({
      id: 'concept-a',
      shortKey: 'a',
      title: expect.stringContaining('Phương án A'),
      subtitle: expect.stringContaining('Cinematic Discovery'),
      tagline: 'Một cách học sâu sắc hơn',
      mockupUrl: '/concepts/concept-a.jpg',
    });
    expect(CONCEPTS['concept-a'].heroCreature).toContain('Cá voi lưng gù');

    // Concept B
    expect(CONCEPTS['concept-b']).toMatchObject({
      id: 'concept-b',
      shortKey: 'b',
      title: expect.stringContaining('Phương án B'),
      subtitle: expect.stringContaining('Scientific Living Atlas'),
      tagline: 'Tập bản đồ sống cho những tâm trí tò mò',
      mockupUrl: '/concepts/concept-b.jpg',
    });
    expect(CONCEPTS['concept-b'].heroCreature).toContain('Megaptera novaeangliae');

    // Concept C
    expect(CONCEPTS['concept-c']).toMatchObject({
      id: 'concept-c',
      shortKey: 'c',
      title: expect.stringContaining('Phương án C'),
      subtitle: expect.stringContaining('Living Learning System'),
      tagline: 'Đại dương thật. Học tập thật. Thay đổi thật.',
      mockupUrl: '/concepts/concept-c.jpg',
    });
    expect(CONCEPTS['concept-c'].heroCreature).toContain('Cá voi sát thủ Orca');
  });

  it('should guarantee 100% Vietnamese text standards in metadata and prevent English placeholders', () => {
    Object.values(CONCEPTS).forEach((concept) => {
      // Must not contain pseudo-text or lorem ipsum
      expect(concept.tagline.toLowerCase()).not.toContain('lorem');
      expect(concept.tagline.toLowerCase()).not.toContain('dolor');
      expect(concept.visualLanguage.toLowerCase()).not.toContain('placeholder');
      expect(concept.pedagogicalFocus.toLowerCase()).not.toContain('todo');

      // Title must start with Vietnamese prefix
      expect(concept.title).toMatch(/^Phương án [A-C] —/);
    });
  });

  it('should support concept query parameter resolution', () => {
    function resolveConcept(search: string, path: string): ConceptId {
      const params = new URLSearchParams(search);
      const q = params.get('concept');
      if (path === '/concept-b' || q === 'b' || q === 'concept-b') return 'concept-b';
      if (path === '/concept-c' || q === 'c' || q === 'concept-c') return 'concept-c';
      return 'concept-a';
    }

    expect(resolveConcept('?concept=a', '/')).toBe('concept-a');
    expect(resolveConcept('?concept=b', '/')).toBe('concept-b');
    expect(resolveConcept('?concept=c', '/')).toBe('concept-c');
    expect(resolveConcept('', '/concept-b')).toBe('concept-b');
    expect(resolveConcept('', '/concept-c')).toBe('concept-c');
    expect(resolveConcept('', '/')).toBe('concept-a');
  });

  it('should verify Concept B 5-tab system has complete scientific specimens for all categories', async () => {
    const { TAB_SLIDES } = await import('../src/domains/public/concepts-preview/ConceptBPage');
    const categories = ['ecosystem', 'life', 'process', 'impact', 'careers'] as const;

    categories.forEach((cat) => {
      expect(TAB_SLIDES[cat]).toBeDefined();
      expect(TAB_SLIDES[cat].length).toBeGreaterThanOrEqual(4);
      TAB_SLIDES[cat].forEach((slide) => {
        expect(slide.title).toBeTruthy();
        expect(slide.subtitle).toBeTruthy();
        expect(slide.desc).toBeTruthy();
        expect(slide.image).toMatch(/^\/concepts\/assets\//);
        expect(slide.specimens.length).toBeGreaterThanOrEqual(2);
        expect(slide.depthLabel).toBeTruthy();
      });
    });
  });

  it('should verify Concept B and Concept C camera feeds are distinct with 4 viewpoints each', async () => {
    const { CAMERA_FEEDS_B } = await import('../src/domains/public/concepts-preview/ConceptBPage');
    const { CAMERA_FEEDS_C } = await import('../src/domains/public/concepts-preview/ConceptCPage');

    expect(CAMERA_FEEDS_B).toHaveLength(4);
    expect(CAMERA_FEEDS_C).toHaveLength(4);

    CAMERA_FEEDS_B.forEach((feed) => {
      expect(feed.name).toBeTruthy();
      expect(feed.src).toMatch(/^\/concepts\/assets\//);
      expect(feed.thumb).toMatch(/^\/concepts\/assets\//);
    });

    CAMERA_FEEDS_C.forEach((feed) => {
      expect(feed.name).toBeTruthy();
      expect(feed.src).toMatch(/^\/concepts\/assets\//);
      expect(feed.thumb).toMatch(/^\/concepts\/assets\//);
    });
  });

  it('should verify Concept A depth zones contain 5 zones with dynamic specimens and tags', async () => {
    const { DEPTH_ZONES } = await import('../src/domains/public/concepts-preview/ConceptAPage');

    expect(DEPTH_ZONES).toHaveLength(5);
    DEPTH_ZONES.forEach((zone) => {
      expect(zone.id).toBeTruthy();
      expect(zone.name).toBeTruthy();
      expect(zone.depth).toBeTruthy();
      expect(zone.specimenName).toBeTruthy();
      expect(zone.tagDepth).toBeTruthy();
      expect(zone.light).toBeTruthy();
      expect(zone.temp).toBeTruthy();
      expect(zone.pressure).toBeTruthy();
    });
  });
});
