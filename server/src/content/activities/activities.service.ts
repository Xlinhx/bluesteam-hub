import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import type pg from 'pg';
import { validateGameForPublish } from '@bluesteam/contracts';
import { DB_POOL } from '../../database/database.module.js';
import { AppError } from '../../common/errors.js';
import { assertOwnerMatch } from '../../common/authorization.js';
import { assertValidUuid } from '../../common/validation.js';
import {
  encodeCursor,
  decodeCursor,
  resolveMediaPublicUrl,
} from '../resources/resources.service.js';

export interface ServerScenarioValidationIssue {
  code: string;
  message: string;
  sceneId?: string;
  choiceId?: string;
}

export function validateScenarioConfigServer(rawConfig: Record<string, unknown>): {
  valid: boolean;
  issues: ServerScenarioValidationIssue[];
} {
  const issues: ServerScenarioValidationIssue[] = [];
  const scenes = Array.isArray((rawConfig as any)?.scenes)
    ? ((rawConfig as any).scenes as any[])
    : [];
  const startSceneId =
    typeof (rawConfig as any)?.startSceneId === 'string'
      ? (rawConfig as any).startSceneId.trim()
      : '';

  if (scenes.length === 0) {
    issues.push({ code: 'EMPTY_SCENES', message: 'Tình huống phải có ít nhất 1 cảnh.' });
    return { valid: false, issues };
  }
  if (!startSceneId) {
    issues.push({ code: 'MISSING_START_SCENE', message: 'Chưa chọn cảnh mở đầu (startSceneId).' });
  }

  const sceneMap = new Map<string, any>();
  for (const s of scenes) {
    const id = (s?.id || '').trim();
    if (!id) continue;
    if (sceneMap.has(id)) {
      issues.push({ code: 'DUPLICATE_SCENE_ID', sceneId: id, message: `Mã cảnh "${id}" bị trùng.` });
    } else {
      sceneMap.set(id, s);
    }
  }

  if (startSceneId && !sceneMap.has(startSceneId)) {
    issues.push({
      code: 'INVALID_START_SCENE',
      sceneId: startSceneId,
      message: `Cảnh mở đầu "${startSceneId}" không tồn tại.`,
    });
  }

  const isTerminal = (s: any) => Boolean(s?.isEnd || s?.isTerminal || s?.isEnding);
  const terminalIds: string[] = [];

  for (const s of sceneMap.values()) {
    if (isTerminal(s)) {
      terminalIds.push(s.id);
      continue;
    }
    const choices = Array.isArray(s.choices) ? s.choices : [];
    if (choices.length === 0) {
      issues.push({
        code: 'DEAD_END_SCENE',
        sceneId: s.id,
        message: `Cảnh "${s.title || s.id}" là cảnh cụt chưa có lựa chọn tiếp theo.`,
      });
      continue;
    }
    for (const ch of choices) {
      const nextId = typeof ch?.nextSceneId === 'string' ? ch.nextSceneId.trim() : '';
      if (!nextId) {
        issues.push({
          code: 'MISSING_NEXT_SCENE',
          sceneId: s.id,
          choiceId: ch?.id,
          message: `Lựa chọn "${ch?.label || ch?.id}" chưa gắn nhánh cảnh tiếp theo.`,
        });
      } else if (!sceneMap.has(nextId)) {
        issues.push({
          code: 'MISSING_TARGET_SCENE',
          sceneId: s.id,
          choiceId: ch?.id,
          message: `Lựa chọn "${ch?.label || ch?.id}" trỏ tới cảnh không tồn tại "${nextId}".`,
        });
      }
    }
  }

  const reachable = new Set<string>();
  const color = new Map<string, 0 | 1 | 2>();
  const stack: string[] = [];

  const dfs = (nodeId: string, markReach: boolean) => {
    if (markReach) reachable.add(nodeId);
    color.set(nodeId, 1);
    stack.push(nodeId);
    const s = sceneMap.get(nodeId);
    const choices = s && !isTerminal(s) && Array.isArray(s.choices) ? s.choices : [];
    for (const ch of choices) {
      const nextId = typeof ch?.nextSceneId === 'string' ? ch.nextSceneId.trim() : '';
      if (!nextId || !sceneMap.has(nextId)) continue;
      if (markReach) reachable.add(nextId);
      const st = color.get(nextId) ?? 0;
      if (st === 1) {
        issues.push({
          code: 'CYCLE_DETECTED',
          sceneId: nodeId,
          choiceId: ch?.id,
          message: `Phát hiện vòng lặp giữa các cảnh: ${[...stack, nextId].join(' -> ')}.`,
        });
      } else if (st === 0) {
        dfs(nextId, markReach);
      }
    }
    stack.pop();
    color.set(nodeId, 2);
  };

  if (startSceneId && sceneMap.has(startSceneId)) {
    dfs(startSceneId, true);
    for (const s of sceneMap.values()) {
      if (!reachable.has(s.id)) {
        issues.push({
          code: 'ORPHAN_SCENE',
          sceneId: s.id,
          message: `Cảnh "${s.title || s.id}" bị cô lập (không dẫn tới từ cảnh mở đầu).`,
        });
      }
    }
    if (terminalIds.filter((id) => reachable.has(id)).length === 0) {
      issues.push({
        code: 'NO_TERMINAL_SCENE',
        message: 'Tình huống chưa có cảnh kết thúc hợp lệ.',
      });
    }
  }

  return { valid: issues.length === 0, issues };
}

export function normalizeActivityConfigServer(
  kind: string,
  templateKey: string,
  rawConfig: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  const cfg = (rawConfig && typeof rawConfig === 'object' ? rawConfig : {}) as Record<string, any>;
  const tpl = (templateKey || cfg.templateKey || kind || '').toString().trim().toLowerCase();

  if (tpl === 'sorting') {
    const rawTargets = Array.isArray(cfg.targets)
      ? cfg.targets
      : Array.isArray(cfg.zones)
        ? cfg.zones
        : [];
    const targets = rawTargets.map((t: any, idx: number) => ({
      ...t,
      id: t?.id || `zone-${idx + 1}`,
      label: t?.label || `Vùng ${idx + 1}`,
      bounds: t?.bounds || {
        x: Math.min(0.05 + idx * 0.31, 0.65),
        y: 0.52,
        width: 0.28,
        height: 0.38,
      },
    }));

    const rawItems = Array.isArray(cfg.items)
      ? cfg.items
      : Array.isArray(cfg.objects)
        ? cfg.objects
        : [];
    const items = rawItems.map((it: any, idx: number) => {
      const acceptedTargetIds =
        Array.isArray(it?.acceptedTargetIds)
          ? it.acceptedTargetIds
          : it?.targetZoneId
            ? [it.targetZoneId]
            : [];
      return {
        ...it,
        id: it?.id || `obj-${idx + 1}`,
        label: it?.label || `Vật thể ${idx + 1}`,
        imageUrl: it?.imageUrl || '',
        acceptedTargetIds,
        targetZoneId: it?.targetZoneId || acceptedTargetIds[0] || '',
      };
    });

    return {
      ...cfg,
      templateKey: 'sorting',
      instructionText: cfg.instructionText || cfg.prompt || 'Đưa bạn nhỏ về đúng ngôi nhà nhé!',
      targets,
      zones: targets,
      items,
      objects: items,
    };
  }

  if (tpl === 'matching') {
    const rawPairs = Array.isArray(cfg.pairs) ? cfg.pairs : [];
    const pairs = rawPairs.map((p: any, idx: number) => {
      const id = p?.id || `pair-${idx + 1}`;
      const leftId = p?.left?.id || p?.leftId || `${id}-left`;
      const leftLabel = p?.leftLabel || p?.left?.label || `Hình ${idx + 1}`;
      const leftImageUrl =
        p?.leftImageUrl ?? p?.left?.imageUrl ?? '';
      const rightId = p?.right?.id || p?.rightId || `${id}-right`;
      const rightLabel = p?.rightLabel || p?.right?.label || `Đôi bạn ${idx + 1}`;
      const rightImageUrl = p?.rightImageUrl ?? p?.right?.imageUrl ?? '';
      return {
        ...p,
        id,
        leftId,
        leftLabel,
        leftImageUrl,
        rightId,
        rightLabel,
        rightImageUrl,
        left: {
          ...(p?.left || {}),
          id: leftId,
          label: leftLabel,
          imageUrl: leftImageUrl,
        },
        right: {
          ...(p?.right || {}),
          id: rightId,
          label: rightLabel,
          imageUrl: rightImageUrl,
        },
      };
    });

    return {
      ...cfg,
      templateKey: 'matching',
      instructionText:
        cfg.instructionText || cfg.prompt || 'Chạm chọn hai hình bạn sinh vật tương ứng nhé!',
      pairs,
    };
  }

  if (tpl === 'choice') {
    const rawQuestions = Array.isArray(cfg.questions) ? cfg.questions : [];
    const questions = rawQuestions.map((q: any, idx: number) => {
      const options = Array.isArray(q?.options)
        ? q.options.map((opt: any, oIdx: number) => ({
            ...opt,
            id: opt?.id || `opt-${oIdx + 1}`,
            label: opt?.label || `Lựa chọn ${oIdx + 1}`,
            imageUrl: opt?.imageUrl || '',
          }))
        : [];
      return {
        ...q,
        id: q?.id || `q-${idx + 1}`,
        promptText: q?.promptText || q?.prompt || `Câu hỏi ${idx + 1}`,
        prompt: q?.prompt || q?.promptText || `Câu hỏi ${idx + 1}`,
        options,
        correctOptionId: q?.correctOptionId || '',
      };
    });

    return {
      ...cfg,
      templateKey: 'choice',
      instructionText:
        cfg.instructionText ||
        questions[0]?.promptText ||
        'Nghe câu hỏi và chạm vào bức hình đúng nhé!',
      questions,
    };
  }

  if (tpl === 'scenario' || kind === 'scenario') {
    const rawScenes = Array.isArray(cfg.scenes) ? cfg.scenes : [];
    const scenes = rawScenes.map((s: any, idx: number) => {
      const terminal = Boolean(s?.isEnd || s?.isTerminal || s?.isEnding);
      const img =
        s?.imageUrl || s?.backgroundUrl || '/assets/generated/simulations/sim_bottle_beach.png';
      const choices = Array.isArray(s?.choices)
        ? s.choices.map((ch: any, cIdx: number) => {
            const isCorrect =
              ch?.isCorrect !== undefined
                ? Boolean(ch.isCorrect)
                : ch?.isPositive !== undefined
                  ? Boolean(ch.isPositive)
                  : cIdx === 0;
            return {
              ...ch,
              id: ch?.id || `choice-${cIdx + 1}`,
              label: ch?.label || `Lựa chọn ${cIdx + 1}`,
              imageUrl:
                ch?.imageUrl || '/assets/generated/r2-scenarios/choice_pickup_bottle_bin.jpg',
              nextSceneId: ch?.nextSceneId ?? null,
              isCorrect,
              isPositive: isCorrect,
            };
          })
        : [];
      return {
        ...s,
        id: s?.id || `scene-${idx + 1}`,
        title: s?.title || `Cảnh ${idx + 1}`,
        narrationText: s?.narrationText || s?.prompt || '',
        prompt: s?.prompt || s?.narrationText || '',
        imageUrl: img,
        backgroundUrl: img,
        isEnd: terminal,
        isTerminal: terminal,
        isEnding: terminal,
        choices,
      };
    });

    return {
      ...cfg,
      templateKey: 'scenario',
      startSceneId: cfg.startSceneId || scenes[0]?.id || '',
      scoringMode: cfg.scoringMode || (cfg.scoringEnabled === false ? 'none' : 'correct-choice'),
      scenes,
    };
  }

  return cfg;
}

@Injectable()
export class ActivitiesService {
  constructor(@Inject(DB_POOL) private readonly pool: pg.Pool) {}

  private mapActivityRow(row: any) {
    const kind = row.kind as 'game' | 'scenario' | 'simulation';
    const templateKey = row.template_key as string;
    return {
      id: row.id as string,
      ownerId: (row.owner_id as string) || null,
      isSeed: row.owner_id === null,
      kind,
      title: row.title as string,
      description: (row.description as string) || '',
      templateKey,
      config: normalizeActivityConfigServer(kind, templateKey, row.config || {}),
      schemaVersion: Number(row.schema_version || 1),
      coverMediaId: (row.cover_media_id as string) || null,
      narrationMediaId: (row.narration_media_id as string) || null,
      coverUrl:
        resolveMediaPublicUrl(row.cover_storage_key, row.cover_media_id) ||
        '/assets/generated/stations/station_hermit_crab.jpg',
      narrationUrl: resolveMediaPublicUrl(row.narration_storage_key, row.narration_media_id),
      visibility: row.visibility as 'seed' | 'draft' | 'published' | 'hidden',
      version: Number(row.version || 1),
      topicSlugs: Array.isArray(row.topic_slugs) ? row.topic_slugs.filter(Boolean) : [],
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  async listActivities(params: {
    isTeacher: boolean;
    teacherId?: string;
    kind?: string;
    groupId?: string;
    topicIds?: string[];
    q?: string;
    visibility?: string;
    source?: 'all' | 'owned' | 'seed';
    cursor?: string;
    limit?: number;
  }) {
    const limit = Math.min(Math.max(Number(params.limit) || 20, 1), 50);
    const decodedCursor = decodeCursor(params.cursor);

    const whereClauses: string[] = [];
    const values: unknown[] = [];
    const pushParam = (val: unknown) => {
      values.push(val);
      return `$${values.length}`;
    };

    if (!params.isTeacher) {
      whereClauses.push(`a.visibility = 'published'`);
    } else {
      const teacherParam = pushParam(params.teacherId);
      if (params.source === 'owned') {
        whereClauses.push(`a.owner_id = ${teacherParam}`);
      } else if (params.source === 'seed') {
        whereClauses.push(`a.owner_id IS NULL`);
      } else {
        whereClauses.push(
          `(a.owner_id = ${teacherParam} OR a.owner_id IS NULL OR a.visibility = 'published')`,
        );
      }
      if (params.visibility && params.visibility !== 'all') {
        const visParam = pushParam(params.visibility);
        whereClauses.push(`a.visibility = ${visParam}`);
      }
    }

    if (params.kind && params.kind !== 'all') {
      const k = params.kind.trim().toLowerCase();
      if (k === 'scenario_simulation' || k === 'scenarios') {
        const kp = pushParam(['scenario', 'simulation']);
        whereClauses.push(`a.kind = ANY(${kp}::text[])`);
      } else {
        const kp = pushParam(k);
        whereClauses.push(`a.kind = ${kp}`);
      }
    }

    if (params.topicIds && params.topicIds.length > 0) {
      const cleanTopics = params.topicIds.map((t) => t.trim()).filter(Boolean);
      if (cleanTopics.length > 0) {
        const topicParam = pushParam(cleanTopics);
        whereClauses.push(
          `EXISTS (
            SELECT 1 FROM activity_topics atp
            JOIN topics t ON t.id = atp.topic_id
            WHERE atp.activity_id = a.id
              AND (t.slug = ANY(${topicParam}::text[]) OR t.id::text = ANY(${topicParam}::text[]))
          )`,
        );
      }
    }

    if (params.q && params.q.trim()) {
      const qParam = pushParam(`%${params.q.trim()}%`);
      whereClauses.push(`(a.title ILIKE ${qParam} OR a.description ILIKE ${qParam})`);
    }

    if (params.groupId === 'unassigned' && params.isTeacher) {
      whereClauses.push('NOT EXISTS (SELECT 1 FROM interactive_group_members gm WHERE gm.activity_id=a.id)');
    } else if (params.groupId) {
      const group = pushParam(assertValidUuid(params.groupId, 'groupId'));
      const owner = params.isTeacher ? pushParam(params.teacherId) : null;
      whereClauses.push(`EXISTS (SELECT 1 FROM interactive_group_members gm JOIN interactive_groups g ON g.id=gm.group_id WHERE gm.activity_id=a.id AND g.id=${group} AND ${owner ? `(g.owner_id=${owner} OR g.owner_id IS NULL)` : "g.visibility='published'"})`);
    }
    const baseWhereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const countRes = await this.pool.query(
      `SELECT COUNT(*)::int AS total FROM activities a ${baseWhereSql}`,
      values,
    );
    const total = Number(countRes.rows[0]?.total || 0);

    const pageClauses = [...whereClauses];
    const pageValues = [...values];
    if (decodedCursor) {
      pageValues.push(decodedCursor.updatedAt);
      const tsIdx = `$${pageValues.length}`;
      pageValues.push(decodedCursor.id);
      const idIdx = `$${pageValues.length}`;
      pageClauses.push(`(a.updated_at, a.id) < (${tsIdx}::timestamptz, ${idIdx}::uuid)`);
    }

    pageValues.push(limit + 1);
    const limitIdx = `$${pageValues.length}`;
    const pageWhereSql = pageClauses.length > 0 ? `WHERE ${pageClauses.join(' AND ')}` : '';

    const itemsRes = await this.pool.query(
      `SELECT a.*,
              cm.storage_key AS cover_storage_key,
              nm.storage_key AS narration_storage_key,
              COALESCE(
                (SELECT array_agg(t.slug ORDER BY t.sort_order ASC)
                 FROM activity_topics atp
                 JOIN topics t ON t.id = atp.topic_id
                 WHERE atp.activity_id = a.id),
                ARRAY[]::text[]
              ) AS topic_slugs
       FROM activities a
       LEFT JOIN media_assets cm ON cm.id = a.cover_media_id
       LEFT JOIN media_assets nm ON nm.id = a.narration_media_id
       ${pageWhereSql}
       ORDER BY a.updated_at DESC, a.id DESC
       LIMIT ${limitIdx}`,
      pageValues,
    );

    const hasMore = itemsRes.rows.length > limit;
    const slice = hasMore ? itemsRes.rows.slice(0, limit) : itemsRes.rows;
    const items = slice.map((r) => this.mapActivityRow(r));
    const lastRow = slice[slice.length - 1];
    const nextCursor = hasMore && lastRow ? encodeCursor(lastRow.updated_at, lastRow.id) : null;

    return { items, nextCursor, total };
  }

  private async resolveActivityIdOrAlias(idOrAlias: string): Promise<string | null> {
    const trimmed = (idOrAlias || '').trim();
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed)) {
      return trimmed.toLowerCase();
    }
    const candidates = [trimmed, `activity:${trimmed}`];
    const mapRes = await this.pool.query(
      `SELECT target_id FROM seed_mappings
       WHERE target_type = 'activity' AND source_key = ANY($1::text[])
       LIMIT 1`,
      [candidates],
    );
    return (mapRes.rows[0]?.target_id as string) || null;
  }

  async getActivityById(idOrAlias: string, options: { isTeacher: boolean; teacherId?: string }) {
    const resolvedId = await this.resolveActivityIdOrAlias(idOrAlias);
    if (!resolvedId) {
      throw new AppError('ACTIVITY_NOT_FOUND', 'Không tìm thấy hoạt động tương tác này.', HttpStatus.NOT_FOUND);
    }

    const res = await this.pool.query(
      `SELECT a.*,
              cm.storage_key AS cover_storage_key,
              nm.storage_key AS narration_storage_key,
              COALESCE(
                (SELECT array_agg(t.slug ORDER BY t.sort_order ASC)
                 FROM activity_topics atp
                 JOIN topics t ON t.id = atp.topic_id
                 WHERE atp.activity_id = a.id),
                ARRAY[]::text[]
              ) AS topic_slugs
       FROM activities a
       LEFT JOIN media_assets cm ON cm.id = a.cover_media_id
       LEFT JOIN media_assets nm ON nm.id = a.narration_media_id
       WHERE a.id = $1`,
      [resolvedId],
    );

    if (res.rows.length === 0) {
      throw new AppError('ACTIVITY_NOT_FOUND', 'Không tìm thấy hoạt động tương tác này.', HttpStatus.NOT_FOUND);
    }

    const row = res.rows[0];
    if (!options.isTeacher && row.visibility !== 'published') {
      throw new AppError('ACTIVITY_NOT_FOUND', 'Hoạt động chưa được xuất bản.', HttpStatus.NOT_FOUND);
    }
    if (
      options.isTeacher &&
      row.visibility !== 'published' &&
      row.owner_id !== null &&
      row.owner_id !== options.teacherId
    ) {
      throw new AppError(
        'FORBIDDEN',
        'Bạn không có quyền truy cập bản nháp hoạt động của giáo viên khác.',
        HttpStatus.FORBIDDEN,
      );
    }

    const item = this.mapActivityRow(row);
    if (options.isTeacher && row.owner_id === options.teacherId && row.draft_content) {
      const draft = row.draft_content;
      const coverMediaId = draft.coverMediaId !== undefined ? draft.coverMediaId : item.coverMediaId;
      const cover = coverMediaId ? (await this.pool.query('SELECT storage_key FROM media_assets WHERE id=$1', [coverMediaId])).rows[0] : null;
      return { ...item, title: draft.title ?? item.title, description: draft.description ?? draft.summary ?? item.description,
        coverMediaId, coverUrl: resolveMediaPublicUrl(cover?.storage_key, coverMediaId) || item.coverUrl,
        config: draft.config ? normalizeActivityConfigServer(row.kind, row.template_key, draft.config) : item.config,
        topicSlugs: draft.topicSlugs ?? item.topicSlugs, hasWorkingCopy: true };
    }
    return { ...item, hasWorkingCopy: false };
  }

  private async syncActivityTopics(activityId: string, topicSlugs?: string[]) {
    if (!topicSlugs) return;
    await this.pool.query(`DELETE FROM activity_topics WHERE activity_id = $1`, [activityId]);
    if (topicSlugs.length === 0) return;

    const topicsRes = await this.pool.query(
      `SELECT id FROM topics WHERE slug = ANY($1::text[]) OR id::text = ANY($1::text[])`,
      [topicSlugs],
    );
    for (const t of topicsRes.rows) {
      await this.pool.query(
        `INSERT INTO activity_topics (activity_id, topic_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [activityId, t.id],
      );
    }
  }

  private assertValidActivityPayload(
    kind: string,
    templateKey: string,
    config: Record<string, unknown>,
  ) {
    if (kind === 'simulation') {
      throw new AppError(
        'SIMULATION_READONLY_RUNTIME',
        'Mô phỏng chuyên biệt là runtime có sẵn của hệ thống, chỉ hỗ trợ mở thử hoặc đưa vào phòng học.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (kind === 'scenario' || templateKey === 'scenario') {
      const validation = validateScenarioConfigServer(config || {});
      if (!validation.valid) {
        throw new AppError(
          'INVALID_SCENARIO_GRAPH',
          validation.issues[0]?.message || 'Cấu trúc nhánh tình huống không hợp lệ.',
          HttpStatus.BAD_REQUEST,
          { issues: validation.issues },
        );
      }
      return;
    }

    if (kind === 'game') {
      const allowedTemplates = ['sorting', 'matching', 'choice'];
      if (!allowedTemplates.includes(templateKey)) {
        throw new AppError(
          'INVALID_GAME_TEMPLATE',
          `Mẫu trò chơi "${templateKey}" không nằm trong danh mục hỗ trợ (sorting, matching, choice).`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return;
    }

    throw new AppError('INVALID_ACTIVITY_KIND', 'Loại hoạt động không hợp lệ.', HttpStatus.BAD_REQUEST);
  }

  private assertPublishableGame(templateKey: string, config: Record<string, unknown>) {
    const issues = validateGameForPublish(templateKey, config);
    if (issues.length) throw new AppError('INVALID_GAME_CONFIG', issues[0].message, HttpStatus.BAD_REQUEST, { issues });
  }

  async createTeacherActivity(
    teacherId: string,
    input: {
      kind: 'game' | 'scenario' | 'simulation';
      templateKey: string;
      title: string;
      description?: string;
      config?: Record<string, unknown>;
      coverMediaId?: string | null;
      narrationMediaId?: string | null;
      topicSlugs?: string[];
      visibility?: 'draft' | 'published' | 'hidden';
    },
  ) {
    const title = (input.title || '').trim();
    if (!title || title.length > 120) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Tên hoạt động phải từ 1 đến 120 ký tự.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const kind = input.kind || (input.templateKey === 'scenario' ? 'scenario' : 'game');
    const templateKey = (input.templateKey || (kind === 'scenario' ? 'scenario' : 'sorting')).trim();
    const config = normalizeActivityConfigServer(kind, templateKey, input.config || { templateKey });

    this.assertValidActivityPayload(kind, templateKey, config);

    const visibility = input.visibility || (input as any).status || 'draft';
    if (kind === 'game' && visibility === 'published') this.assertPublishableGame(templateKey, input.config || {});
    const res = await this.pool.query(
      `INSERT INTO activities (
        owner_id, kind, title, description, template_key, config, schema_version, visibility, version, cover_media_id, narration_media_id
      ) VALUES ($1, $2, $3, $4, $5, $6, 1, $7, 1, $8, $9)
      RETURNING id`,
      [
        teacherId,
        kind,
        title,
        (input.description || (input as any).summary || '').trim(),
        templateKey,
        JSON.stringify(config),
        visibility,
        input.coverMediaId || null,
        input.narrationMediaId || null,
      ],
    );

    const newId = res.rows[0].id as string;
    await this.syncActivityTopics(newId, input.topicSlugs || ['species']);

    return this.getActivityById(newId, { isTeacher: true, teacherId });
  }

  async updateTeacherActivity(
    teacherId: string,
    activityIdRaw: string,
    input: {
      title?: string;
      description?: string;
      templateKey?: string;
      config?: Record<string, unknown>;
      coverMediaId?: string | null;
      narrationMediaId?: string | null;
      topicSlugs?: string[];
      visibility?: 'draft' | 'published' | 'hidden';
      status?: 'draft' | 'published' | 'hidden';
      draftOnly?: boolean;
    },
  ) {
    const activityId = assertValidUuid(activityIdRaw, 'activityId');
    const existingRes = await this.pool.query(
      `SELECT id, owner_id, kind, title, description, template_key, config, visibility, cover_media_id, narration_media_id, draft_content
       FROM activities WHERE id = $1`,
      [activityId],
    );

    if (existingRes.rows.length === 0) {
      throw new AppError('ACTIVITY_NOT_FOUND', 'Không tìm thấy hoạt động.', HttpStatus.NOT_FOUND);
    }

    const existing = existingRes.rows[0];
    assertOwnerMatch(existing.owner_id, teacherId);

    if (input.draftOnly && existing.visibility !== 'draft') {
      const draft = { ...(existing.draft_content || {}), ...input };
      if (typeof draft.title === 'string' && (!draft.title.trim() || draft.title.length > 120)) throw new AppError('VALIDATION_ERROR', 'Tên hoạt động phải từ 1 đến 120 ký tự.');
      if (draft.templateKey && draft.templateKey !== existing.template_key) throw new AppError('INVALID_GAME_TEMPLATE', 'Không thể đổi mẫu của trò chơi hiện có.');
      await this.pool.query('UPDATE activities SET draft_content=$2, updated_at=NOW() WHERE id=$1', [activityId, JSON.stringify(draft)]);
      return this.getActivityById(activityId, { isTeacher: true, teacherId });
    }
    if ((input.visibility === 'published' || input.status === 'published') && existing.draft_content) input = { ...existing.draft_content, ...input, draftOnly: false };

    const nextTitle = input.title !== undefined ? input.title.trim() : existing.title;
    if (!nextTitle || nextTitle.length > 120) {
      throw new AppError('VALIDATION_ERROR', 'Tên hoạt động phải từ 1 đến 120 ký tự.', HttpStatus.BAD_REQUEST);
    }

    const nextTemplateKey = input.templateKey !== undefined ? input.templateKey.trim() : existing.template_key;
    const rawNextConfig = input.config !== undefined ? input.config : existing.config;
    const nextConfig = normalizeActivityConfigServer(existing.kind, nextTemplateKey, rawNextConfig);
    const nextVisibility = input.visibility ?? input.status ?? existing.visibility;
    const nextDescription = input.description !== undefined ? input.description.trim() : existing.description;
    const nextCoverMediaId = input.coverMediaId !== undefined ? input.coverMediaId : existing.cover_media_id;
    const nextNarrationMediaId =
      input.narrationMediaId !== undefined ? input.narrationMediaId : existing.narration_media_id;

    this.assertValidActivityPayload(existing.kind, nextTemplateKey, nextConfig);
    if (existing.kind === 'game' && nextVisibility === 'published') this.assertPublishableGame(nextTemplateKey, rawNextConfig);

    await this.pool.query(
      `UPDATE activities
       SET title = $2,
           description = $3,
           template_key = $4,
           config = $5,
           visibility = $6,
           cover_media_id = $7,
           narration_media_id = $8,
           draft_content = CASE WHEN $9 THEN NULL ELSE draft_content END,
           version = version + 1,
           updated_at = NOW()
       WHERE id = $1`,
      [
        activityId,
        nextTitle,
        nextDescription,
        nextTemplateKey,
        JSON.stringify(nextConfig),
        nextVisibility,
        nextCoverMediaId,
        nextNarrationMediaId,
        nextVisibility === 'published' || input.config !== undefined || input.title !== undefined || input.description !== undefined || input.templateKey !== undefined || input.coverMediaId !== undefined || input.narrationMediaId !== undefined || input.topicSlugs !== undefined,
      ],
    );

    if (input.topicSlugs !== undefined) {
      await this.syncActivityTopics(activityId, input.topicSlugs);
    }

    return this.getActivityById(activityId, { isTeacher: true, teacherId });
  }

  async duplicateActivityToDraft(teacherId: string, sourceIdRaw: string) {
    const source = await this.getActivityById(sourceIdRaw, { isTeacher: true, teacherId });
    if (source.kind === 'simulation') {
      throw new AppError(
        'SIMULATION_READONLY_RUNTIME',
        'Mô phỏng chuyên biệt không hỗ trợ nhân bản chỉnh sửa.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const copyTitle = source.title.endsWith('(Bản sao)')
      ? source.title
      : `${source.title} (Bản sao)`.slice(0, 120);

    const res = await this.pool.query(
      `INSERT INTO activities (
        owner_id, kind, title, description, template_key, config, schema_version, visibility, version, cover_media_id, narration_media_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft', 1, $8, $9)
      RETURNING id`,
      [
        teacherId,
        source.kind,
        copyTitle,
        source.description,
        source.templateKey,
        JSON.stringify(source.config || {}),
        source.schemaVersion || 1,
        source.coverMediaId,
        source.narrationMediaId,
      ],
    );

    const newId = res.rows[0].id as string;
    await this.syncActivityTopics(newId, source.topicSlugs);
    return this.getActivityById(newId, { isTeacher: true, teacherId });
  }

  async deleteDraftActivity(teacherId: string, activityIdRaw: string) {
    const activityId = assertValidUuid(activityIdRaw, 'activityId');
    const existingRes = await this.pool.query(
      `SELECT id, owner_id, visibility FROM activities WHERE id = $1`,
      [activityId],
    );
    if (existingRes.rows.length === 0) {
      throw new AppError('ACTIVITY_NOT_FOUND', 'Không tìm thấy hoạt động.', HttpStatus.NOT_FOUND);
    }
    const existing = existingRes.rows[0];
    assertOwnerMatch(existing.owner_id, teacherId);

    if (existing.visibility !== 'draft') {
      throw new AppError(
        'CANNOT_DELETE_PUBLISHED',
        'Chỉ được xóa bản nháp chưa xuất bản. Với hoạt động đang hiển thị, cô vui lòng chọn "Ẩn".',
        HttpStatus.CONFLICT,
      );
    }

    await this.pool.query(`DELETE FROM activities WHERE id = $1`, [activityId]);
    return { deleted: true, id: activityId };
  }
}
