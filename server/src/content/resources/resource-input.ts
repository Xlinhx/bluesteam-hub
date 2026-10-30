import { z } from 'zod';
import { parseWithZod } from '../../common/validation.js';

const ResourceInput = z.object({
  title: z.string().trim().min(1).max(100),
  kind: z.enum(['flashcard','image','audio','video','coloring','worksheet','poster']),
  description: z.string().trim().max(5000).optional(),
  coverMediaId: z.string().uuid().nullable().optional(),
  mediaId: z.string().uuid().nullable().optional(),
  content: z.record(z.unknown()).optional(),
  topicSlugs: z.array(z.string().min(1).max(100)).max(100).optional(),
  linkedVariantIds: z.array(z.string().uuid()).max(100).optional(),
  groupIds: z.array(z.string().uuid()).max(100).optional(),
  visibility: z.enum(['published','hidden']).optional(),
});

export function parseResourceInput(input: unknown, partial: true): Partial<z.infer<typeof ResourceInput>>;
export function parseResourceInput(input: unknown, partial?: false): z.infer<typeof ResourceInput> & {title: string; kind: string};
export function parseResourceInput(input: unknown, partial = false) {
  return parseWithZod(partial ? ResourceInput.partial() : ResourceInput, input);
}
