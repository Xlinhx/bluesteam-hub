import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import type pg from 'pg';
import { DB_POOL } from '../../database/database.module.js';
import { AppError } from '../../common/errors.js';
import { assertOwnerMatch } from '../../common/authorization.js';
import { assertValidUuid } from '../../common/validation.js';
import { withTransaction } from '../../database/pool.js';
import { parseResourceInput } from './resource-input.js';
import { readableResourceGroup } from './resource-group-access.js';
import { visibleAsGroupEntry, visibleInResourceLibrary } from './resource-library-visibility.js';

export function encodeCursor(updatedAt: Date | string, id: string): string {
  // PostgreSQL timestamps carry microseconds; Date truncates them to milliseconds.
  const iso = typeof updatedAt === 'string' ? updatedAt : updatedAt.toISOString();
  return Buffer.from(`${iso}|${id}`, 'utf8').toString('base64url');
}

export function decodeCursor(cursor?: string | null): { updatedAt: string; id: string } | null {
  if (!cursor) return null;
  try {
    const raw = Buffer.from(cursor, 'base64url').toString('utf8');
    const [updatedAt, id] = raw.split('|');
    if (!updatedAt || !id || Number.isNaN(new Date(updatedAt).getTime())) {
      return null;
    }
    assertValidUuid(id, 'cursorId');
    return { updatedAt, id };
  } catch {
    throw new AppError('INVALID_CURSOR', 'Con trỏ phân trang không hợp lệ.', HttpStatus.BAD_REQUEST);
  }
}

export function resolveMediaPublicUrl(
  storageKey: string | null | undefined,
  mediaId: string | null | undefined,
): string | null {
  if (!storageKey && !mediaId) return null;
  if (storageKey && storageKey.startsWith('/assets/')) {
    return storageKey;
  }
  if (mediaId) {
    return `/api/v1/media/${mediaId}`;
  }
  return storageKey || null;
}

function expandKindFilter(kind?: string): string[] | null {
  if (!kind || kind === 'all') return null;
  const k = kind.trim().toLowerCase();
  if (k === 'supported') return ['flashcard','card','image','audio','video','coloring','worksheet','poster'];
  if (k === 'card' || k === 'flashcard') return ['flashcard', 'card'];
  if (k === 'visual') return ['flashcard', 'card', 'image'];
  if (k === 'print' || k === 'printable') return ['coloring', 'worksheet', 'poster', 'print'];
  return [k];
}

@Injectable()
export class ResourcesService {
  constructor(@Inject(DB_POOL) private readonly pool: pg.Pool) {}

  private mapResourceRow(row: any) {
    return {
      id: row.id as string,
      ownerId: (row.owner_id as string) || null,
      isSeed: row.owner_id === null,
      kind: row.kind === 'card' ? 'flashcard' : (row.kind as string),
      title: row.title as string,
      description: (row.description as string) || '',
      coverMediaId: (row.cover_media_id as string) || null,
      mediaId: (row.media_id as string) || null,
      coverUrl: resolveMediaPublicUrl(row.cover_storage_key, row.cover_media_id),
      mediaUrl: resolveMediaPublicUrl(row.media_storage_key, row.media_id),
      mediaMimeType: row.media_mime_type || null,
      content: row.content || {},
      visibility: row.visibility as string,
      version: Number(row.version || 1),
      topicSlugs: Array.isArray(row.topic_slugs) ? row.topic_slugs.filter(Boolean) : [],
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  async listResources(params: {
    isTeacher: boolean;
    library?: boolean;
    capability?:'screen'|'print'|'all';
    teacherId?: string;
    groupId?: string;
    membershipGroupId?: string;
    kind?: string;
    topicIds?: string[];
    q?: string;
    savedIds?: string[];
    visibility?: string;
    source?: 'all' | 'owned' | 'seed';
    cursor?: string;
    before?: string;
    page?: number;
    limit?: number;
  }) {
    if(params.visibility && !['all','published','hidden'].includes(params.visibility))throw new AppError('INVALID_VISIBILITY','Chọn Đang hiện hoặc Đã ẩn.');
    const limit = Math.trunc(Math.min(Math.max(Number(params.limit) || (params.isTeacher ? 20 : 12), 1), 50));
    const page = params.page;
    if (page !== undefined && (!Number.isSafeInteger(page) || page < 1 || page > 999_999_999)) {
      throw new AppError('INVALID_PAGE', 'Số trang không hợp lệ.');
    }
    const before = page === undefined ? decodeCursor(params.before) : null;
    const decodedCursor = page === undefined ? before || decodeCursor(params.cursor) : null;

    const whereClauses: string[] = [];
    const values: unknown[] = [];
    const pushParam = (val: unknown) => {
      values.push(val);
      return `$${values.length}`;
    };

    if (!params.isTeacher) {
      whereClauses.push(`r.visibility = 'published'`);
      if (params.library) whereClauses.push(visibleInResourceLibrary);
    } else {
      const teacherParam = pushParam(params.teacherId);
      if (params.source === 'owned') {
        whereClauses.push(`r.owner_id = ${teacherParam}`);
      } else if (params.source === 'seed') {
        whereClauses.push(`r.owner_id IS NULL`);
      } else {
        whereClauses.push(`(r.owner_id = ${teacherParam} OR r.owner_id IS NULL OR r.visibility = 'published')`);
      }
      if (params.visibility && params.visibility !== 'all') {
        const visParam = pushParam(params.visibility);
        whereClauses.push(`r.visibility = ${visParam}`);
      }
    }

    const downloadable = params.kind === 'download';
    const kinds = downloadable ? null : expandKindFilter(params.kind);
    if (params.groupId === 'unassigned' && params.isTeacher) {
      const teacher = pushParam(params.teacherId);
      whereClauses.push(`NOT EXISTS (SELECT 1 FROM resource_group_members gm JOIN resource_groups g ON g.id=gm.group_id WHERE gm.resource_id=r.id AND ${readableResourceGroup(teacher)})`);
    } else if (params.groupId) {
      const group = pushParam(assertValidUuid(params.groupId, 'groupId'));
      const groupAccess = readableResourceGroup(params.isTeacher ? pushParam(params.teacherId) : undefined);
      whereClauses.push(`EXISTS (SELECT 1 FROM resource_group_members gm JOIN resource_groups g ON g.id=gm.group_id WHERE gm.resource_id=r.id AND g.id=${group} AND ${groupAccess})`);
      // A teacher-authored flashcard link makes that card the entry point for
      // its variants. Explicit media filters, search and saved items stay exact.
      if (!params.isTeacher && (!params.kind || ['all','visual'].includes(params.kind)) && !params.q?.trim() && params.savedIds === undefined) {
        whereClauses.push(visibleAsGroupEntry(group));
      }
    }
    if (kinds && kinds.length > 0) {
      const kindParam = pushParam(kinds);
      whereClauses.push(`r.kind = ANY(${kindParam}::text[])`);
    }
    if (downloadable) {
      whereClauses.push(`(coalesce(r.content->>'downloadUrl','')<>'' OR EXISTS (
        SELECT 1 FROM media_assets media WHERE media.id=r.media_id
        AND (media.kind='pdf' OR r.kind IN ('coloring','worksheet','poster','print'))
      ))`);
    }

    if (params.topicIds && params.topicIds.length > 0) {
      const cleanTopics = params.topicIds.map((t) => t.trim()).filter(Boolean);
      if (cleanTopics.length > 0) {
        const topicParam = pushParam(cleanTopics);
        whereClauses.push(
          `EXISTS (
            SELECT 1 FROM resource_topics rt
            JOIN topics t ON t.id = rt.topic_id
            WHERE rt.resource_id = r.id
              AND (t.slug = ANY(${topicParam}::text[]) OR t.id::text = ANY(${topicParam}::text[]))
          )`,
        );
      }
    }

    if (params.q && params.q.trim()) {
      const qParam = pushParam(`%${params.q.trim()}%`);
      whereClauses.push(`(r.title ILIKE ${qParam} OR r.description ILIKE ${qParam})`);
    }

    if (params.savedIds !== undefined) {
      const validUuids = params.savedIds.filter((id) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id),
      );
      if (validUuids.length === 0) {
        return { items: [], nextCursor: null, total: 0 };
      }
      const savedParam = pushParam(validUuids);
      whereClauses.push(`r.id = ANY(${savedParam}::uuid[])`);
    }

    if(params.capability==='screen')whereClauses.push("coalesce(r.content->>'drawingTemplateKey','')<>''");
    if(params.capability==='print')whereClauses.push("(r.media_id IS NOT NULL OR coalesce(r.content->>'svgTemplate','')<>'')");
    const baseWhereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // 1. Total count with identical predicate (excluding cursor)
    const countRes = await this.pool.query(
      `SELECT COUNT(*)::int AS total FROM resources r ${baseWhereSql}`,
      values,
    );
    const total = Number(countRes.rows[0]?.total || 0);
    const offset = page === undefined ? 0 : (page - 1) * limit;
    if (page !== undefined && offset >= total) return { items: [], nextCursor: null, total };

    // 2. Cursor pagination
    const pageClauses = [...whereClauses];
    const pageValues = [...values];
    if (decodedCursor) {
      pageValues.push(decodedCursor.updatedAt);
      const tsIdx = `$${pageValues.length}`;
      pageValues.push(decodedCursor.id);
      const idIdx = `$${pageValues.length}`;
      pageClauses.push(`(r.updated_at, r.id) ${before ? '>' : '<'} (${tsIdx}::timestamptz, ${idIdx}::uuid)`);
    }

    pageValues.push(limit + 1);
    const limitIdx = `$${pageValues.length}`;
    const offsetSql = offset ? `OFFSET $${pageValues.push(offset)}` : '';
    const pageWhereSql = pageClauses.length > 0 ? `WHERE ${pageClauses.join(' AND ')}` : '';

    const itemsRes = await this.pool.query(
      `SELECT r.*, r.updated_at::text AS cursor_updated_at,
              cm.storage_key AS cover_storage_key,
              mm.storage_key AS media_storage_key, mm.mime_type AS media_mime_type,
              COALESCE(
                (SELECT array_agg(t.slug ORDER BY t.sort_order ASC)
                 FROM resource_topics rt
                 JOIN topics t ON t.id = rt.topic_id
                 WHERE rt.resource_id = r.id),
                ARRAY[]::text[]
              ) AS topic_slugs
       FROM resources r
       LEFT JOIN media_assets cm ON cm.id = r.cover_media_id
       LEFT JOIN media_assets mm ON mm.id = r.media_id
       ${pageWhereSql}
       ORDER BY r.updated_at ${before ? 'ASC' : 'DESC'}, r.id ${before ? 'ASC' : 'DESC'}
       LIMIT ${limitIdx} ${offsetSql}`,
      pageValues,
    );

    const hasMore = itemsRes.rows.length > limit;
    const slice = itemsRes.rows.slice(0, limit);
    if (before) slice.reverse();
    const items = slice.map((r) => this.mapResourceRow(r));
    if (params.isTeacher && params.membershipGroupId) {
      const members = await this.pool.query(`SELECT gm.resource_id FROM resource_group_members gm JOIN resource_groups g ON g.id=gm.group_id
        WHERE g.id=$1 AND gm.resource_id=ANY($2::uuid[]) AND ${readableResourceGroup('$3')}`,
        [assertValidUuid(params.membershipGroupId,'membershipGroupId'),items.map(r=>r.id),params.teacherId]);
      const ids = new Set(members.rows.map(row=>row.resource_id));
      for (const item of items) Object.assign(item,{isGroupMember:ids.has(item.id)});
    }
    const lastRow = slice[slice.length - 1];
    const firstRow = slice[0];
    const nextCursor =
      (before || hasMore) && lastRow ? encodeCursor(lastRow.cursor_updated_at, lastRow.id) : null;
    const previousCursor =
      (before ? hasMore : decodedCursor) && firstRow ? encodeCursor(firstRow.cursor_updated_at, firstRow.id) : null;

    return {
      items,
      nextCursor,
      previousCursor,
      total,
    };
  }

  private async resolveResourceIdOrAlias(idOrAlias: string): Promise<string | null> {
    const trimmed = (idOrAlias || '').trim();
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed)) {
      return trimmed.toLowerCase();
    }
    const candidateKeys = [
      trimmed,
      `resource:${trimmed}`,
      `resource:${trimmed}-flashcard`,
    ];
    const mapRes = await this.pool.query(
      `SELECT target_id FROM seed_mappings
       WHERE target_type = 'resource' AND source_key = ANY($1::text[])
       LIMIT 1`,
      [candidateKeys],
    );
    return (mapRes.rows[0]?.target_id as string) || null;
  }

  async getResourceById(idOrAlias: string, options: { isTeacher: boolean; teacherId?: string }) {
    const resolvedId = await this.resolveResourceIdOrAlias(idOrAlias);
    if (!resolvedId) {
      throw new AppError('RESOURCE_NOT_FOUND', 'Không tìm thấy học liệu này.', HttpStatus.NOT_FOUND);
    }

    const res = await this.pool.query(
      `SELECT r.*,
              cm.storage_key AS cover_storage_key,
              mm.storage_key AS media_storage_key, mm.mime_type AS media_mime_type,
              COALESCE(
                (SELECT array_agg(t.slug ORDER BY t.sort_order ASC)
                 FROM resource_topics rt
                 JOIN topics t ON t.id = rt.topic_id
                 WHERE rt.resource_id = r.id),
                ARRAY[]::text[]
              ) AS topic_slugs
       FROM resources r
       LEFT JOIN media_assets cm ON cm.id = r.cover_media_id
       LEFT JOIN media_assets mm ON mm.id = r.media_id
       WHERE r.id = $1`,
      [resolvedId],
    );

    if (res.rows.length === 0) {
      throw new AppError('RESOURCE_NOT_FOUND', 'Không tìm thấy học liệu này.', HttpStatus.NOT_FOUND);
    }

    const row = res.rows[0];
    if (!options.isTeacher && row.visibility !== 'published') {
      throw new AppError('RESOURCE_NOT_FOUND', 'Học liệu không khả dụng.', HttpStatus.NOT_FOUND);
    }
    if (
      options.isTeacher &&
      row.visibility !== 'published' &&
      row.owner_id !== null &&
      row.owner_id !== options.teacherId
    ) {
      throw new AppError('FORBIDDEN', 'Bạn không có quyền xem học liệu ẩn của giáo viên khác.', HttpStatus.FORBIDDEN);
    }

    const base = this.mapResourceRow(row);

    // Fetch existing linked variants
    const variantsRes = await this.pool.query(
      `SELECT r.id, r.kind, r.title, r.visibility, r.content, rl.source_resource_id,
              cm.storage_key AS cover_storage_key, r.cover_media_id
       FROM resource_links rl
       JOIN resources r ON (r.id = rl.target_resource_id OR r.id = rl.source_resource_id)
       LEFT JOIN media_assets cm ON cm.id = r.cover_media_id
       WHERE (rl.source_resource_id = $1 OR rl.target_resource_id = $1)
         AND r.id <> $1
         AND (r.visibility = 'published' OR ($2::uuid IS NOT NULL AND (r.owner_id=$2 OR r.owner_id IS NULL)))
       ORDER BY rl.sort_order ASC, r.created_at ASC`,
      [resolvedId, options.isTeacher ? options.teacherId : null],
    );

    const seenVariantIds = new Set<string>();
    const variants = [];
    for (const v of variantsRes.rows) {
      if (seenVariantIds.has(v.id)) continue;
      seenVariantIds.add(v.id);
      variants.push({
        id: v.id as string,
        kind: v.kind === 'card' ? 'flashcard' : (v.kind as string),
        title: v.title as string,
        visibility: v.visibility as string,
        coverUrl: resolveMediaPublicUrl(v.cover_storage_key, v.cover_media_id),
        drawingTemplateKey: v.content?.drawingTemplateKey || null,
      });
    }

    // Fetch up to 3 related published resources by topic
    const relatedRes = await this.pool.query(
      `SELECT DISTINCT ON (r.updated_at, r.id)
              r.id, r.kind, r.title, r.description,
              cm.storage_key AS cover_storage_key, r.cover_media_id
       FROM resources r
       JOIN resource_topics rt ON rt.resource_id = r.id
       JOIN topics t ON t.id = rt.topic_id
       LEFT JOIN media_assets cm ON cm.id = r.cover_media_id
       WHERE r.id <> $1
         AND r.visibility = 'published'
         AND t.slug = ANY($2::text[])
       ORDER BY r.updated_at DESC, r.id DESC
       LIMIT 3`,
      [resolvedId, base.topicSlugs.length > 0 || base.content.sourcePdfUrl ? base.topicSlugs : ['species']],
    );

    const related = relatedRes.rows.map((rel) => ({
      id: rel.id as string,
      kind: rel.kind === 'card' ? 'flashcard' : (rel.kind as string),
      title: rel.title as string,
      description: (rel.description as string) || '',
      coverUrl: resolveMediaPublicUrl(rel.cover_storage_key, rel.cover_media_id),
    }));

    const groups = await this.pool.query(`SELECT g.id,g.title,(g.owner_id IS NULL) AS "isSeed",coalesce(g.owner_id=$2,false) AS "canEdit" FROM resource_groups g
      JOIN resource_group_members gm ON gm.group_id=g.id WHERE gm.resource_id=$1
      AND ${readableResourceGroup('$2')}
      ORDER BY g.sort_order,g.title,g.id`, [resolvedId,options.isTeacher ? options.teacherId : null]);
    return {
      ...base,
      groups: groups.rows,
      editableVariantIds: [...new Set(variantsRes.rows.filter(v=>v.source_resource_id===resolvedId).map(v=>v.id as string))],
      variants,
      related,
    };
  }

  private async syncResourceTopics(resourceId: string, topicSlugs?: string[]) {
    if (!topicSlugs) return;
    await this.pool.query(`DELETE FROM resource_topics WHERE resource_id = $1`, [resourceId]);
    if (topicSlugs.length === 0) return;

    const topicsRes = await this.pool.query(
      `SELECT id FROM topics WHERE slug = ANY($1::text[]) OR id::text = ANY($1::text[])`,
      [topicSlugs],
    );
    for (const t of topicsRes.rows) {
      await this.pool.query(
        `INSERT INTO resource_topics (resource_id, topic_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [resourceId, t.id],
      );
    }
  }

  async createTeacherResource(teacherId: string, input: Parameters<ResourcesService['createResourceRecord']>[1]) {
    input = parseResourceInput(input);
    return withTransaction(this.pool, client => new ResourcesService(client as unknown as pg.Pool).createResourceRecord(teacherId, input));
  }

  private async syncLinks(teacherId: string, resourceId: string, rawIds: string[]) {
    if (!Array.isArray(rawIds) || rawIds.length > 100) throw new AppError('INVALID_LINKS', 'Tối đa 100 học liệu liên kết.');
    const ids = [...new Set(rawIds.map(id => assertValidUuid(id, 'linkedResourceId')))];
    if (ids.includes(resourceId)) throw new AppError('INVALID_LINKS', 'Không thể liên kết học liệu với chính nó.');
    const available = await this.pool.query(`SELECT id FROM resources WHERE id=ANY($1::uuid[]) AND (owner_id=$2 OR owner_id IS NULL OR visibility='published')`, [ids,teacherId]);
    if (available.rows.length !== ids.length) throw new AppError('INVALID_LINKS', 'Có học liệu liên kết không khả dụng.');
    // Incoming links belong to their source author. Editing a shared target
    // must not remove another teacher's authored relationships.
    await this.pool.query('DELETE FROM resource_links WHERE source_resource_id=$1', [resourceId]);
    for (const [order, id] of ids.entries()) {
      await this.pool.query(`INSERT INTO resource_links(source_resource_id,target_resource_id,sort_order) VALUES($1,$2,$3)`, [resourceId,id,order]);
    }
  }

  private async validateMedia(teacherId: string, input: { coverMediaId?: string | null; mediaId?: string | null }, resourceId?: string) {
    for (const [field,id] of Object.entries(input).filter(([key]) => key === 'coverMediaId' || key === 'mediaId')) {
      if (!id) continue;
      assertValidUuid(id, field);
      const result = await this.pool.query(`SELECT m.kind FROM media_assets m WHERE m.id=$1 AND m.status='ready' AND (m.owner_id=$2 OR m.owner_id IS NULL OR EXISTS (
        SELECT 1 FROM resources r WHERE r.id=$3::uuid AND r.owner_id=$2 AND (r.media_id=m.id OR r.cover_media_id=m.id)
      ))`, [id,teacherId,resourceId || null]);
      if (!result.rows[0] || (field === 'coverMediaId' && result.rows[0].kind !== 'image')) throw new AppError('INVALID_MEDIA', 'Media không hợp lệ hoặc không thuộc quyền sử dụng.');
    }
  }

  private async syncGroups(teacherId: string, resourceId: string, rawIds: string[]) {
    const ids = [...new Set(rawIds)];
    const available = await this.pool.query('SELECT id FROM resource_groups WHERE id=ANY($1::uuid[]) AND owner_id=$2', [ids,teacherId]);
    if (available.rows.length !== ids.length) throw new AppError('INVALID_GROUPS', 'Có nhóm không tồn tại hoặc cô không có quyền chỉnh sửa.', HttpStatus.BAD_REQUEST);
    await this.pool.query('DELETE FROM resource_group_members gm USING resource_groups g WHERE gm.group_id=g.id AND gm.resource_id=$1 AND g.owner_id=$2 AND NOT(g.id=ANY($3::uuid[]))', [resourceId,teacherId,ids]);
    for (const groupId of ids) await this.pool.query('INSERT INTO resource_group_members(group_id,resource_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [groupId,resourceId]);
  }

  private async validatePublishedMedia(kind: string, mediaId: string | null | undefined, visibility: string, coverMediaId?: string | null) {
    if (visibility !== 'published') return;
    const visual = kind === 'flashcard' || kind === 'image';
    if (!visual && kind !== 'video' && kind !== 'audio') return;
    const assetId = visual ? mediaId || coverMediaId : mediaId;
    const media = assetId ? await this.pool.query("SELECT kind FROM media_assets WHERE id=$1 AND status='ready'", [assetId]) : null;
    if (media?.rows[0]?.kind !== (visual ? 'image' : kind)) throw new AppError('INVALID_MEDIA', `Cần ${visual ? 'hình ảnh' : kind === 'video' ? 'tệp video' : 'tệp âm thanh'} thật trước khi hiển thị cho bé.`, HttpStatus.BAD_REQUEST);
  }

  private async createResourceRecord(
    teacherId: string,
    input: {
      kind: string;
      title: string;
      description?: string;
      coverMediaId?: string | null;
      mediaId?: string | null;
      content?: Record<string, unknown>;
      topicSlugs?: string[];
      linkedVariantIds?: string[];
      groupIds?: string[];
      visibility?: 'published' | 'hidden';
    },
  ) {
    const title = (input.title || '').trim();
    if (!title || title.length > 100) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Tên học liệu phải từ 1 đến 100 ký tự.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const visibility = input.visibility || 'hidden';
    await this.validateMedia(teacherId, input);
    await this.validatePublishedMedia(input.kind, input.mediaId, visibility, input.coverMediaId);
    const res = await this.pool.query(
      `INSERT INTO resources (owner_id, kind, title, description, cover_media_id, media_id, content, visibility, version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)
       RETURNING id`,
      [
        teacherId,
        input.kind || 'flashcard',
        title,
        (input.description || '').trim(),
        input.coverMediaId || null,
        input.mediaId || null,
        JSON.stringify(input.content || {}),
        visibility,
      ],
    );

    const newId = res.rows[0].id as string;
    await this.syncResourceTopics(newId, input.topicSlugs || ['species']);

    if (input.linkedVariantIds) await this.syncLinks(teacherId, newId, input.linkedVariantIds);
    if (input.groupIds) await this.syncGroups(teacherId, newId, input.groupIds);

    return this.getResourceById(newId, { isTeacher: true, teacherId });
  }

  async updateTeacherResource(teacherId: string, id: string, input: Parameters<ResourcesService['updateResourceRecord']>[2]) {
    input = parseResourceInput(input, true);
    return withTransaction(this.pool, client => new ResourcesService(client as unknown as pg.Pool).updateResourceRecord(teacherId, id, input));
  }

  private async updateResourceRecord(
    teacherId: string,
    resourceIdRaw: string,
    input: {
      kind?: string;
      title?: string;
      description?: string;
      coverMediaId?: string | null;
      mediaId?: string | null;
      content?: Record<string, unknown>;
      topicSlugs?: string[];
      linkedVariantIds?: string[];
      groupIds?: string[];
      visibility?: 'published' | 'hidden';
    },
  ) {
    const resourceId = assertValidUuid(resourceIdRaw, 'resourceId');
    const existingRes = await this.pool.query(
      `SELECT id, owner_id, kind, title, description, cover_media_id, media_id, content, visibility
       FROM resources WHERE id = $1`,
      [resourceId],
    );

    if (existingRes.rows.length === 0) {
      throw new AppError('RESOURCE_NOT_FOUND', 'Không tìm thấy học liệu.', HttpStatus.NOT_FOUND);
    }

    const existing = existingRes.rows[0];
    assertOwnerMatch(existing.owner_id, teacherId);
    await this.validateMedia(teacherId, input, resourceId);
    if (input.linkedVariantIds !== undefined) await this.syncLinks(teacherId, resourceId, input.linkedVariantIds);
    if (input.groupIds !== undefined) await this.syncGroups(teacherId, resourceId, input.groupIds);

    const nextTitle = input.title !== undefined ? input.title.trim() : existing.title;
    if (!nextTitle || nextTitle.length > 100) {
      throw new AppError('VALIDATION_ERROR', 'Tên học liệu phải từ 1 đến 100 ký tự.', HttpStatus.BAD_REQUEST);
    }

    const nextKind = input.kind ?? existing.kind;
    const nextDescription = input.description !== undefined ? input.description.trim() : existing.description;
    const nextCoverMediaId = input.coverMediaId !== undefined ? input.coverMediaId : existing.cover_media_id;
    const nextMediaId = input.mediaId !== undefined ? input.mediaId : existing.media_id;
    const nextContent = input.content !== undefined ? { ...existing.content, ...input.content } : existing.content;
    const nextVisibility = input.visibility ?? existing.visibility;
    await this.validatePublishedMedia(nextKind, nextMediaId, nextVisibility, nextCoverMediaId);

    await this.pool.query(
      `UPDATE resources
       SET kind = $2,
           title = $3,
           description = $4,
           cover_media_id = $5,
           media_id = $6,
           content = $7,
           visibility = $8,
           version = version + 1,
           updated_at = NOW()
       WHERE id = $1`,
      [
        resourceId,
        nextKind,
        nextTitle,
        nextDescription,
        nextCoverMediaId,
        nextMediaId,
        JSON.stringify(nextContent),
        nextVisibility,
      ],
    );

    if (input.topicSlugs !== undefined) {
      await this.syncResourceTopics(resourceId, input.topicSlugs);
    }

    return this.getResourceById(resourceId, { isTeacher: true, teacherId });
  }

  async duplicateResource(teacherId: string, sourceIdRaw: string) {
    const sourceId = assertValidUuid(sourceIdRaw, 'resourceId');
    const source = await this.getResourceById(sourceId, { isTeacher: true, teacherId });

    const copyTitle = source.title.endsWith('(Bản sao)')
      ? source.title
      : `${source.title} (Bản sao)`.slice(0, 100);

    const res = await this.pool.query(
      `INSERT INTO resources (owner_id, kind, title, description, cover_media_id, media_id, content, visibility, version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'hidden', 1)
       RETURNING id`,
      [
        teacherId,
        source.kind,
        copyTitle,
        source.description,
        source.coverMediaId,
        source.mediaId,
        JSON.stringify(source.content || {}),
      ],
    );

    const newId = res.rows[0].id as string;
    await this.syncResourceTopics(newId, source.topicSlugs);

    for (const v of source.variants || []) {
      await this.pool.query(
        `INSERT INTO resource_links (source_resource_id, target_resource_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [newId, v.id],
      );
    }

    return this.getResourceById(newId, { isTeacher: true, teacherId });
  }

  async deleteHiddenResource(teacherId: string, resourceIdRaw: string) {
    const resourceId = assertValidUuid(resourceIdRaw, 'resourceId');
    const existingRes = await this.pool.query(
      `SELECT id, owner_id, visibility FROM resources WHERE id = $1`,
      [resourceId],
    );
    if (existingRes.rows.length === 0) {
      throw new AppError('RESOURCE_NOT_FOUND', 'Không tìm thấy học liệu.', HttpStatus.NOT_FOUND);
    }
    const existing = existingRes.rows[0];
    assertOwnerMatch(existing.owner_id, teacherId);

    if (existing.visibility !== 'hidden') {
      throw new AppError(
        'CANNOT_DELETE_PUBLISHED',
        'Ẩn học liệu trước khi xóa. Học liệu đang hiển thị cho bé được giữ nguyên.',
        HttpStatus.CONFLICT,
      );
    }

    await this.pool.query(`DELETE FROM resources WHERE id = $1`, [resourceId]);
    return { deleted: true, id: resourceId };
  }
}
