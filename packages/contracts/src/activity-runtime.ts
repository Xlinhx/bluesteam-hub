import { z } from 'zod';
import type { ActivityConfig } from './content.js';

export const ActivityContextSchema = z.enum(['standalone', 'preview', 'presentation']);
export type ActivityContext = z.infer<typeof ActivityContextSchema>;

export interface ActivityRuntimeCapabilities {
  supportsPresentation: boolean;
  supportsScoring: boolean;
}


export interface ActivityRuntimeProps {
  context: ActivityContext;
  activityId: string;
  title: string;
  templateKey: string;
  config: ActivityConfig | Record<string, unknown>;
  isPaused?: boolean;
  readOnly?: boolean;
  onComplete?: (summary: { completedItems: number; totalItems: number }) => void;
}
