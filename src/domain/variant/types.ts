export type IAStrategy = 'journey' | 'explore' | 'classroom';
export type ThemeStrategy = 'editorial' | 'tactile';
export type VariantId = 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6';

export interface IAProfile {
  id: IAStrategy;
  name: string;
  tagline: string;
  primaryEmphasis: string;
  homeStrategy: 'expedition-path' | 'curated-exhibits' | 'active-session-board';
  browseStrategy: 'waypoint-chain' | 'topical-gallery' | 'activity-matrix';
  progressStrategy: 'depth-milestones' | 'specimen-cabinet' | 'participation-roster';
  teacherDashboardStrategy: 'linear-expeditions' | 'dual-pane-library' | 'orchestration-command';
}

export interface ThemeTokens {
  surfaceBase: string;
  surfaceElevated: string;
  surfaceInteractive: string;
  surfaceSunken: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderSoft: string;
  borderStrong: string;
  accentPrimary: string;
  accentSecondary: string;
  radiusBase: string;
  shadowBase: string;
  fontHeading: string;
  fontBody: string;
  fontMono: string;
}

export interface VisualTheme {
  id: ThemeStrategy;
  name: string;
  tagline: string;
  tokens: ThemeTokens;
  componentTreatment: 'museum-exhibit' | 'physical-instrument';
  motionCurve: string;
}

export interface VariantDefinition {
  id: VariantId;
  name: string;
  ia: IAStrategy;
  theme: ThemeStrategy;
  description: string;
  winningStrengths: string[];
  evaluationCriterion: string;
}

export const VARIANTS: Record<VariantId, VariantDefinition> = {
  v1: {
    id: 'v1',
    name: 'Expedition Atlas',
    ia: 'journey',
    theme: 'editorial',
    description: 'Chronological oceanic expedition framed with scientific editorial typography and quiet museum whitespace.',
    winningStrengths: ['Linear progression clarity', 'Atmospheric storytelling', 'Distraction-free reading'],
    evaluationCriterion: 'Does sequential depth travel give young learners stronger mental models of ocean zones than free roaming?',
  },
  v2: {
    id: 'v2',
    name: 'Expedition Lab',
    ia: 'journey',
    theme: 'tactile',
    description: 'Sequential scientific field stations built with tangible instrument controls, mechanical sliders, and physical depth markers.',
    winningStrengths: ['Direct-manipulation affordance', 'Clear spatial cause/effect', 'Tactile feedback on progression'],
    evaluationCriterion: 'Does physical instrument affordance increase student confidence when navigating multi-step inquiries?',
  },
  v3: {
    id: 'v3',
    name: 'Discovery Gallery',
    ia: 'explore',
    theme: 'editorial',
    description: 'Expansive natural history gallery presenting oceanic phenomena as curated architectural exhibits.',
    winningStrengths: ['High discovery breadth', 'Museum-grade visual hierarchy', 'Fast non-linear browsing'],
    evaluationCriterion: 'Does an editorial exhibit layout support wider curiosity-driven exploration for diverse ages?',
  },
  v4: {
    id: 'v4',
    name: 'Discovery Workshop',
    ia: 'explore',
    theme: 'tactile',
    description: 'Interactive open-ended science workbench inviting young learners to freely test water, sediment, and organism specimens.',
    winningStrengths: ['Playful experimentation', 'Intuitive specimen trays', 'High engagement for pre-readers'],
    evaluationCriterion: 'Can a tactile workbench sustain student inquiry without requiring structured teacher guidance?',
  },
  v5: {
    id: 'v5',
    name: 'Classroom Observatory',
    ia: 'classroom',
    theme: 'editorial',
    description: 'Teacher orchestration command center with immediate session quick-launch and high-density editorial telemetry.',
    winningStrengths: ['Rapid lesson preparation', 'Zero-click presentation preview', 'Clean data hierarchy'],
    evaluationCriterion: 'Does an editorial dashboard reduce teacher cognitive overload during high-tempo classroom transitions?',
  },
  v6: {
    id: 'v6',
    name: 'Classroom Lab',
    ia: 'classroom',
    theme: 'tactile',
    description: 'Live physical activity board featuring real-time response counters, tactile toggle banks, and live group prediction meters.',
    winningStrengths: ['Live group participation visibility', 'Immediate whole-class polling', 'Dynamic physical feel'],
    evaluationCriterion: 'Does a tactile switchboard interface facilitate faster whole-class prediction cycles during live projection?',
  },
};
