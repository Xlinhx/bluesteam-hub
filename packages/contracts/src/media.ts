import { z } from 'zod';

export const MediaKindSchema = z.enum(['image', 'audio', 'video', 'pdf']);
export type MediaKind = z.infer<typeof MediaKindSchema>;

export const MediaStatusSchema = z.enum(['pending', 'ready', 'failed']);
export type MediaStatus = z.infer<typeof MediaStatusSchema>;

export const MEDIA_UPLOAD_LIMITS_BYTES: Record<MediaKind, number> = {
  image: 10 * 1024 * 1024, // 10 MB
  audio: 20 * 1024 * 1024, // 20 MB
  video: 200 * 1024 * 1024, // 200 MB
  pdf: 30 * 1024 * 1024, // 30 MB
};

export const ALLOWED_MEDIA_MIME_TYPES: Record<MediaKind, readonly string[]> = {
  image: ['image/png', 'image/jpeg', 'image/webp'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4'],
  video: ['video/mp4', 'video/webm'],
  pdf: ['application/pdf'],
};

export const FORBIDDEN_UPLOAD_MIME_TYPES = [
  'image/svg+xml',
  'text/html',
  'application/xhtml+xml',
  'application/javascript',
  'text/javascript',
] as const;

export const MediaUploadResultSchema = z.object({
  id: z.string().uuid(),
  kind: MediaKindSchema,
  mimeType: z.string(),
  byteSize: z.number().int().positive(),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  durationMs: z.number().int().nonnegative().nullable().optional(),
  sha256: z.string().length(64),
  status: MediaStatusSchema,
  url: z.string(),
  previewUrl: z.string().optional(),
});
export type MediaUploadResult = z.infer<typeof MediaUploadResultSchema>;
