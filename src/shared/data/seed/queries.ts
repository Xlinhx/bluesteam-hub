import { SEED_EXPERIENCES } from './experiences';

export function getExperienceById(id: string) {
  return SEED_EXPERIENCES.find((experience) => experience.id === id || experience.slug === id);
}

export function getExperiencesForUnit(unitId: string) {
  return SEED_EXPERIENCES.filter((experience) => experience.unitId === unitId);
}
