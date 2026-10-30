import { LearningCollection } from '../../types/learningUnit';

export const SEED_COLLECTIONS: LearningCollection[] = [
  {
    id: 'col-vertical-zones',
    slug: 'vertical-zones',
    title: 'The Vertical Water Column',
    description: 'Explore the oceanic layers stratified by sunlight penetration, temperature drops, and crushing hydrostatic pressure.',
    category: 'depth-zones',
    unitIds: ['unit-ocean-depth', 'unit-light-under-water'],
    thumbnailUrl: '/assets/collections/vertical-zones.webp',
  },
  {
    id: 'col-geological-dynamics',
    slug: 'geological-dynamics',
    title: 'Seafloor Geology & Continental Slopes',
    description: 'Interactive sandbox investigations into sedimentation, submarine avalanches, and underwater terrace formation.',
    category: 'geology',
    unitIds: ['unit-sediment-movement'],
    thumbnailUrl: '/assets/collections/geology.webp',
  },
  {
    id: 'col-deep-adaptations',
    slug: 'deep-adaptations',
    title: 'Deep Ocean Sensory & Bioluminescent Life',
    description: 'Investigate how marine organisms thrive in total darkness through chemical bioluminescence and acute acoustic senses.',
    category: 'biodiversity',
    unitIds: ['unit-life-in-deep', 'unit-ocean-sounds'],
    thumbnailUrl: '/assets/collections/deep-life.webp',
  },
];
