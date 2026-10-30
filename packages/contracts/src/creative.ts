import { z } from 'zod';

export const CreativeSceneItemSchema = z.object({
  id: z.string().min(1).max(120),
  assetId: z.string().min(1).max(120),
  type: z.enum(['coral', 'seagrass', 'rock', 'fish', 'turtle', 'anemone']),
  nameVi: z.string().max(120), nameEn: z.string().max(120).default(''),
  x: z.number().min(-7).max(7), z: z.number().min(-4.5).max(4.5),
  y: z.number().min(0).max(8).optional(),
  rotation: z.number().finite(), scale: z.number().min(.5).max(2),
  color: z.string().optional(),
}).passthrough();
export type CreativeSceneItem = z.infer<typeof CreativeSceneItemSchema>;
export interface CreativeValidationIssue { field: string; message: string; materialId?: string }

/** Covers are deliberately excluded: a cover is never the paper's outline. */
export function normalizeCreativeConfig(kind: 'drawing' | 'habitat', payload: Record<string, any> = {}): Record<string, any> {
  const result = { ...payload };
  result.instructionText = payload.instructionText ?? payload.instruction ?? '';
  if (kind === 'drawing') {
    result.outlineUrl = payload.outlineUrl ?? payload.templateImageUrl ?? payload.lineartUrl;
    result.suggestedPalette = payload.suggestedPalette ?? payload.suggestedColors ?? [];
  }
  result.materialIds = Array.isArray(payload.materialIds) ? [...new Set(payload.materialIds)] : [];
  return result;
}

export function validateCreativeConfig(kind: 'drawing' | 'habitat', raw: Record<string, any>): CreativeValidationIssue[] {
  const config = normalizeCreativeConfig(kind, raw);
  const errors: CreativeValidationIssue[] = [];
  if (kind === 'drawing') {
    if (!config.blankPaper && !config.outlineUrl && !config.svgTemplate) errors.push({ field: 'outlineUrl', message: 'Chọn nét mẫu hoặc trang giấy trắng.' });
    if (!Array.isArray(config.suggestedPalette) || config.suggestedPalette.length > 20 || config.suggestedPalette.some((c: unknown) => typeof c !== 'string' || !/^#[\da-f]{6}$/i.test(c))) errors.push({ field: 'suggestedPalette', message: 'Màu gợi ý cần đúng mã màu, tối đa 20 màu.' });
  } else if (!Array.isArray(config.items) && !Number.isInteger(config.presetId)) {
    errors.push({ field: 'items', message: 'Chọn cảnh khởi đầu hoặc bố trí sa bàn.' });
  } else if (Array.isArray(config.items)) {
    const parsed = z.array(CreativeSceneItemSchema).max(100).safeParse(config.items);
    if (!parsed.success) for (const issue of parsed.error.issues) errors.push({ field: `items.${issue.path.join('.')}`, message: 'Vật thể hoặc vị trí nằm ngoài giới hạn sa bàn.' });
    if (new Set(config.items.map((i: any) => i.id)).size !== config.items.length) errors.push({ field: 'items', message: 'Mỗi vật thể phải có ID riêng.' });
  }
  if (typeof config.instructionText === 'string' && config.instructionText.length > 2000) errors.push({ field: 'instructionText', message: 'Hướng dẫn tối đa 2000 ký tự.' });
  if (config.materialIds.length > 50 || config.materialIds.some((id: unknown) => !z.string().uuid().safeParse(id).success)) errors.push({ field: 'materialIds', message: 'Chọn tối đa 50 vật liệu hợp lệ.' });
  return errors;
}
