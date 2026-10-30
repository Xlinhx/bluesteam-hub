import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import type pg from 'pg';
import { DB_POOL } from '../../database/database.module.js';
import { AppError } from '../../common/errors.js';
import { assertOwnerMatch } from '../../common/authorization.js';
import { assertValidUuid } from '../../common/validation.js';
import {
  decodeCursor,
  encodeCursor,
  resolveMediaPublicUrl,
} from '../resources/resources.service.js';

export function parseSketchfabUrl(rawInput: string): {
  provider: 'sketchfab';
  modelUid: string;
  canonicalUrl: string;
} {
  const input = (rawInput || '').trim();
  if (!input || input.includes('<') || input.includes('>') || /javascript:/i.test(input)) {
    throw new AppError(
      'INVALID_SKETCHFAB_URL',
      'Liên kết Sketchfab không hợp lệ (không chấp nhận mã nhúng HTML).',
      HttpStatus.BAD_REQUEST,
    );
  }

  // Allow direct 32-char hex UID only if explicitly formatted, or full https://sketchfab.com URL
  if (/^[a-f0-9]{32}$/i.test(input)) {
    const uid = input.toLowerCase();
    return {
      provider: 'sketchfab',
      modelUid: uid,
      canonicalUrl: `https://sketchfab.com/models/${uid}`,
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    throw new AppError(
      'INVALID_SKETCHFAB_URL',
      'Liên kết mô hình 3D không đúng định dạng URL.',
      HttpStatus.BAD_REQUEST,
    );
  }

  const host = parsed.hostname.toLowerCase();
  if (host !== 'sketchfab.com' && host !== 'www.sketchfab.com') {
    throw new AppError(
      'UNSUPPORTED_MODEL_PROVIDER',
      'Chỉ hỗ trợ liên kết mô hình 3D từ sketchfab.com.',
      HttpStatus.BAD_REQUEST,
    );
  }

  const pathname = parsed.pathname.replace(/\/+$/, '');
  const match =
    pathname.match(/\/3d-models\/(?:[a-z0-9-]+-)?([a-f0-9]{32})$/i) ||
    pathname.match(/\/models\/([a-f0-9]{32})(?:\/embed)?$/i);

  if (!match || !match[1]) {
    throw new AppError(
      'INVALID_SKETCHFAB_UID',
      'Không tìm thấy mã mô hình 32 ký tự hợp lệ trong đường dẫn Sketchfab.',
      HttpStatus.BAD_REQUEST,
    );
  }

  const modelUid = match[1].toLowerCase();
  return {
    provider: 'sketchfab',
    modelUid,
    canonicalUrl: `https://sketchfab.com/3d-models/${modelUid}`,
  };
}

@Injectable()
export class ModelsService {
  constructor(@Inject(DB_POOL) private readonly pool: pg.Pool) {}

  private mapModelRow(row: any) {
    const attribution = row.attribution || {};
    return {
      id: row.id as string,
      ownerId: (row.owner_id as string) || null,
      isSeed: row.owner_id === null,
      provider: 'sketchfab' as const,
      modelUid: row.model_uid as string,
      canonicalUrl: row.canonical_url as string,
      embedUrl: `https://sketchfab.com/models/${row.model_uid}/embed?autostart=1&ui_infos=0&ui_stop=0&ui_watermark=0`,
      title: row.title as string,
      description: (row.description as string) || '',
      coverMediaId: (row.cover_media_id as string) || null,
      narrationMediaId: (row.narration_media_id as string) || null,
      coverUrl:
        resolveMediaPublicUrl(row.cover_storage_key, row.cover_media_id) ||
        '/assets/generated/creatures/green_turtle_hero.jpg',
      narrationText: (attribution.narrationText as string) || '',
      attribution: {
        creator: (attribution.creator as string) || 'Sketchfab 3D Creator',
        license: (attribution.license as string) || 'Standard / CC-BY',
        sourceUrl: (attribution.sourceUrl as string) || (row.canonical_url as string),
      },
      visibility: row.visibility as string,
      version: Number(row.version || 1),
      topicSlugs: Array.isArray(row.topic_slugs) ? row.topic_slugs.filter(Boolean) : [],
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  async listModels(params: {
    isTeacher: boolean;
    teacherId?: string;
    groupId?: string;
    topicIds?: string[];
    q?: string;
    visibility?: string;
    source?: 'all' | 'owned' | 'seed';
    cursor?: string;
    limit?: number;
  }) {
    const limit = Math.min(Math.max(Number(params.limit) || (params.isTeacher ? 20 : 9), 1), 50);
    const decodedCursor = decodeCursor(params.cursor);

    const whereClauses: string[] = [];
    const values: unknown[] = [];
    const pushParam = (val: unknown) => {
      values.push(val);
      return `$${values.length}`;
    };

    if (!params.isTeacher) {
      whereClauses.push(`m.visibility = 'published'`);
    } else {
      const teacherParam = pushParam(params.teacherId);
      if (params.source === 'owned') {
        whereClauses.push(`m.owner_id = ${teacherParam}`);
      } else if (params.source === 'seed') {
        whereClauses.push(`m.owner_id IS NULL`);
      } else {
        whereClauses.push(`(m.owner_id = ${teacherParam} OR m.owner_id IS NULL OR m.visibility = 'published')`);
      }
      if (params.visibility && params.visibility !== 'all') {
        const visParam = pushParam(params.visibility);
        whereClauses.push(`m.visibility = ${visParam}`);
      }
    }

    if (params.topicIds && params.topicIds.length > 0) {
      const cleanTopics = params.topicIds.map((t) => t.trim()).filter(Boolean);
      if (cleanTopics.length > 0) {
        const topicParam = pushParam(cleanTopics);
        whereClauses.push(
          `EXISTS (
            SELECT 1 FROM model_topics mt
            JOIN topics t ON t.id = mt.topic_id
            WHERE mt.model_id = m.id
              AND (t.slug = ANY(${topicParam}::text[]) OR t.id::text = ANY(${topicParam}::text[]))
          )`,
        );
      }
    }

    if (params.q && params.q.trim()) {
      const qParam = pushParam(`%${params.q.trim()}%`);
      whereClauses.push(`(m.title ILIKE ${qParam} OR m.description ILIKE ${qParam})`);
    }

    if (params.groupId === 'unassigned' && params.isTeacher) {
      whereClauses.push('NOT EXISTS (SELECT 1 FROM interactive_group_members gm WHERE gm.model_id=m.id)');
    } else if (params.groupId) {
      const group = pushParam(assertValidUuid(params.groupId, 'groupId'));
      const owner = params.isTeacher ? pushParam(params.teacherId) : null;
      whereClauses.push(`EXISTS (SELECT 1 FROM interactive_group_members gm JOIN interactive_groups g ON g.id=gm.group_id WHERE gm.model_id=m.id AND g.id=${group} AND ${owner ? `(g.owner_id=${owner} OR g.owner_id IS NULL)` : "g.visibility='published'"})`);
    }
    const baseWhereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const countRes = await this.pool.query(
      `SELECT COUNT(*)::int AS total FROM models_3d m ${baseWhereSql}`,
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
      pageClauses.push(`(m.updated_at, m.id) < (${tsIdx}::timestamptz, ${idIdx}::uuid)`);
    }

    pageValues.push(limit + 1);
    const limitIdx = `$${pageValues.length}`;
    const pageWhereSql = pageClauses.length > 0 ? `WHERE ${pageClauses.join(' AND ')}` : '';

    const itemsRes = await this.pool.query(
      `SELECT m.*,
              cm.storage_key AS cover_storage_key,
              COALESCE(
                (SELECT array_agg(t.slug ORDER BY t.sort_order ASC)
                 FROM model_topics mt
                 JOIN topics t ON t.id = mt.topic_id
                 WHERE mt.model_id = m.id),
                ARRAY[]::text[]
              ) AS topic_slugs
       FROM models_3d m
       LEFT JOIN media_assets cm ON cm.id = m.cover_media_id
       ${pageWhereSql}
       ORDER BY m.updated_at DESC, m.id DESC
       LIMIT ${limitIdx}`,
      pageValues,
    );

    const hasMore = itemsRes.rows.length > limit;
    const slice = hasMore ? itemsRes.rows.slice(0, limit) : itemsRes.rows;
    const items = slice.map((r) => this.mapModelRow(r));
    const lastRow = slice[slice.length - 1];
    const nextCursor =
      hasMore && lastRow ? encodeCursor(lastRow.updated_at, lastRow.id) : null;

    return {
      items,
      nextCursor,
      total,
    };
  }

  private async resolveModelIdOrAlias(idOrAlias: string): Promise<string | null> {
    const trimmed = (idOrAlias || '').trim();
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed)) {
      return trimmed.toLowerCase();
    }
    const candidateKeys = [trimmed, `model:${trimmed}`, `model:turtle`];
    const mapRes = await this.pool.query(
      `SELECT target_id FROM seed_mappings
       WHERE target_type = 'model3d' AND source_key = ANY($1::text[])
       ORDER BY CASE WHEN source_key = $2 THEN 0 ELSE 1 END
       LIMIT 1`,
      [candidateKeys.slice(0, 2), `model:${trimmed}`],
    );
    if (mapRes.rows.length > 0) {
      return mapRes.rows[0].target_id as string;
    }
    const uidRes = await this.pool.query(
      `SELECT id FROM models_3d WHERE model_uid = $1 LIMIT 1`,
      [trimmed],
    );
    return (uidRes.rows[0]?.id as string) || null;
  }

  async getModelById(idOrAlias: string, options: { isTeacher: boolean; teacherId?: string }) {
    const resolvedId = await this.resolveModelIdOrAlias(idOrAlias);
    if (!resolvedId) {
      throw new AppError('MODEL_NOT_FOUND', 'Không tìm thấy mô hình 3D này.', HttpStatus.NOT_FOUND);
    }

    const res = await this.pool.query(
      `SELECT m.*,
              cm.storage_key AS cover_storage_key,
              COALESCE(
                (SELECT array_agg(t.slug ORDER BY t.sort_order ASC)
                 FROM model_topics mt
                 JOIN topics t ON t.id = mt.topic_id
                 WHERE mt.model_id = m.id),
                ARRAY[]::text[]
              ) AS topic_slugs
       FROM models_3d m
       LEFT JOIN media_assets cm ON cm.id = m.cover_media_id
       WHERE m.id = $1`,
      [resolvedId],
    );

    if (res.rows.length === 0) {
      throw new AppError('MODEL_NOT_FOUND', 'Không tìm thấy mô hình 3D này.', HttpStatus.NOT_FOUND);
    }

    const row = res.rows[0];
    if (!options.isTeacher && row.visibility !== 'published') {
      throw new AppError('MODEL_NOT_FOUND', 'Mô hình 3D hiện không khả dụng.', HttpStatus.NOT_FOUND);
    }
    if (
      options.isTeacher &&
      row.visibility !== 'published' &&
      row.owner_id !== null &&
      row.owner_id !== options.teacherId
    ) {
      throw new AppError('FORBIDDEN', 'Bạn không có quyền truy cập mô hình nháp này.', HttpStatus.FORBIDDEN);
    }

    const base = this.mapModelRow(row);
    const othersRes = await this.pool.query(
      `SELECT m.*,
              cm.storage_key AS cover_storage_key,
              ARRAY[]::text[] AS topic_slugs
       FROM models_3d m
       LEFT JOIN media_assets cm ON cm.id = m.cover_media_id
       WHERE m.id <> $1 AND m.visibility = 'published'
       ORDER BY m.updated_at DESC
       LIMIT 3`,
      [resolvedId],
    );

    return {
      ...base,
      relatedModels: othersRes.rows.map((r) => this.mapModelRow(r)),
    };
  }

  private async syncModelTopics(modelId: string, topicSlugs?: string[]) {
    if (!topicSlugs) return;
    await this.pool.query(`DELETE FROM model_topics WHERE model_id = $1`, [modelId]);
    if (topicSlugs.length === 0) return;

    const topicsRes = await this.pool.query(
      `SELECT id FROM topics WHERE slug = ANY($1::text[]) OR id::text = ANY($1::text[])`,
      [topicSlugs],
    );
    for (const t of topicsRes.rows) {
      await this.pool.query(
        `INSERT INTO model_topics (model_id, topic_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [modelId, t.id],
      );
    }
  }

  async createTeacherModel(
    teacherId: string,
    input: {
      title: string;
      sketchfabUrl?: string;
      canonicalUrl?: string;
      description?: string;
      coverMediaId?: string | null;
      narrationText?: string;
      attribution?: Record<string, unknown>;
      topicSlugs?: string[];
      visibility?: 'draft' | 'published' | 'hidden';
      viewerVerified?: boolean;
    },
  ) {
    const title = (input.title || '').trim();
    if (!title || title.length > 100) {
      throw new AppError('VALIDATION_ERROR', 'Tên mô hình phải từ 1 đến 100 ký tự.', HttpStatus.BAD_REQUEST);
    }

    const parsedUrl = parseSketchfabUrl(input.sketchfabUrl || input.canonicalUrl || '');
    const visibility = input.visibility || 'draft';

    const attribution = {
      creator: (input.attribution?.creator as string) || 'Sketchfab 3D Creator',
      license: (input.attribution?.license as string) || 'Standard / CC-BY',
      sourceUrl: parsedUrl.canonicalUrl,
      narrationText: (input.narrationText || '').trim(),
    };

    const res = await this.pool.query(
      `INSERT INTO models_3d (
         owner_id, provider, model_uid, canonical_url, title, description, cover_media_id, visibility, version, attribution
       )
       VALUES ($1, 'sketchfab', $2, $3, $4, $5, $6, $7, 1, $8)
       RETURNING id`,
      [
        teacherId,
        parsedUrl.modelUid,
        parsedUrl.canonicalUrl,
        title,
        (input.description || '').trim(),
        input.coverMediaId || null,
        visibility,
        JSON.stringify(attribution),
      ],
    );

    const newId = res.rows[0].id as string;
    await this.syncModelTopics(newId, input.topicSlugs || ['species']);
    return this.getModelById(newId, { isTeacher: true, teacherId });
  }

  async updateTeacherModel(
    teacherId: string,
    modelIdRaw: string,
    input: {
      title?: string;
      sketchfabUrl?: string;
      canonicalUrl?: string;
      description?: string;
      coverMediaId?: string | null;
      narrationText?: string;
      attribution?: Record<string, unknown>;
      topicSlugs?: string[];
      visibility?: 'draft' | 'published' | 'hidden';
    },
  ) {
    const modelId = assertValidUuid(modelIdRaw, 'modelId');
    const existingRes = await this.pool.query(
      `SELECT * FROM models_3d WHERE id = $1`,
      [modelId],
    );
    if (existingRes.rows.length === 0) {
      throw new AppError('MODEL_NOT_FOUND', 'Không tìm thấy mô hình 3D.', HttpStatus.NOT_FOUND);
    }
    const existing = existingRes.rows[0];
    assertOwnerMatch(existing.owner_id, teacherId);

    const nextTitle = input.title !== undefined ? input.title.trim() : existing.title;
    if (!nextTitle || nextTitle.length > 100) {
      throw new AppError('VALIDATION_ERROR', 'Tên mô hình phải từ 1 đến 100 ký tự.', HttpStatus.BAD_REQUEST);
    }

    let modelUid = existing.model_uid as string;
    let canonicalUrl = existing.canonical_url as string;
    if (input.sketchfabUrl || input.canonicalUrl) {
      const parsed = parseSketchfabUrl(input.sketchfabUrl || input.canonicalUrl || '');
      modelUid = parsed.modelUid;
      canonicalUrl = parsed.canonicalUrl;
    }

    const nextAttribution = {
      ...(existing.attribution || {}),
      ...(input.attribution || {}),
      narrationText:
        input.narrationText !== undefined
          ? input.narrationText.trim()
          : existing.attribution?.narrationText || '',
    };

    await this.pool.query(
      `UPDATE models_3d
       SET model_uid = $2,
           canonical_url = $3,
           title = $4,
           description = $5,
           cover_media_id = $6,
           visibility = $7,
           attribution = $8,
           version = version + 1,
           updated_at = NOW()
       WHERE id = $1`,
      [
        modelId,
        modelUid,
        canonicalUrl,
        nextTitle,
        input.description !== undefined ? input.description.trim() : existing.description,
        input.coverMediaId !== undefined ? input.coverMediaId : existing.cover_media_id,
        input.visibility ?? existing.visibility,
        JSON.stringify(nextAttribution),
      ],
    );

    if (input.topicSlugs !== undefined) {
      await this.syncModelTopics(modelId, input.topicSlugs);
    }

    return this.getModelById(modelId, { isTeacher: true, teacherId });
  }

  async duplicateModelToDraft(teacherId: string, sourceIdRaw: string) {
    const sourceId = assertValidUuid(sourceIdRaw, 'modelId');
    const source = await this.getModelById(sourceId, { isTeacher: true, teacherId });
    const copyTitle = `${source.title} (Bản sao)`.slice(0, 100);

    const res = await this.pool.query(
      `INSERT INTO models_3d (
         owner_id, provider, model_uid, canonical_url, title, description, cover_media_id, visibility, version, attribution
       )
       VALUES ($1, 'sketchfab', $2, $3, $4, $5, $6, 'draft', 1, $7)
       RETURNING id`,
      [
        teacherId,
        source.modelUid,
        source.canonicalUrl,
        copyTitle,
        source.description,
        source.coverMediaId,
        JSON.stringify({
          ...source.attribution,
          narrationText: source.narrationText,
        }),
      ],
    );

    const newId = res.rows[0].id as string;
    await this.syncModelTopics(newId, source.topicSlugs);
    return this.getModelById(newId, { isTeacher: true, teacherId });
  }

  async deleteDraftModel(teacherId: string, modelIdRaw: string) {
    const modelId = assertValidUuid(modelIdRaw, 'modelId');
    const existingRes = await this.pool.query(
      `SELECT id, owner_id, visibility FROM models_3d WHERE id = $1`,
      [modelId],
    );
    if (existingRes.rows.length === 0) {
      throw new AppError('MODEL_NOT_FOUND', 'Không tìm thấy mô hình 3D.', HttpStatus.NOT_FOUND);
    }
    const existing = existingRes.rows[0];
    assertOwnerMatch(existing.owner_id, teacherId);

    if (existing.visibility !== 'draft') {
      throw new AppError(
        'CANNOT_DELETE_PUBLISHED',
        'Chỉ được xóa bản nháp chưa xuất bản. Với mô hình đang hiển thị, cô vui lòng chọn "Ẩn".',
        HttpStatus.CONFLICT,
      );
    }

    await this.pool.query(`DELETE FROM models_3d WHERE id = $1`, [modelId]);
    return { deleted: true, id: modelId };
  }
}
