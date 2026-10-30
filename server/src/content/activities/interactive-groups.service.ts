import { Inject, Injectable, HttpStatus } from '@nestjs/common';
import type pg from 'pg';
import { z } from 'zod';
import { DB_POOL } from '../../database/database.module.js';
import { AppError } from '../../common/errors.js';
import { assertOwnerMatch } from '../../common/authorization.js';
import { assertValidUuid, parseWithZod } from '../../common/validation.js';
import { withTransaction } from '../../database/pool.js';

const Input = z.object({ title: z.string().trim().min(1).max(100), visibility: z.enum(['draft','published','hidden']).optional(), coverMediaId: z.string().uuid().nullable().optional() });
const Members = z.object({ activityIds: z.array(z.string().uuid()).max(100).default([]), modelIds: z.array(z.string().uuid()).max(100).default([]) }).refine(input => input.activityIds.length + input.modelIds.length > 0, 'Chọn ít nhất một nội dung.');

@Injectable()
export class InteractiveGroupsService {
  constructor(@Inject(DB_POOL) private readonly pool: pg.Pool) {}
  async list(params: { teacherId?: string; kind?: string; cursor?: string; limit?: number }) {
    const offset = Number(params.cursor || 0), limit = Math.min(Math.max(Number(params.limit) || 12, 1), 50);
    if (!Number.isSafeInteger(offset) || offset < 0) throw new AppError('INVALID_CURSOR', 'Trang không hợp lệ.');
    const kind = params.kind || 'game';
    if (!['game','scenario','simulation','model3d'].includes(kind)) throw new AppError('INVALID_KIND', 'Loại hoạt động không hợp lệ.');
    const result = await this.pool.query(`SELECT g.*, cm.storage_key, COALESCE(m.total,0)::int AS member_count,
        COALESCE(m.previews,'[]'::jsonb) AS previews
      FROM interactive_groups g LEFT JOIN media_assets cm ON cm.id=g.cover_media_id
      LEFT JOIN LATERAL (
        SELECT count(*) AS total, jsonb_agg(v.item ORDER BY v.updated_at DESC,v.id) FILTER (WHERE v.ordinal<=3) AS previews FROM (
          SELECT c.*,row_number() OVER(ORDER BY c.updated_at DESC,c.id) AS ordinal FROM (
            SELECT a.id,a.updated_at,jsonb_build_object('id',a.id,'title',a.title,'kind',a.kind,'templateKey',a.template_key,'config',a.config,
              'coverUrl',CASE WHEN am.storage_key LIKE '/assets/%' THEN am.storage_key WHEN am.id IS NOT NULL THEN '/api/v1/media/'||am.id ELSE NULL END) AS item
            FROM interactive_group_members gm JOIN activities a ON a.id=gm.activity_id LEFT JOIN media_assets am ON am.id=a.cover_media_id
            WHERE gm.group_id=g.id AND a.kind=$2 AND (a.visibility='published' OR ($1::uuid IS NOT NULL AND (a.owner_id=$1 OR a.owner_id IS NULL)))
            UNION ALL
            SELECT mo.id,mo.updated_at,jsonb_build_object('id',mo.id,'title',mo.title,'kind','model3d',
              'coverUrl',CASE WHEN mm.storage_key LIKE '/assets/%' THEN mm.storage_key WHEN mm.id IS NOT NULL THEN '/api/v1/media/'||mm.id ELSE NULL END)
            FROM interactive_group_members gm JOIN models_3d mo ON mo.id=gm.model_id LEFT JOIN media_assets mm ON mm.id=mo.cover_media_id
            WHERE gm.group_id=g.id AND $2='model3d' AND (mo.visibility='published' OR ($1::uuid IS NOT NULL AND (mo.owner_id=$1 OR mo.owner_id IS NULL)))
          ) c
        ) v
      ) m ON true
      WHERE (($1::uuid IS NULL AND g.visibility='published' AND m.total>0) OR ($1::uuid IS NOT NULL AND (g.owner_id=$1 OR g.owner_id IS NULL)))
      ORDER BY g.sort_order,g.created_at,g.id LIMIT $3 OFFSET $4`, [params.teacherId || null, kind, limit + 1, offset]);
    return { items: result.rows.slice(0,limit).map(row => ({ id: row.id, title: row.title, ownerId: row.owner_id, isSeed: row.owner_id === null, visibility: row.visibility,
      coverMediaId: row.cover_media_id, coverUrl: row.storage_key?.startsWith('/assets/') ? row.storage_key : row.cover_media_id ? `/api/v1/media/${row.cover_media_id}` : null,
      memberCount: Number(row.member_count), previews: row.previews as Array<{ id: string; title: string; kind: string; coverUrl: string | null }> })), nextCursor: result.rows.length > limit ? String(offset+limit) : null };
  }
  private async owned(teacherId: string, rawId: string, client: Pick<pg.Pool, 'query'> = this.pool) {
    const id = assertValidUuid(rawId, 'groupId'); const result = await client.query('SELECT * FROM interactive_groups WHERE id=$1', [id]);
    if (!result.rows[0]) throw new AppError('GROUP_NOT_FOUND','Không tìm thấy nhóm.',HttpStatus.NOT_FOUND);
    assertOwnerMatch(result.rows[0].owner_id,teacherId); return id;
  }
  async save(teacherId: string, body: unknown, rawId?: string) {
    const input = parseWithZod(rawId ? Input.partial() : Input, body, 'INVALID_GROUP');
    const id = rawId ? await this.owned(teacherId,rawId) : null;
    if (input.coverMediaId && !(await this.pool.query("SELECT id FROM media_assets WHERE id=$1 AND kind='image' AND status='ready' AND (owner_id=$2 OR owner_id IS NULL)",[input.coverMediaId,teacherId])).rows.length) throw new AppError('INVALID_GROUP_COVER','Ảnh nhóm chưa sẵn sàng hoặc không thuộc quyền sử dụng.');
    const row = id ? await this.pool.query(`UPDATE interactive_groups SET title=COALESCE($2,title),visibility=COALESCE($3,visibility),cover_media_id=CASE WHEN $4 THEN $5::uuid ELSE cover_media_id END,updated_at=now() WHERE id=$1 RETURNING id`,[id,input.title,input.visibility,input.coverMediaId!==undefined,input.coverMediaId||null]) : await this.pool.query('INSERT INTO interactive_groups(owner_id,title,visibility,cover_media_id) VALUES($1,$2,$3,$4) RETURNING id',[teacherId,input.title,input.visibility||'draft',input.coverMediaId||null]);
    return { id: row.rows[0].id as string };
  }
  async members(teacherId: string, rawId: string, body: unknown, remove = false) {
    const input = parseWithZod(Members,body,'INVALID_MEMBERS');
    return withTransaction(this.pool,async client => {
      const id = await this.owned(teacherId,rawId,client);
      for (const [table,column,ids] of [['activities','activity_id',input.activityIds],['models_3d','model_id',input.modelIds]] as const) {
        const uniqueIds = [...new Set(ids)]; if (!uniqueIds.length) continue;
        const rows = await client.query(`SELECT id FROM ${table} WHERE id=ANY($1::uuid[]) AND (owner_id=$2 OR owner_id IS NULL)`,[uniqueIds,teacherId]);
        if (rows.rows.length !== uniqueIds.length) throw new AppError('FORBIDDEN_CONTENT','Có nội dung không thuộc quyền quản lý của cô.',HttpStatus.FORBIDDEN);
        if (remove) await client.query(`DELETE FROM interactive_group_members WHERE group_id=$1 AND ${column}=ANY($2::uuid[])`,[id,uniqueIds]);
        else await client.query(`INSERT INTO interactive_group_members(group_id,${column}) SELECT $1,unnest($2::uuid[]) ON CONFLICT DO NOTHING`,[id,uniqueIds]);
      }
      return { ok: true };
    });
  }
  async remove(teacherId: string,id: string) { await this.owned(teacherId,id); await this.pool.query('DELETE FROM interactive_groups WHERE id=$1',[id]); return { deleted: true }; }
}
