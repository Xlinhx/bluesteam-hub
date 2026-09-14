export type ExperienceType = 'video' | 'simulation' | 'challenge' | 'story' | 'audio';

export interface PresentationCapabilities {
  fullscreen: boolean;
  openPublicWindow: boolean;
  hideChrome: boolean;
  largeControls: boolean;
  showJoinCode: boolean;
  showPrompt: boolean;
  revealLabels: boolean;
  focusObject: boolean;
}

export interface StudentInteractionConfig {
  allowsDirectManipulation: boolean;
  dragRequiresPointerAlternative: boolean;
  touchTargetMinSizePx: number; // 48-64 px
  audioInstructionAvailable: boolean;
  audioNarrationAvailable: boolean;
  maxActiveChoices: number;
}

export interface Experience {
  id: string;
  slug: string;
  type: ExperienceType;
  title: string;
  unitId: string;
  summary: string;
  estimatedMinutes: number;

  presentation: PresentationCapabilities;
  studentInteraction: StudentInteractionConfig;

  // Runtime parameters (e.g. simulation initial depth, particle count, etc.)
  runtimeConfig: Record<string, unknown>;
  thumbnailUrl: string;

  audio?: {
    instructionText: string;
    narrationText?: string;
  };
}

export type ExperienceEventType =
  | 'stateChanged'
  | 'observationMade'
  | 'interactionCompleted'
  | 'predictionSubmitted'
  | 'parameterAdjusted';

export interface ExperienceEvent {
  type: ExperienceEventType;
  experienceId: string;
  timestamp: number;
  data: Record<string, unknown>;
}
