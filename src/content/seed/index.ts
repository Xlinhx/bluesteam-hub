import { SEED_ASSETS } from './assets';
import { SEED_UNITS } from './units';
import { SEED_EXPERIENCES } from './experiences';
import { SEED_LESSONS } from './lessons';
import { SEED_CLASSES } from './classes';
import { SEED_STUDENTS } from './students';
import { SEED_COLLECTIONS } from './collections';
import { SEED_PATHS } from './paths';

export {
  SEED_ASSETS,
  SEED_UNITS,
  SEED_EXPERIENCES,
  SEED_LESSONS,
  SEED_CLASSES,
  SEED_STUDENTS,
  SEED_COLLECTIONS,
  SEED_PATHS,
};

export function getUnitById(id: string) {
  return SEED_UNITS.find((u) => u.id === id || u.slug === id);
}

export function getExperienceById(id: string) {
  return SEED_EXPERIENCES.find((e) => e.id === id || e.slug === id);
}

export function getExperiencesForUnit(unitId: string) {
  return SEED_EXPERIENCES.filter((e) => e.unitId === unitId);
}

export function getLessonById(id: string) {
  return SEED_LESSONS.find((l) => l.id === id);
}

export function getClassById(id: string) {
  return SEED_CLASSES.find((c) => c.id === id);
}

export function getPathById(id: string) {
  return SEED_PATHS.find((p) => p.id === id || p.slug === id);
}

export function getCollectionById(id: string) {
  return SEED_COLLECTIONS.find((c) => c.id === id || c.slug === id);
}
