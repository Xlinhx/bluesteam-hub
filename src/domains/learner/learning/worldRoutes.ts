import { oceanPath } from '../../../shared/api/learnerOcean';
import worldIntros from './world-intros.json';

export type WorldAxis = 'horizontal' | 'vertical';
export type WorldKind = 'species' | 'collection';
export type WorldStop = {
  id: string; title: string; zone?: string; tone: 'coast' | 'dunes' | 'surface' | 'shelf' | 'depth';
  intro?: { text: string; audio: string };
};
type WorldRegion = { id: string; title: string; stops: WorldStop[] };

const worldArt = (file: string) => '/assets/learner-worlds/learning/' + file + '.webp';
export const overviewArt = { horizontal: worldArt('habitat-flycam'), vertical: worldArt('habitat-section-tall') };

export const horizontalRegions: WorldRegion[] = [
  { id: 'shore', title: 'Bờ biển', stops: [
    { id: 'beach', title: 'Bãi cát', zone: 'shore', tone: 'coast' },
    { id: 'tide-pool', title: 'Vũng triều', zone: 'shore', tone: 'coast' },
    { id: 'rocky-shore', title: 'Bãi đá', zone: 'shore', tone: 'coast' },
  ] },
  { id: 'dunes', title: 'Khu vực cồn cát', stops: [
    { id: 'dunes', title: 'Đụn cát', zone: 'dunes', tone: 'dunes',
      intro: worldIntros.dunes },
  ] },
  { id: 'fishing', title: 'Khu vực đánh bắt', stops: [
    { id: 'fishing', title: 'Khu vực đánh bắt', tone: 'surface',
      intro: worldIntros.fishing },
    { id: 'nearshore', title: 'Ven bờ', zone: 'nearshore', tone: 'shelf' },
    { id: 'reef', title: 'Rạn san hô', zone: 'reef', tone: 'shelf' },
  ] },
  { id: 'offshore', title: 'Biển khơi', stops: [
    { id: 'offshore', title: 'Biển khơi', zone: 'offshore', tone: 'surface' },
  ] },
  { id: 'deep-sea', title: 'Vùng biển sâu', stops: [
    { id: 'deep-sea', title: 'Vùng biển sâu', zone: 'deep-sea', tone: 'depth' },
  ] },
];

export const verticalRegions: WorldRegion[] = [
  { id: 'surface', title: 'Mặt nước', stops: [
    { id: 'surface', title: 'Mặt nước', zone: 'upper', tone: 'surface' },
  ] },
  { id: 'shallow', title: 'Vùng nước nông', stops: [
    { id: 'shallow', title: 'Vùng nước nông', zone: 'upper', tone: 'shelf' },
  ] },
  { id: 'middle', title: 'Vùng nước giữa', stops: [
    { id: 'middle', title: 'Vùng nước giữa', zone: 'middle', tone: 'depth' },
  ] },
  { id: 'deep', title: 'Vùng nước sâu', stops: [
    { id: 'deep', title: 'Vùng nước sâu', zone: 'deep', tone: 'depth' },
  ] },
  { id: 'seabed', title: 'Đáy biển', stops: [
    { id: 'abyss', title: 'Vùng vực sâu', zone: 'abyss', tone: 'depth' },
    { id: 'hadal', title: 'Vùng hadal', zone: 'hadal', tone: 'depth' },
  ] },
];

export function resolveLearningStop(id: string | undefined) {
  for (const [axis, regions] of [['horizontal', horizontalRegions], ['vertical', verticalRegions]] as const) {
    const region = regions.find(candidate => candidate.id === id || candidate.stops.some(stop => stop.id === id));
    if (region) return { axis, region, stop: region.stops.find(stop => stop.id === id) ?? region.stops[0] };
  }
  if (id === 'upper') return resolveLearningStop('shallow');
}

export function worldItemPath(zone: string | undefined, kind: WorldKind, group: string, page: number, q: string, status: string) {
  return oceanPath('items', { zone, kind, group, page: String(page), limit: '6', q, status,
    allZones: zone && kind === 'species' ? undefined : '1' });
}
