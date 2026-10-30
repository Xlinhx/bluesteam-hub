import { Inject, Injectable } from '@nestjs/common';
import type pg from 'pg';
import crypto from 'node:crypto';
import { usageOpenSchema, usageInteractionSchema, INTERACTIVE_SIMULATION_DEFINITIONS, type UsagePayload } from '@bluesteam/contracts';
import { DB_POOL } from '../database/database.module.js';
import { ActivitiesService } from '../content/activities/activities.service.js';
import { ModelsService } from '../content/models/models.service.js';
import { AppError } from '../common/errors.js';

export interface UsageSnapshot { kind: string; templateKey?: string; title?: string; coverUrl?: string; config?: Record<string, any>; runtimeDefinition?: (typeof INTERACTIVE_SIMULATION_DEFINITIONS)[string] }
export function validateUsagePayload(s: UsageSnapshot, p: UsagePayload): { itemId: string; label: string; correct?: boolean; choiceLabel?: string } {
  const invalid = () => { throw new AppError('INVALID_USAGE_INTERACTION', 'Thao tác không thuộc phiên bản hoạt động này.'); };
  const c = s.config || {};
  if (s.kind === 'game' && p.type === 'game_answer') {
    if (s.templateKey === 'sorting') {
      const item = (c.objects || c.items || []).find((x: any) => x.id === p.itemId);
      const target = (c.targets || c.zones || []).find((x: any) => x.id === p.answerId);
      if (!item || !target) return invalid();
      return { itemId: item.id, label: item.label, correct: (item.acceptedTargetIds || [item.targetZoneId]).includes(target.id) };
    }
    if (s.templateKey === 'matching') {
      const item = (c.pairs || []).find((x: any) => x.id === p.itemId);
      const right = (c.pairs || []).find((x: any) => x.id === p.answerId);
      if (!item || !right) return invalid();
      return { itemId: item.id, label: item.left?.label || item.leftLabel || item.id, correct: item.id === right.id };
    }
    if (s.templateKey === 'choice') {
      const item = (c.questions || []).find((x: any) => x.id === p.itemId);
      if (!item || !item.options?.some((x: any) => x.id === p.answerId)) return invalid();
      return { itemId: item.id, label: item.promptText || item.prompt || item.id, correct: item.correctOptionId === p.answerId };
    }
  }
  if (s.kind === 'scenario' && p.type === 'scenario_choice') {
    const scene = (c.scenes || []).find((x: any) => x.id === p.sceneId);
    const choice = scene?.choices?.find((x: any) => x.id === p.choiceId);
    if (!scene || !choice) return invalid();
    return { itemId: scene.id, label: scene.promptText || scene.title || scene.id, choiceLabel: choice.label || choice.text || choice.id };
  }
  if (s.kind === 'simulation' && (p.type === 'simulation_step' || p.type === 'simulation_choice')) {
    const step = (s.runtimeDefinition || INTERACTIVE_SIMULATION_DEFINITIONS[s.templateKey || ''])?.steps.find(x => x.id === p.stepId);
    if (!step) return invalid();
    const choice = p.type === 'simulation_choice' ? step.choices?.find(x => x.id === p.choiceId) : undefined;
    if (p.type === 'simulation_choice' && !choice) return invalid();
    return { itemId: step.id, label: step.label, ...(choice ? { choiceLabel: choice.label } : {}) };
  }
  return invalid();
}
const hash = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

@Injectable()
export class InteractiveUsageService {
  private readonly secret = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
  constructor(@Inject(DB_POOL) private readonly pool: pg.Pool, @Inject(ActivitiesService) private readonly activities: ActivitiesService, @Inject(ModelsService) private readonly models: ModelsService) {}
  private tokenFor(id: string, key: string) { return crypto.createHmac('sha256',this.secret).update(`${id}:${key}`).digest('base64url'); }

  async open(raw: unknown) {
    const parsed = usageOpenSchema.safeParse(raw);
    if (!parsed.success) throw new AppError('INVALID_USAGE_INPUT', 'Thông tin lượt mở không hợp lệ.');
    const input = parsed.data;
    const existing = await this.pool.query('SELECT * FROM interactive_usage_runs WHERE open_key=$1', [input.openKey]);
    if (existing.rows[0]) return this.reopen(existing.rows[0], input);
    const content = input.contentType === 'model3d' ? await this.models.getModelById(input.contentId, { isTeacher: false }) : await this.activities.getActivityById(input.contentId, { isTeacher: false });
    if (content.version !== input.version) throw new AppError('CONTENT_VERSION_CHANGED', 'Nội dung đã cập nhật. Hãy mở lại hoạt động.', 409);
    const snapshot: UsageSnapshot = { kind: input.contentType === 'model3d' ? 'model3d' : (content as any).kind, title: content.title, coverUrl: content.coverUrl, templateKey: (content as any).templateKey, config: (content as any).config };
    if(snapshot.kind==='simulation') snapshot.runtimeDefinition = INTERACTIVE_SIMULATION_DEFINITIONS[snapshot.templateKey || ''];
    const runId = crypto.randomUUID();
    const token = this.tokenFor(runId,input.openKey);
    const result = await this.pool.query(`INSERT INTO interactive_usage_runs(id,open_key,content_type,content_id,content_version,kind,snapshot,token_hash,expires_at)
      VALUES($8,$1,$2,$3,$4,$5,$6,$7,now()+interval '2 hours') ON CONFLICT(open_key) DO NOTHING RETURNING *`, [input.openKey,input.contentType,input.contentId,input.version,snapshot.kind,snapshot,hash(token),runId]);
    if (!result.rows[0]) return this.reopen((await this.pool.query('SELECT * FROM interactive_usage_runs WHERE open_key=$1',[input.openKey])).rows[0],input);
    return this.openResult(result.rows[0],token);
  }
  private openResult(row: any, token: string) { return { runId: row.id, token, openedAt: new Date(row.opened_at).toISOString(), expiresAt: new Date(row.expires_at).toISOString(), definitionVersion: row.definition_version }; }
  private async reopen(row: any, input: ReturnType<typeof usageOpenSchema.parse>) {
    if (row.content_id !== input.contentId || row.content_type !== input.contentType || row.content_version !== input.version) throw new AppError('OPEN_KEY_CONFLICT', 'Lượt mở đã thuộc nội dung khác.', 409);
    // Concurrent retries receive the same token, so neither invalidates the other.
    const token = this.tokenFor(row.id,row.open_key);
    const updated = await this.pool.query(`UPDATE interactive_usage_runs SET token_hash=$2,expires_at=now()+interval '2 hours' WHERE id=$1 RETURNING *`,[row.id,hash(token)]);
    return this.openResult(updated.rows[0], token);
  }
  async record(runId: string, token: string, raw: unknown) {
    if (!/^[a-f0-9-]{36}$/i.test(runId) || typeof token !== 'string' || token.length > 200) throw new AppError('INVALID_USAGE_TOKEN', 'Lượt ghi nhận không hợp lệ.', 401);
    if (JSON.stringify(raw ?? null).length > 16384) throw new AppError('USAGE_PAYLOAD_TOO_LARGE', 'Thao tác quá lớn.',413);
    const parsed = usageInteractionSchema.safeParse(raw);
    if (!parsed.success) throw new AppError('INVALID_USAGE_INPUT','Thao tác không hợp lệ.');
    const found = await this.pool.query('SELECT * FROM interactive_usage_runs WHERE id=$1 AND token_hash=$2 AND expires_at>now()', [runId,hash(token)]);
    const run = found.rows[0];
    if (!run) throw new AppError('INVALID_USAGE_TOKEN','Lượt ghi nhận đã hết hạn hoặc không hợp lệ.',401);
    const result = validateUsagePayload(run.snapshot,parsed.data.payload);
    const inserted = await this.pool.query(`INSERT INTO interactive_usage_interactions(run_id,client_event_id,payload,item_id,result) VALUES($1,$2,$3,$4,$5) ON CONFLICT(run_id,client_event_id) DO NOTHING RETURNING id`,[runId,parsed.data.clientEventId,parsed.data.payload,result.itemId,result]);
    if (!inserted.rowCount) {
      const prior = await this.pool.query('SELECT payload FROM interactive_usage_interactions WHERE run_id=$1 AND client_event_id=$2',[runId,parsed.data.clientEventId]);
      if (JSON.stringify(prior.rows[0].payload) !== JSON.stringify(JSON.parse(JSON.stringify(parsed.data.payload)))) {
        // Compare canonical JSON keys independently of Postgres JSONB key ordering.
        const old = prior.rows[0].payload;
        if (Object.keys(old).length !== Object.keys(parsed.data.payload).length || Object.entries(parsed.data.payload).some(([k,v])=>old[k]!==v)) throw new AppError('EVENT_KEY_CONFLICT','Mã thao tác đã được dùng cho dữ liệu khác.',409);
      }
    }
    return { accepted: true as const, duplicate: !inserted.rowCount };
  }
}
