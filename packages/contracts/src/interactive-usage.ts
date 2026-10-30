import { z } from 'zod';
import type { UsageAnalysis } from './interactive-analysis.js';

export const usageKindSchema = z.enum(['model3d', 'game', 'simulation', 'scenario']);
export type UsageKind = z.infer<typeof usageKindSchema>;
export const usageOpenSchema = z.object({ contentType: z.enum(['activity', 'model3d']), contentId: z.string().uuid(), version: z.number().int().positive(), openKey: z.string().uuid() }).strict();
export type UsageOpenInput = z.infer<typeof usageOpenSchema>;
export type UsageContentRef = Pick<UsageOpenInput, 'contentType' | 'contentId' | 'version'>;
const id = z.string().min(1).max(160);
export const usageInteractionSchema = z.object({ clientEventId: z.string().uuid(), payload: z.discriminatedUnion('type', [
  z.object({ type: z.literal('game_answer'), itemId: id, answerId: id }).strict(),
  z.object({ type: z.literal('simulation_step'), stepId: id }).strict(),
  z.object({ type: z.literal('simulation_choice'), stepId: id, choiceId: id }).strict(),
  z.object({ type: z.literal('scenario_choice'), sceneId: id, choiceId: id }).strict(),
]) }).strict();
export type UsageInteractionInput = z.infer<typeof usageInteractionSchema>;
export type UsagePayload = UsageInteractionInput['payload'];
export interface UsageOpenResult { runId: string; token: string; openedAt: string; expiresAt: string; definitionVersion: number }
export interface UsageFilter { kind: UsageKind; from: string; to: string; timezone: 'Asia/Saigon'; q?: string; contentId?: string; asOf: string }
export interface UsageMetric { value: number | null; coverage: 'collected' | 'partial' | 'not_collected'; availableFrom: string | null }
export interface UsageSummary { opens: UsageMetric; interactedRuns: UsageMetric; usedActivities: UsageMetric }
export interface UsageRow { contentType: 'activity' | 'model3d'; contentId: string; kind: UsageKind; title: string; coverUrl: string | null; availableVersions: number[]; defaultVersion: number; lastOpenedAt: string | null; opens: number; interactedRuns: number | null }
export interface UsageReport { meta: { filter: UsageFilter; availableFrom: string; metricDefinitionVersion: number; scope: 'standalone_aggregate' }; summary: UsageSummary; rows: UsageRow[]; nextCursor: string | null; daily: Array<{ localDate: string; opens: number | null; interactedRuns: number | null }> }
export interface UsageDetail { kind: UsageKind; version: number; opens: number; interactedRuns: number | null; sections: Array<{ id: string; label: string; denominator: number; values: Array<{ id: string; label: string; count: number }> }>; analysis?: UsageAnalysis | null }

export function parseUsageFilter(raw: Record<string, unknown>, now = new Date()): UsageFilter {
  const kind = usageKindSchema.parse(raw.kind || 'game');
  const localToday = new Date(now.getTime() + 7 * 3600000).toISOString().slice(0, 10);
  const endToday = new Date(`${localToday}T00:00:00+07:00`).getTime() + 86400000;
  const from = new Date(String(raw.from || new Date(endToday - 30 * 86400000).toISOString()));
  const to = new Date(String(raw.to || new Date(endToday).toISOString()));
  const asOf = raw.asOf ? new Date(String(raw.asOf)) : now;
  if (![from, to, asOf].every(d => Number.isFinite(d.getTime())) || from >= to || to.getTime() - from.getTime() > 366 * 86400000 || asOf.getTime() > now.getTime() + 1000) throw new Error('Khoảng thời gian không hợp lệ (tối đa 366 ngày).');
  const contentId = raw.contentId ? z.string().uuid().parse(raw.contentId) : undefined;
  return { kind, from: from.toISOString(), to: to.toISOString(), asOf: asOf.toISOString(), timezone: 'Asia/Saigon', q: raw.q ? String(raw.q).trim().slice(0, 200) : undefined, contentId };
}
export function csvCell(value: unknown): string {
  let text = String(value ?? '');
  if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
