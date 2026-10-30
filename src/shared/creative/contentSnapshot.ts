export interface ImmutableContentSnapshot {
  contentType: 'resource' | 'activity' | 'model3d' | 'creative_template';
  contentId: string;
  title: string;
  kind: string;
  templateKey?: string;
  thumbnailUrl: string;
  narrationUrl: string | null;
  config: Record<string, unknown>;
  contentVersion: number;
  capturedAt: string;
}
