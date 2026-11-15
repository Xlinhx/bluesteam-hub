import { horizontalRegions, verticalRegions, type WorldAxis } from './worldRoutes';

export type Point = { x: number; y: number };
export type MapSize = { width: number; height: number };
export type Camera = Point & { zoom: number };
type Species = { id: string; title: string; zone?: string; group: string; learned?: boolean; facts?: { label: string; text: string }[] };
export type SpeciesPoint = Species & Point;
export const terrainSize = { width: 3200, height: 1800 };
export const mapCenter = { x: 1600, y: 900 };
export const depthOverviewSize = { width: 3366, height: 4206 };
export const depthOverviewFocus = { x: depthOverviewSize.width / 2, y: depthOverviewSize.height * .2 };

export const depthBands = [9, 27, 47, 66, 87] as const;
export const depthLabels = ['0 m', '0–200 m', '200–1.000 m', '1.000–4.000 m', 'Từ 4.000 m'] as const;

const panoramicRegions: Record<string, string> = {
  shore: 'habitat-shore', dunes: 'habitat-dunes', fishing: 'habitat-fishing', offshore: 'habitat-offshore', 'deep-sea': 'habitat-deep-sea',
  surface: 'habitat-surface', shallow: 'habitat-shallows', middle: 'habitat-midwater', deep: 'habitat-deep', seabed: 'habitat-seabed',
};

export function habitatScene(axis: WorldAxis, regionId: string) {
  const region = (axis === 'horizontal' ? horizontalRegions : verticalRegions).find(entry => entry.id === regionId)!;
  const size = { width: terrainSize.height * 3, height: terrainSize.height };
  const span = size.width / region.stops.length;
  const offset = (spot: string) => Math.max(0, region.stops.findIndex(stop => stop.id === spot)) * span;
  return {
    art: `/assets/learner-worlds/learning/${panoramicRegions[regionId]}.webp`,
    size,
    focus: (spot: string) => ({ x: offset(spot) + span * (regionId === 'dunes' ? .40 : regionId === 'middle' ? .42 : .5), y: mapCenter.y }),
    position: (point: Point, spot: string) => ({ x: offset(spot) + point.x / terrainSize.width * span, y: point.y }),
    stopAt: (x: number) => region.stops[Math.min(region.stops.length - 1, Math.max(0, Math.floor(x / span)))],
  };
}

export function percent(x: number, y: number): Point {
  return { x: x * 32, y: y * 18 };
}

export const destinations: Record<string, Point> = {
  shore: percent(37, 77), dunes: percent(16, 36), fishing: percent(49, 50), offshore: percent(73, 32),
  'deep-sea': percent(86, 68), surface: percent(53, 10), shallow: percent(52, 29),
  middle: percent(53, 46), deep: percent(53, 66), seabed: percent(51, 85),
  abyss: percent(51, 83), hadal: percent(73, 93),
};

export const observationAnchors: Record<string, Point> = {
  grasses: percent(31.5, 75), 'wet-sample': percent(60.5, 69.5),
};

// Cross-references use the original card and progress ID. They do not change a source's zone.
const crossReferences: Record<string, readonly { id: string; x: number; y: number; habitat: string }[]> = {
  offshore: [
    { id: 'upper-15', x: 30, y: 66, habitat: 'surface-water' },
    { id: 'upper-35', x: 43, y: 78, habitat: 'open-water' },
    { id: 'upper-4', x: 56, y: 64, habitat: 'surface-water' },
  ],
  'deep-sea': [
    { id: 'middle-20', x: 31, y: 37, habitat: 'dark-water' },
    { id: 'deep-14', x: 48, y: 72, habitat: 'deep-floor' },
    { id: 'deep-25', x: 64, y: 37, habitat: 'dark-water' },
  ],
};

export function habitatCrossReferences<T extends Species>(points: HabitatPoint<T>[], regionId: string) {
  return (crossReferences[regionId] ?? []).flatMap(entry => {
    const original = points.find(point => point.id === entry.id);
    return original ? [{ ...original, ...percent(entry.x, entry.y), scene: regionId, habitat: entry.habitat, featured: true }] : [];
  });
}

type HabitatBox = readonly [left: number, top: number, right: number, bottom: number];
const habitats = {
  dunes: { shelterbelt: [20, 29, 20, 29], creepers: [11, 77, 25, 86], grasses: [32, 66, 42, 72], scrub: [46, 61, 54, 70], 'dry-sand': [46, 72, 63, 88], 'wet-sand': [62, 61, 70, 71], 'wet-sample': [60, 65, 63, 69] },
  beach: { sand: [22, 66, 63, 81], wrack: [39, 71, 66, 75], 'water-edge': [56, 60, 81, 73] },
  'tide-pool': { pool: [38, 57, 77, 77], rocks: [38, 56, 62, 60], mud: [59, 63, 79, 73] },
  'rocky-shore': { rocks: [32, 59, 80, 82], 'rock-ledge': [34, 54, 64, 65] },
  nearshore: { 'open-water': [33, 38, 83, 52], 'sand-bed': [29, 64, 83, 83], 'sea-grass': [20, 62, 31, 75] },
  reef: { 'open-water': [32, 36, 83, 55], 'coral-reef': [29, 61, 85, 78], 'reef-floor': [25, 74, 84, 90] },
  surface: { 'surface-water': [23, 54, 80, 72] },
  shallow: { 'open-water': [34, 32, 83, 50], 'coral-reef': [16, 57, 28, 81], 'sand-bed': [37, 72, 76, 88] },
  middle: { midwater: [27, 34, 83, 75] },
  deep: { 'dark-water': [30, 32, 84, 65], 'deep-floor': [29, 65, 86, 83] },
} satisfies Record<string, Record<string, HabitatBox>>;

type Placement = readonly [scene: keyof typeof habitats, habitat: string];
export type HabitatPoint<T extends Species = Species> = T & Point & { scene: string; habitat: string; featured: boolean };
export const habitatNames: Record<string, string> = {
  shelterbelt: 'Hàng Phi lao', creepers: 'Cây bò trên cát', grasses: 'Cụm cỏ đụn cát', scrub: 'Bụi cây ven biển',
  'dry-sand': 'Cát khô', 'wet-sand': 'Rìa cát ẩm', 'wet-sample': 'Mẫu cát ẩm', sand: 'Bãi cát', wrack: 'Dải rong dạt bờ',
  'water-edge': 'Mép sóng', pool: 'Vũng triều', rocks: 'Bề mặt đá', 'rock-ledge': 'Khe đá', mud: 'Nền bùn và cát',
  'open-water': 'Vùng nước mở', 'sand-bed': 'Nền cát dưới nước', 'sea-grass': 'Thảm cỏ biển', 'coral-reef': 'Rạn san hô',
  'reef-floor': 'Nền rạn', 'surface-water': 'Sát mặt nước', midwater: 'Trong vùng nước giữa',
  'dark-water': 'Vùng nước tối', 'deep-floor': 'Gần nền đáy sâu',
};

const duneHabitats: Record<string, string> = {
  2: 'creepers', 3: 'grasses', 4: 'creepers', 5: 'scrub', 6: 'shelterbelt', 7: 'grasses', 8: 'grasses',
  9: 'scrub', 10: 'creepers', 11: 'grasses', 12: 'creepers', 13: 'creepers', 14: 'scrub',
  15: 'dry-sand', 16: 'dry-sand', 17: 'wet-sand', 18: 'wet-sample', 19: 'wet-sample',
  20: 'dry-sand', 21: 'dry-sand', 23: 'dry-sand', 24: 'dry-sand', 26: 'scrub', 27: 'scrub',
};
const shoreHabitats = {
  beach: { sand: [26, 30, 31, 38, 59, 60, 61, 62], wrack: [34, 35, 36, 63, 64], 'water-edge': [42, 43] },
  'rocky-shore': { rocks: [2, 5, 11, 14, 16, 19, 27, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58], 'rock-ledge': [12, 15, 18, 25, 45] },
  'tide-pool': { rocks: [4], pool: [13, 21, 22, 23, 24, 28, 37, 39], mud: [6, 7, 8, 9, 10, 17, 20, 29, 32, 33, 40, 41, 44] },
};
const coastPlacements = new Map<number, Placement>(Object.entries(shoreHabitats).flatMap(([scene, sites]) =>
  Object.entries(sites).flatMap(([habitat, rows]) => rows.map(row => [row, [scene as keyof typeof shoreHabitats, habitat]] as const))));
const surfaceRows = new Set([2, 3, 4, 10, 11, 12, 13, 14, 15, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 47]);
const benthicUpper = new Set([5, 7, 9, 16, 17, 18, 19, 20, 21, 22, 48, 49, 61, 62, 63, 64]);
const deepFloor = new Set([9, 10, 14, 15, 17, 18, 19, 20, 21, 22, 24, 26, 27]);

function placement(item: Species): Placement | undefined {
  const row = Number(item.id.split('-').at(-1));
  const group = item.group.toLocaleLowerCase('vi');
  switch (item.zone) {
    case 'dunes': return ['dunes', duneHabitats[row] ?? 'dry-sand'];
    case 'shore': return coastPlacements.get(row) ?? ['tide-pool', 'pool'];
    case 'nearshore': return ['nearshore', row >= 31 ? 'sea-grass' : row < 9 || [11, 26, 27].includes(row) ? 'open-water' : 'sand-bed'];
    case 'reef': return ['reef', group.includes('ruột khoang') || group === 'tảo' ? 'coral-reef' : group.includes('dây sống') ? 'open-water' : 'reef-floor'];
    case 'upper': {
      if (item.id.startsWith('upper-') && surfaceRows.has(row)) return ['surface', 'surface-water'];
      if (benthicUpper.has(row) || group.includes('da gai')) return ['shallow', 'sand-bed'];
      return ['shallow', /ruột khoang|tảo/.test(group) ? 'coral-reef' : 'open-water'];
    }
    case 'middle': return ['middle', 'midwater'];
    case 'deep': return ['deep', deepFloor.has(row) ? 'deep-floor' : 'dark-water'];
  }
}

const anchors: Record<string, Point> = {
  'shore-4': percent(31, 64.5), 'shore-13': percent(3.5, 75), 'shore-30': percent(39, 73),
  'dunes-2': percent(11, 86), 'dunes-6': percent(23, 40), 'dunes-15': percent(51, 83), 'upper-2': percent(53, 57),
  'middle-20': percent(39, 51), 'reef-4': percent(64, 65),
};
export const displayNames: Record<string, string> = { 'shore-30': 'Dã tràng', 'shore-13': 'Cua ẩn sĩ', 'middle-20': 'Cá đèn' };

export function buildHabitatPoints<T extends Species>(items: T[]): HabitatPoint<T>[] {
  const sites = new Map<string, { scene: keyof typeof habitats; habitat: string; members: T[] }>();
  for (const item of [...items].sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }))) {
    const assigned = placement(item);
    if (!assigned) continue;
    const [scene, habitat] = assigned;
    const key = scene + '/' + habitat;
    if (!sites.has(key)) sites.set(key, { scene, habitat, members: [] });
    sites.get(key)!.members.push(item);
  }
  return [...sites.values()].flatMap(({ scene, habitat, members }) => {
    const [left, top, right, bottom] = (habitats[scene] as Record<string, HabitatBox>)[habitat];
    const columns = Math.ceil(Math.sqrt(members.length * 2));
    const rows = Math.ceil(members.length / columns);
    return members.map((item, index) => ({ ...item, scene, habitat, featured: item.id in anchors,
      ...(anchors[item.id] ?? percent(left + (right - left) * ((index % columns + .5) / columns),
        top + (bottom - top) * ((Math.floor(index / columns) + .5) / rows))),
    }));
  });
}

export function project(point: Point, camera: Camera, size: MapSize): Point {
  return { x: (point.x - camera.x) * camera.zoom + size.width / 2, y: (point.y - camera.y) * camera.zoom + size.height / 2 };
}

export function cameraZoom(camera: Camera, size: MapSize, anchor: Point, zoom: number): Camera {
  return {
    x: camera.x + (anchor.x - size.width / 2) * (1 / camera.zoom - 1 / zoom),
    y: camera.y + (anchor.y - size.height / 2) * (1 / camera.zoom - 1 / zoom),
    zoom,
  };
}

export function clusterPoints<T extends SpeciesPoint>(points: T[], zoom: number) {
  const clusters: (Point & { members: T[] })[] = [];
  const distance = (zoom < .95 ? 148 : 64) / zoom;
  for (const point of points) {
    const cluster = zoom < 1.3 && !(point.id in anchors) && clusters.find(group =>
      !(group.members[0].id in anchors) && Math.hypot(group.x - point.x, group.y - point.y) < distance);
    if (cluster) cluster.members.push(point);
    else clusters.push({ x: point.x, y: point.y, members: [point] });
  }
  return clusters.map(cluster => ({
    ...cluster,
    x: cluster.members.reduce((sum, point) => sum + point.x, 0) / cluster.members.length,
    y: cluster.members.reduce((sum, point) => sum + point.y, 0) / cluster.members.length,
  }));
}
