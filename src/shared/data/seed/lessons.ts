export interface LessonExperienceRef {
  experienceId: string;
  order: number;
  customTitle?: string;
  durationMinutes: number;
  teacherNotes?: string;
  isHidden?: boolean;
}

export interface LessonPlan {
  id: string;
  title: string;
  unitId: string;
  summary: string;
  experiences: LessonExperienceRef[];
  targetDurationMinutes: number;
  createdAt: number;
  updatedAt: number;
}

export const SEED_LESSONS: LessonPlan[] = [
  {
    id: 'lesson-depth-expedition',
    title: 'Whole-Class Expedition: Diving from Sunlight to Trench',
    unitId: 'unit-ocean-depth',
    summary: 'A 25-minute structured inquiry exploring light attenuation, hydrostatic pressure, and deep-sea creatures.',
    targetDurationMinutes: 25,
    experiences: [
      {
        experienceId: 'exp-video-descent',
        order: 1,
        customTitle: '01 Intro: Submersible Submersion',
        durationMinutes: 4,
        teacherNotes: 'Observe how color shifts from green-blue to deep ink black.',
      },
      {
        experienceId: 'exp-sim-water-column',
        order: 2,
        customTitle: '02 Interactive Sim: The Ocean Water Column',
        durationMinutes: 8,
        teacherNotes: 'Have students predict where sunlight vanishes before sliding down past 200m.',
      },
      {
        experienceId: 'exp-prompt-pressure-prediction',
        order: 3,
        customTitle: '03 Whole-Class Prediction: The Sealed Cup',
        durationMinutes: 3,
        teacherNotes: 'Collect live predictions on projector before revealing the compressed foam cup.',
      },
      {
        experienceId: 'exp-challenge-creature-depth',
        order: 4,
        customTitle: '04 Tactile Challenge: Creature Placement',
        durationMinutes: 6,
        teacherNotes: 'Students work independently on tablets to place organisms into matching zones.',
      },
      {
        experienceId: 'exp-audio-abyssal-sounds',
        order: 5,
        customTitle: '05 Acoustic Recap: Deep Hydrophone Songs',
        durationMinutes: 4,
        teacherNotes: 'Listen to low-frequency whale calls echoing through the twilight waters.',
      },
    ],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 'lesson-sediment-dynamics',
    title: 'Seafloor Architecture & Flowing Terraces',
    unitId: 'unit-sediment-movement',
    summary: 'Directly manipulating water flow rates and slope angles to observe how sediment builds continental shelves.',
    targetDurationMinutes: 20,
    experiences: [
      {
        experienceId: 'exp-sim-sediment-terraces',
        order: 1,
        customTitle: '01 Interactive Sim: Flow & Slope Sandbox',
        durationMinutes: 8,
        teacherNotes: 'Demonstrate difference between 5-degree shelf and 25-degree submarine canyon.',
      },
      {
        experienceId: 'exp-challenge-sediment-sorting',
        order: 2,
        customTitle: '02 Particle Weight Experiment',
        durationMinutes: 6,
        teacherNotes: 'Prompt learners to test why light silt particles travel farther than heavy gravel.',
      },
      {
        experienceId: 'exp-story-pebble-journey',
        order: 3,
        customTitle: '03 Story: Journey of a Quartz Grain',
        durationMinutes: 6,
        teacherNotes: 'Quiet concluding visual narrative of seafloor deposition over time.',
      },
    ],
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000,
  },
];
