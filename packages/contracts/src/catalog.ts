import { z } from 'zod';

export const TopicKeySchema = z.enum([
  'creatures',
  'coral',
  'layers',
  'conservation',
]);
export type TopicKey = z.infer<typeof TopicKeySchema>;

export const VisibilitySchema = z.enum(['seed', 'draft', 'published', 'hidden']);
export type Visibility = z.infer<typeof VisibilitySchema>;

export const ResourceKindSchema = z.enum([
  'flashcard',
  'card',
  'image',
  'audio',
  'video',
  'coloring',
  'worksheet',
  'poster',
  'print',
]);
export type ResourceKind = z.infer<typeof ResourceKindSchema>;

export const ActivityKindSchema = z.enum(['game', 'scenario', 'simulation']);
export type ActivityKind = z.infer<typeof ActivityKindSchema>;

export const CreativeTemplateKindSchema = z.enum(['drawing', 'habitat']);
export type CreativeTemplateKind = z.infer<typeof CreativeTemplateKindSchema>;

export const CreativeMaterialKindSchema = z.enum(['stamp', 'habitat_item']);
export type CreativeMaterialKind = z.infer<typeof CreativeMaterialKindSchema>;

export const CatalogQuerySchema = z.object({
  kind: z.string().trim().min(1).max(40).optional(),
  topicIds: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => {
      if (Array.isArray(val)) return val.filter(Boolean);
      return val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    })
    .optional(),
  q: z.string().trim().max(120).optional(),
  cursor: z.string().trim().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  savedIds: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => {
      const list = Array.isArray(val) ? val : val.split(',');
      return list
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 50);
    })
    .optional(),
  visibility: VisibilitySchema.optional(),
});

export type CatalogQuery = z.infer<typeof CatalogQuerySchema>;

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
  total: number;
}

export function createPageSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    nextCursor: z.string().nullable(),
    total: z.number().int().nonnegative(),
  });
}
