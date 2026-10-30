import { z } from 'zod';
import {
  ActivityKindSchema,
  CreativeMaterialKindSchema,
  CreativeTemplateKindSchema,
  ResourceKindSchema,
  TopicKeySchema,
  VisibilitySchema,
} from './catalog.js';

export const ChoiceOptionSchema = z.object({
  id: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(160),
  mediaId: z.string().uuid().nullable().optional(),
  imageUrl: z.string().trim().min(1).max(500).optional(),
  audioText: z.string().trim().max(300).optional(),
});

export const ChoiceQuestionSchema = z.object({
  id: z.string().trim().min(1).max(80),
  prompt: z.string().trim().min(1).max(300),
  audioText: z.string().trim().max(400).optional(),
  options: z.array(ChoiceOptionSchema).min(2).max(6),
  correctOptionId: z.string().trim().min(1).max(80).optional(),
  points: z.number().int().min(1).max(20).default(10),
});

export const ChoiceGameConfigSchema = z.object({
  templateKey: z.literal('choice'),
  questions: z.array(ChoiceQuestionSchema).min(1).max(20),
});

export const MatchingPairSchema = z.object({
  id: z.string().trim().min(1).max(80),
  leftLabel: z.string().trim().min(1).max(120),
  leftImageUrl: z.string().trim().min(1).max(500).optional(),
  leftMediaId: z.string().uuid().nullable().optional(),
  rightId: z.string().trim().min(1).max(80),
  rightLabel: z.string().trim().min(1).max(120),
  rightImageUrl: z.string().trim().min(1).max(500).optional(),
  rightMediaId: z.string().uuid().nullable().optional(),
  audioText: z.string().trim().max(300).optional(),
  points: z.number().int().min(1).max(20).default(10),
});

export const MatchingGameConfigSchema = z.object({
  templateKey: z.literal('matching'),
  prompt: z.string().trim().min(1).max(300),
  pairs: z.array(MatchingPairSchema).min(2).max(8),
});

export const SortingZoneSchema = z.object({
  id: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().max(200).optional(),
  imageUrl: z.string().trim().max(500).optional(),
  mediaId: z.string().uuid().nullable().optional(),
});

export const SortingItemSchema = z.object({
  id: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(120),
  imageUrl: z.string().trim().min(1).max(500).optional(),
  mediaId: z.string().uuid().nullable().optional(),
  targetZoneId: z.string().trim().min(1).max(80).optional(),
  audioText: z.string().trim().max(300).optional(),
  points: z.number().int().min(1).max(20).default(10),
});

export const SortingGameConfigSchema = z.object({
  templateKey: z.literal('sorting'),
  prompt: z.string().trim().min(1).max(300),
  zones: z.array(SortingZoneSchema).min(2).max(4),
  items: z.array(SortingItemSchema).min(2).max(12),
});

export const ScenarioChoiceBranchSchema = z.object({
  id: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(200),
  imageUrl: z.string().trim().max(500).optional(),
  mediaId: z.string().uuid().nullable().optional(),
  feedbackText: z.string().trim().min(1).max(400),
  feedbackAudioText: z.string().trim().max(400).optional(),
  isPositive: z.boolean().default(true),
  nextSceneId: z.string().trim().max(80).nullable().default(null),
  points: z.number().int().min(0).max(20).default(10),
});

export const ScenarioSceneSchema = z.object({
  id: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(180),
  prompt: z.string().trim().min(1).max(400),
  narrationText: z.string().trim().max(500).optional(),
  imageUrl: z.string().trim().max(500).optional(),
  mediaId: z.string().uuid().nullable().optional(),
  isTerminal: z.boolean().default(false),
  choices: z.array(ScenarioChoiceBranchSchema).max(4).default([]),
});

export const ScenarioConfigSchema = z.object({
  templateKey: z.literal('scenario'),
  startSceneId: z.string().trim().min(1).max(80),
  scenes: z.array(ScenarioSceneSchema).min(1).max(15),
});

export const SimulationConfigSchema = z.object({
  templateKey: z.enum([
    'sim_my_action',
    'sim_plastic_journey',
    'sim_rescue_mission',
    'sim_ocean_atlas',
    'simulation',
  ]),
  simulationKey: z.string().trim().min(1).max(80),
  parameters: z.record(z.string(), z.unknown()).default({}),
});

export const ActivityConfigSchema = z.discriminatedUnion('templateKey', [
  ChoiceGameConfigSchema,
  MatchingGameConfigSchema,
  SortingGameConfigSchema,
  ScenarioConfigSchema,
  z.object({
    templateKey: z.literal('simulation'),
    simulationKey: z.string().trim().min(1).max(80),
    parameters: z.record(z.string(), z.unknown()).default({}),
  }),
]);

export type ActivityConfig = z.infer<typeof ActivityConfigSchema>;

export const ResourceDtoSchema = z.object({
  id: z.string().uuid(),
  kind: ResourceKindSchema,
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1000).default(''),
  coverMediaId: z.string().uuid().nullable().optional(),
  mediaId: z.string().uuid().nullable().optional(),
  coverUrl: z.string().trim().max(500).optional(),
  mediaUrl: z.string().trim().max(500).optional(),
  content: z.record(z.string(), z.unknown()).default({}),
  topics: z.array(TopicKeySchema).default([]),
  linkedVariants: z
    .array(
      z.object({
        id: z.string().uuid(),
        kind: ResourceKindSchema,
        title: z.string(),
      }),
    )
    .default([]),
  visibility: VisibilitySchema,
  version: z.number().int().positive().default(1),
  updatedAt: z.string().optional(),
});
export type ResourceDto = z.infer<typeof ResourceDtoSchema>;

export const ActivityDtoSchema = z.object({
  id: z.string().uuid(),
  kind: ActivityKindSchema,
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1000).default(''),
  templateKey: z.string().trim().min(1).max(80),
  config: z.record(z.string(), z.unknown()),
  schemaVersion: z.number().int().positive().default(1),
  coverMediaId: z.string().uuid().nullable().optional(),
  narrationMediaId: z.string().uuid().nullable().optional(),
  coverUrl: z.string().trim().max(500).optional(),
  narrationUrl: z.string().trim().max(500).optional(),
  topics: z.array(TopicKeySchema).default([]),
  visibility: VisibilitySchema,
  version: z.number().int().positive().default(1),
  updatedAt: z.string().optional(),
});
export type ActivityDto = z.infer<typeof ActivityDtoSchema>;

export const Model3DDtoSchema = z.object({
  id: z.string().uuid(),
  provider: z.literal('sketchfab'),
  modelUid: z.string().regex(/^[a-f0-9]{32}$/i),
  canonicalUrl: z.string().url(),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1000).default(''),
  coverMediaId: z.string().uuid().nullable().optional(),
  narrationMediaId: z.string().uuid().nullable().optional(),
  coverUrl: z.string().trim().max(500).optional(),
  narrationUrl: z.string().trim().max(500).optional(),
  attribution: z.record(z.string(), z.unknown()).default({}),
  topics: z.array(TopicKeySchema).default([]),
  visibility: VisibilitySchema,
  version: z.number().int().positive().default(1),
  updatedAt: z.string().optional(),
});
export type Model3DDto = z.infer<typeof Model3DDtoSchema>;

export const CreativeTemplateDtoSchema = z.object({
  id: z.string().uuid(),
  kind: CreativeTemplateKindSchema,
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1000).default(''),
  payload: z.record(z.string(), z.unknown()).default({}),
  schemaVersion: z.number().int().positive().default(1),
  mediaId: z.string().uuid().nullable().optional(),
  imageUrl: z.string().trim().max(500).optional(),
  topics: z.array(TopicKeySchema).default([]),
  visibility: VisibilitySchema,
  version: z.number().int().positive().default(1),
  updatedAt: z.string().optional(),
});
export type CreativeTemplateDto = z.infer<typeof CreativeTemplateDtoSchema>;

export const CreativeMaterialDtoSchema = z.object({
  id: z.string().uuid(),
  kind: CreativeMaterialKindSchema,
  title: z.string().trim().min(1).max(160),
  payload: z.record(z.string(), z.unknown()).default({}),
  mediaId: z.string().uuid().nullable().optional(),
  imageUrl: z.string().trim().max(500).optional(),
  visibility: VisibilitySchema,
  version: z.number().int().positive().default(1),
  updatedAt: z.string().optional(),
});
export type CreativeMaterialDto = z.infer<typeof CreativeMaterialDtoSchema>;

/**
 * Safely parses and normalizes a Sketchfab URL or 32-char UID without fetching external URLs or accepting raw HTML iframes.
 */
export function parseSketchfabModelInput(raw: string): {
  modelUid: string;
  canonicalUrl: string;
} {
  const trimmed = raw.trim();
  if (!trimmed || /<iframe|<script|javascript:/i.test(trimmed)) {
    throw new Error('Link mô hình 3D không hợp lệ (không chấp nhận mã HTML/iframe).');
  }

  if (/^[a-f0-9]{32}$/i.test(trimmed)) {
    const uid = trimmed.toLowerCase();
    return {
      modelUid: uid,
      canonicalUrl: `https://sketchfab.com/3d-models/${uid}`,
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error('Link Sketchfab không đúng định dạng URL.');
  }

  if (
    parsed.protocol !== 'https:' ||
    (parsed.hostname !== 'sketchfab.com' && parsed.hostname !== 'www.sketchfab.com')
  ) {
    throw new Error('Chỉ hỗ trợ link HTTPS từ miền sketchfab.com.');
  }

  const match = parsed.pathname.match(/([a-f0-9]{32})(?:\/|$)/i);
  if (!match) {
    throw new Error('Không tìm thấy mã model UID (32 ký tự hex) trong link Sketchfab.');
  }

  const uid = match[1].toLowerCase();
  return {
    modelUid: uid,
    canonicalUrl: `https://sketchfab.com/3d-models/${uid}`,
  };
}
