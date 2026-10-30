import { LearningPath } from '../../types/learningUnit';

export const SEED_PATHS: LearningPath[] = [
  {
    id: 'path-abyssal-expedition',
    slug: 'abyssal-expedition',
    title: 'The Great Abyssal Expedition',
    tagline: 'Descent from Sunlight to 4,000m Depth',
    description: 'A continuous vertical descent stopping at key physical stations: surface warmth, the fading twilight thermocline, and the pitch-black benthic plain.',
    steps: [
      {
        order: 1,
        unitId: 'unit-ocean-depth',
        recommendedExperienceId: 'exp-video-descent',
        isMilestone: false,
        waypointName: 'Station Alpha: The Epipelagic Shallows (0m - 200m)',
      },
      {
        order: 2,
        unitId: 'unit-ocean-depth',
        recommendedExperienceId: 'exp-sim-water-column',
        isMilestone: true,
        waypointName: 'Station Beta: Mesopelagic Thermocline (200m - 1,000m)',
      },
      {
        order: 3,
        unitId: 'unit-life-in-deep',
        recommendedExperienceId: 'exp-challenge-creature-depth',
        isMilestone: true,
        waypointName: 'Station Gamma: Bathypelagic Midnight (1,000m - 4,000m)',
      },
      {
        order: 4,
        unitId: 'unit-ocean-sounds',
        recommendedExperienceId: 'exp-audio-abyssal-sounds',
        isMilestone: false,
        waypointName: 'Station Delta: Benthic Hydrophone Relay (4,000m+)',
      },
    ],
  },
  {
    id: 'path-mineral-currents',
    slug: 'mineral-currents',
    title: 'Currents & Geological Terraces',
    tagline: 'Following Quartz and Silt from Coast to Canyon',
    description: 'Track how sediment moves down continental slopes under varying hydrological flow regimes.',
    steps: [
      {
        order: 1,
        unitId: 'unit-sediment-movement',
        recommendedExperienceId: 'exp-sim-sediment-terraces',
        isMilestone: true,
        waypointName: 'Field Lab 1: Continental Slope Incline & Sand Deposition',
      },
      {
        order: 2,
        unitId: 'unit-sediment-movement',
        recommendedExperienceId: 'exp-challenge-sediment-sorting',
        isMilestone: false,
        waypointName: 'Field Lab 2: Hydrodynamic Grain Sorting Benchmark',
      },
      {
        order: 3,
        unitId: 'unit-sediment-movement',
        recommendedExperienceId: 'exp-story-pebble-journey',
        isMilestone: true,
        waypointName: 'Field Lab 3: Deep Submarine Fan Terrace Construction',
      },
    ],
  },
];
