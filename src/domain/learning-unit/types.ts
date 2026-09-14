export type AgeBand = 'early-childhood' | 'primary' | 'intermediate';
export type GradeBand = 'pre-k' | 'kindergarten' | 'grade-1' | 'grade-2' | 'grade-3+';
export type ReadingLevel = 'pre-reader' | 'early-reader' | 'fluent-reader';

export interface FrameworkMapping {
  frameworkId: 'ngss' | 'blue-stem' | 'ece-science';
  code: string;
  title: string;
  description: string;
}

export interface AtmospherePalette {
  surfaceBackground: string;
  accent: string;
  ambientLight: string;
  fogColor: string;
  tagline: string;
}

export interface LearningUnit {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary: string;

  // Decoupled indicators
  ageBand: AgeBand;
  gradeBand: GradeBand;
  readingLevel: ReadingLevel;

  learningGoals: string[];
  concepts: string[];

  experienceIds: string[];
  tagIds: string[];
  frameworkMappings: FrameworkMapping[];

  heroAssetId: string;
  thumbnailUrl: string;
  colorAtmosphere: AtmospherePalette;
  estimatedTotalMinutes: number;
}

export interface LearningCollection {
  id: string;
  slug: string;
  title: string;
  description: string;
  unitIds: string[];
  category: 'depth-zones' | 'geology' | 'biodiversity' | 'physical-systems';
  thumbnailUrl: string;
}

export interface LearningPathStep {
  order: number;
  unitId: string;
  recommendedExperienceId: string;
  isMilestone: boolean;
  waypointName: string;
}

export interface LearningPath {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  steps: LearningPathStep[];
}
