export type SessionStatus = 'idle' | 'active' | 'paused' | 'completed';
export type PacingMode = 'guided' | 'independent' | 'observe';

export interface SessionParticipant {
  id: string;
  name: string;
  avatarIconKey: string;
  connectedAt: number;
  lastActiveAt: number;
  currentExperienceId?: string;
  submittedPrediction?: string;
}

export interface SessionPromptState {
  isOpen: boolean;
  promptId: string;
  question: string;
  options: { id: string; label: string; iconKey?: string }[];
  revealedAnswerId?: string;
}

export interface Session {
  id: string;
  joinCode: string; // 4-digit or memorable code
  status: SessionStatus;
  teacherId: string;
  teacherName: string;
  classTitle: string;

  participants: SessionParticipant[];

  unitId: string;
  experienceQueue: string[]; // array of experienceIds
  currentExperienceIndex: number;
  currentExperienceId: string;

  pacingMode: PacingMode;
  presentationEnabled: boolean;
  presentationWindowOpen: boolean;

  promptState: SessionPromptState;
  simulationState: Record<string, unknown>;

  createdAt: number;
  updatedAt: number;
}

export type SessionEventType =
  | 'SESSION_STARTED'
  | 'SESSION_ENDED'
  | 'EXPERIENCE_CHANGED'
  | 'PACING_CHANGED'
  | 'PROMPT_OPENED'
  | 'PROMPT_CLOSED'
  | 'RESPONSE_SUBMITTED'
  | 'SIM_COMMAND'
  | 'SIM_STATE_SNAPSHOT'
  | 'PRESENTATION_STATE_CHANGED'
  | 'PARTICIPANT_JOINED'
  | 'PARTICIPANT_LEFT';

export interface SessionMessage<T = unknown> {
  eventId: string;
  sourceId: string;
  sessionId: string;
  timestamp: number;
  version: number;
  type: SessionEventType;
  payload: T;
}
