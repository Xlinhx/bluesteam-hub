export type ActivityContext = 'standalone' | 'preview' | 'presentation';

export type ActivityKind = 'game' | 'scenario' | 'simulation';

export type GameTemplateKey = 'sorting' | 'matching' | 'choice';
export type GameTemplateType = GameTemplateKey;

export type SimulationTemplateKey =
  | 'rescue-mission'
  | 'plastic-journey'
  | 'water-column'
  | 'my-action';

export type ActivityTemplateKey = GameTemplateKey | 'scenario' | SimulationTemplateKey;

export interface SortingTargetZone {
  id: string;
  label: string;
  subtitle?: string;
  iconKey?: string;
  imageUrl?: string;
  shape?: 'ellipse' | 'rectangle';
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface SortingDraggableObject {
  id: string;
  label: string;
  imageUrl: string;
  audioText?: string;
  audioUrl?: string;
  scale?: number;
  acceptedTargetIds: string[];
  targetZoneId?: string;
  points?: number;
}

export interface SortingGameConfig {
  templateKey: 'sorting';
  instructionText?: string;
  narrationUrl?: string;
  prompt?: string;
  allowRetry?: boolean;
  scoringEnabled?: boolean;
  backgroundUrl?: string;
  targets?: SortingTargetZone[];
  zones?: SortingTargetZone[];
  objects?: SortingDraggableObject[];
  items?: SortingDraggableObject[];
}

export interface MatchingSideItem {
  id: string;
  label: string;
  imageUrl: string;
  isSilhouette?: boolean;
}

export interface MatchingPairItem {
  id: string;
  left?: MatchingSideItem;
  right?: MatchingSideItem;
  leftLabel?: string;
  leftImageUrl?: string;
  leftAudioUrl?: string;
  rightId?: string;
  rightLabel?: string;
  rightImageUrl?: string;
  rightAudioUrl?: string;
  audioText?: string;
  points?: number;
}

export interface MatchingGameConfig {
  templateKey: 'matching';
  instructionText?: string;
  narrationUrl?: string;
  prompt?: string;
  allowRetry?: boolean;
  scoringEnabled?: boolean;
  pairs: MatchingPairItem[];
}

export interface ChoiceOptionItem {
  id: string;
  label: string;
  imageUrl?: string;
  audioText?: string;
}

export interface ChoiceQuestionItem {
  id: string;
  promptText?: string;
  prompt?: string;
  audioText?: string;
  audioUrl?: string;
  feedbackAudioUrl?: string;
  options: ChoiceOptionItem[];
  correctOptionId: string;
  feedbackText?: string;
  points?: number;
}

export interface ChoiceGameConfig {
  templateKey: 'choice';
  instructionText?: string;
  narrationUrl?: string;
  allowRetry?: boolean;
  scoringEnabled?: boolean;
  questions: ChoiceQuestionItem[];
}

export interface ScenarioChoiceBranch {
  id: string;
  label: string;
  imageUrl?: string;
  nextSceneId: string | null;
  feedbackText: string;
  feedbackAudioText?: string;
  feedbackAudioUrl?: string;
  isCorrect?: boolean;
  isPositive?: boolean;
  points?: number;
}

export interface ScenarioSceneNode {
  id: string;
  title: string;
  backgroundUrl?: string;
  imageUrl?: string;
  narrationText?: string;
  narrationUrl?: string;
  prompt?: string;
  isEnd?: boolean;
  isEnding?: boolean;
  isTerminal?: boolean;
  choices: ScenarioChoiceBranch[];
}

export interface ScenarioActivityConfig {
  templateKey: 'scenario';
  scoringMode?: 'none' | 'correct-choice';
  startSceneId: string;
  scoringEnabled?: boolean;
  scenes: ScenarioSceneNode[];
}

export type ScenarioConfig = ScenarioActivityConfig;
export type ScenarioScene = ScenarioSceneNode;

export interface SimulationActivityConfig {
  templateKey?: string;
  simulationKey: string;
  route?: string;
  instructionText?: string;
  initialDepthMeters?: number;
  parameters?: Record<string, unknown>;
}

export type AnyActivityConfig =
  | SortingGameConfig
  | MatchingGameConfig
  | ChoiceGameConfig
  | ScenarioActivityConfig
  | SimulationActivityConfig
  | Record<string, unknown>;


export interface ActivityRuntimeCapabilities {
  supportsPresentation: boolean;
  supportsScoring: boolean;
  allowsTeacherCreate: boolean;
}

export interface ActivityRuntimeProps {
  onUsageInteraction?: (payload: import('@bluesteam/contracts').UsagePayload) => void;
  onRestart?: () => void;
  context?: ActivityContext;
  mode?: string;
  activityId?: string;
  title?: string;
  kind?: ActivityKind;
  templateKey: string;
  config: AnyActivityConfig;
  isPaused?: boolean;
  readOnly?: boolean;
  onPracticeFeedback?: (feedback: {
    itemId: string;
    isCorrect: boolean;
    message: string;
  }) => void;
  onComplete?: (summary: { completedItems: number; totalItems: number; earnedPoints: number }) => void;
}
