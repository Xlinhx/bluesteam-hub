import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { horizontalRegions, verticalRegions, overviewArt, resolveLearningStop, worldItemPath } from '../src/domains/learner/learning/worldRoutes';
import { buildHabitatPoints, cameraZoom, project, clusterPoints, habitatScene } from '../src/domains/learner/learning/worldMap';

describe('learning world', () => {
  it('gives every source species a scene point and keeps samples together', () => {
    const pack = JSON.parse(readFileSync('server/seed-data/learner-ocean.json', 'utf8'));
    const points = buildHabitatPoints(pack.species);
    expect(points.map(point => point.id).sort()).toEqual(pack.species.map((item: { id: string }) => item.id).sort());
    expect(points.find(point => point.id === 'dunes-6')).toMatchObject({ scene: 'dunes', habitat: 'shelterbelt', featured: true });
    expect(points.find(point => point.id === 'dunes-2')).toMatchObject({ scene: 'dunes', habitat: 'creepers', featured: true });
    expect(points.filter(point => point.habitat === 'wet-sample').map(point => point.id).sort()).toEqual(['dunes-18', 'dunes-19']);
    expect(points.find(point => point.id === 'shore-30')).toMatchObject({ scene: 'beach', habitat: 'sand' });
    expect(points.find(point => point.id === 'middle-20')).toMatchObject({ scene: 'middle', habitat: 'midwater', featured: true });
    expect(points.every(point => point.x > 0 && point.x < 3200 && point.y > 0 && point.y < 1800)).toBe(true);
    for (const scene of [...horizontalRegions, ...verticalRegions].flatMap(region => region.stops)) {
      const positions = points.filter(point => point.scene === scene.id).map(point => `${point.x}:${point.y}`);
      expect(new Set(positions).size, scene.id).toBe(positions.length);
    }
  });
  it('places all species exactly once and keeps all 62 shore points in their world', () => {
    const pack = JSON.parse(readFileSync('server/seed-data/learner-ocean.json', 'utf8'));
    const points = buildHabitatPoints(pack.species);
    expect(new Set(points.map(point => point.id)).size).toBe(282);
    const shore = points.filter(point => point.zone === 'shore').map(point => ({
      ...point, ...habitatScene('horizontal', 'shore').position(point, point.scene),
    }));
    expect(shore).toHaveLength(62);
    expect(new Set(shore.map(point => point.x + ':' + point.y)).size).toBe(62);
    expect(clusterPoints(shore, 0.2).flatMap(cluster => cluster.members).length).toBe(62);
  });

  it('zooms around the exact point under the cursor', () => {
    const camera = { x: 100, y: 100, zoom: 2 };
    const size = { width: 800, height: 600 };
    const world = { x: 190, y: 130 };
    const cursor = project(world, camera, size);
    expect(project(world, cameraZoom(camera, size, cursor, 4), size)).toEqual(cursor);
  });
  it('offers five destinations per axis and retains a home for every source zone', () => {
    expect(horizontalRegions.map(region => region.id)).toEqual(['shore', 'dunes', 'fishing', 'offshore', 'deep-sea']);
    expect(verticalRegions.map(region => region.id)).toEqual(['surface', 'shallow', 'middle', 'deep', 'seabed']);
    const pack = JSON.parse(readFileSync('server/seed-data/learner-ocean.json', 'utf8'));
    const stops = [...horizontalRegions, ...verticalRegions].flatMap(region => region.stops);
    expect(new Set(stops.map(stop => stop.zone).filter(Boolean))).toEqual(new Set(pack.zones.map((zone: { id: string }) => zone.id)));
    for (const [axis, regions] of [['horizontal', horizontalRegions], ['vertical', verticalRegions]] as const) {
      for (const region of regions) {
        const scene = habitatScene(axis, region.id);
        expect(existsSync('public' + scene.art), region.id).toBe(true);
        expect(scene.art).not.toBe(overviewArt[axis]);
        expect(scene.size.width / scene.size.height).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('resolves old source-zone links and keeps separate observation sites in one source zone', () => {
    expect(resolveLearningStop('nearshore')?.stop.zone).toBe('nearshore');
    expect(resolveLearningStop('reef')?.stop.zone).toBe('reef');
    expect(resolveLearningStop('surface')?.stop.zone).toBe('upper');
    expect(resolveLearningStop('shallow')?.stop.zone).toBe('upper');
    expect(resolveLearningStop('tide-pool')?.stop.zone).toBe('shore');
  });

  it('places neighboring habitats in the same continuous scene and requests only the numbered page', () => {
    const coast = habitatScene('horizontal', 'shore');
    expect(coast.focus('beach').x).toBeLessThan(coast.focus('tide-pool').x);
    expect(coast.focus('tide-pool').x).toBeLessThan(coast.focus('rocky-shore').x);
    const url = new URL(worldItemPath('shore', 'species', 'Thân mềm', 2, '', 'learned'), 'http://localhost');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      zone: 'shore', kind: 'species', group: 'Thân mềm', page: '2', limit: '6', status: 'learned',
    });
    expect(worldItemPath(undefined, 'collection', '', 1, '', '')).toContain('allZones=1');
  });
});
