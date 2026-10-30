import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import type pg from 'pg';
import { z } from 'zod';
import { DB_POOL } from '../../database/database.module.js';
import { AppError } from '../../common/errors.js';
import { parseWithZod, assertValidUuid } from '../../common/validation.js';
import { assertOwnerMatch } from '../../common/authorization.js';
import { withTransaction } from '../../database/pool.js';

const GroupInput = z.object({
  title: z.string().trim().min(1).max(100),
  coverMediaId: z.string().uuid().nullable().optional(),
  coverCrop: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1), scale: z.number().min(1).max(4) }).optional(),
  visibility: z.enum(['published', 'hidden']).optional(),
});
const MembersInput = z.object({ resourceIds: z.array(z.string().uuid()).min(1).max(100), moveFromGroupId: z.string().uuid().optional() });

@Injectable()
export class ResourceGroupsService {
  constructor(@Inject(DB_POOL) private readonly pool: pg.Pool) {}

  async list(params: { teacherId?: string; q?: string; cursor?: string; limit?: number; id?: string }) {
    const limit = Math.min(Math.max(Number(params.limit) || 12, 1), 50);
    const offset = params.cursor ? Number(params.cursor) : 0;
    if (!Number.isSafeInteger(offset) || offset < 0) throw new AppError('INVALID_CURSOR', 'Trang không hợp lệ.');
    const result = await this.pool.query(`
      SELECT g.*, m.storage_key, COALESCE(c.total,0)::int AS "memberCount",
        COALESCE(p.items, '[]'::jsonb) AS previews,
        COUNT(*) OVER()::int AS total
      FROM resource_groups g
      LEFT JOIN media_assets m ON m.id=g.cover_media_id
      LEFT JOIN LATERAL (
        SELECT count(*)::int AS total FROM resource_group_members gm JOIN resources r ON r.id=gm.resource_id
        WHERE gm.group_id=g.id AND (r.visibility='published' OR ($1::uuid IS NOT NULL AND (r.owner_id=$1 OR r.owner_id IS NULL)))
      ) c ON true
      LEFT JOIN LATERAL (
        SELECT jsonb_agg(v.item ORDER BY v.sort_order,v.updated_at DESC, v.id DESC) AS items FROM (
          SELECT r.id, r.updated_at, gm.sort_order, jsonb_build_object('id',r.id,'title',r.title,'kind',r.kind,
            'coverUrl',CASE WHEN cm.storage_key LIKE '/assets/%' THEN cm.storage_key
              WHEN cm.id IS NOT NULL THEN '/api/v1/media/'||cm.id ELSE NULL END) AS item
          FROM resource_group_members gm JOIN resources r ON r.id=gm.resource_id
          LEFT JOIN media_assets cm ON cm.id=r.cover_media_id
          WHERE gm.group_id=g.id AND (r.visibility='published' OR ($1::uuid IS NOT NULL AND (r.owner_id=$1 OR r.owner_id IS NULL)))
            AND ($1::uuid IS NOT NULL OR NOT EXISTS (
              SELECT 1 FROM resource_links rl
              JOIN resources main ON main.id=rl.source_resource_id
              JOIN resource_group_members member ON member.resource_id=main.id AND member.group_id=g.id
              WHERE rl.target_resource_id=r.id AND main.kind='flashcard'
                AND main.visibility='published' AND r.kind<>'flashcard'
            ))
          ORDER BY gm.sort_order,r.updated_at DESC,r.id DESC LIMIT 4
        ) v
      ) p ON true
      WHERE (($1::uuid IS NULL AND g.visibility='published') OR ($1::uuid IS NOT NULL AND (g.owner_id=$1 OR g.owner_id IS NULL)))
        AND ($2::text='' OR g.title ILIKE '%'||$2||'%')
        AND ($5::uuid IS NULL OR g.id=$5)
      ORDER BY g.sort_order,g.created_at DESC,g.id LIMIT $3 OFFSET $4`, [params.teacherId || null, (params.q || '').trim(), limit, offset, params.id ? assertValidUuid(params.id, 'groupId') : null]);
    const total = result.rows.length ? Number(result.rows[0].total) : Number((await this.pool.query(`SELECT count(*)::int AS total FROM resource_groups g
      WHERE (($1::uuid IS NULL AND g.visibility='published') OR ($1::uuid IS NOT NULL AND (g.owner_id=$1 OR g.owner_id IS NULL)))
      AND ($2::text='' OR g.title ILIKE '%'||$2||'%') AND ($3::uuid IS NULL OR g.id=$3)`,[params.teacherId||null,(params.q||'').trim(),params.id||null])).rows[0].total);
    return { items: result.rows.map(({ total: _total, ...r }) => ({
      id: r.id, title: r.title, ownerId: r.owner_id, isSeed: r.owner_id === null,
      coverMediaId: r.cover_media_id, coverCrop: r.cover_crop, visibility: r.visibility,
      coverUrl: r.storage_key?.startsWith('/assets/') ? r.storage_key : r.cover_media_id ? `/api/v1/media/${r.cover_media_id}` : null,
      memberCount: r.memberCount, previews: r.previews,
    })), total, nextCursor: offset + result.rows.length < total ? String(offset + limit) : null };
  }

  async get(id: string, teacherId?: string) {
    const page = await this.list({ id, teacherId });
    if (!page.items[0]) throw new AppError('GROUP_NOT_FOUND', 'Nhóm không còn khả dụng.', HttpStatus.NOT_FOUND);
    return page.items[0];
  }

  private async assertOwned(teacherId: string, rawId: string, db: Pick<pg.Pool, 'query'> = this.pool) {
    const id = assertValidUuid(rawId, 'groupId');
    const row = await db.query('SELECT * FROM resource_groups WHERE id=$1', [id]);
    if (!row.rows[0]) throw new AppError('GROUP_NOT_FOUND', 'Không tìm thấy nhóm.', HttpStatus.NOT_FOUND);
    assertOwnerMatch(row.rows[0].owner_id, teacherId);
    return row.rows[0];
  }

  async save(teacherId: string, body: unknown, id?: string) {
    const input = parseWithZod(id ? GroupInput.partial() : GroupInput, body, 'INVALID_GROUP');
    if (id) await this.assertOwned(teacherId, id);
    if (input.coverMediaId) {
      const media = await this.pool.query("SELECT id FROM media_assets WHERE id=$1 AND kind='image' AND status='ready' AND (owner_id=$2 OR owner_id IS NULL)", [input.coverMediaId, teacherId]);
      if (!media.rows[0]) throw new AppError('INVALID_GROUP_COVER', 'Ảnh nhóm không hợp lệ hoặc không thuộc quyền sử dụng.');
    }
    if (!id) {
      const result = await this.pool.query(`INSERT INTO resource_groups(owner_id,title,cover_media_id,cover_crop,visibility)
        VALUES($1,$2,$3,$4,$5) RETURNING id`, [teacherId,input.title,input.coverMediaId || null,JSON.stringify(input.coverCrop || {x:.5,y:.5,scale:1}),input.visibility || 'hidden']);
      id = result.rows[0].id;
    } else {
      await this.pool.query(`UPDATE resource_groups SET title=COALESCE($2,title),
        cover_media_id=CASE WHEN $3 THEN $4::uuid ELSE cover_media_id END,
        cover_crop=COALESCE($5::jsonb,cover_crop),visibility=COALESCE($6,visibility),updated_at=now() WHERE id=$1`,
        [id,input.title,input.coverMediaId !== undefined,input.coverMediaId || null,input.coverCrop ? JSON.stringify(input.coverCrop) : null,input.visibility]);
    }
    return { id };
  }

  async members(teacherId: string, id: string, body: unknown, remove = false) {
    const input = parseWithZod(MembersInput, body, 'INVALID_MEMBERS');
    const ids = [...new Set(input.resourceIds)];
    return withTransaction(this.pool, async (client) => {
      await this.assertOwned(teacherId, id, client);
      if (input.moveFromGroupId && input.moveFromGroupId !== id) await this.assertOwned(teacherId, input.moveFromGroupId, client);
      if (remove) {
        await client.query('DELETE FROM resource_group_members WHERE group_id=$1 AND resource_id=ANY($2::uuid[])', [id,ids]);
      } else {
        const available = await client.query(`SELECT id FROM resources WHERE id=ANY($1::uuid[]) AND (owner_id=$2 OR owner_id IS NULL OR visibility='published')`, [ids,teacherId]);
        if (available.rows.length !== ids.length) throw new AppError('RESOURCE_UNAVAILABLE', 'Có học liệu không còn khả dụng. Danh sách chưa được thay đổi.', HttpStatus.CONFLICT);
        await client.query(`INSERT INTO resource_group_members(group_id,resource_id) SELECT $1,unnest($2::uuid[]) ON CONFLICT DO NOTHING`, [id,ids]);
        if (input.moveFromGroupId && input.moveFromGroupId !== id) await client.query('DELETE FROM resource_group_members WHERE group_id=$1 AND resource_id=ANY($2::uuid[])', [input.moveFromGroupId,ids]);
      }
      return { ok: true };
    });
  }

  async remove(teacherId: string, id: string) {
    await this.assertOwned(teacherId, id);
    await this.pool.query('DELETE FROM resource_groups WHERE id=$1', [id]);
    return { ok: true };
  }

  async duplicate(teacherId: string, rawId: string) {
    const id = assertValidUuid(rawId, 'groupId');
    return withTransaction(this.pool, async client => {
      const source = await client.query('SELECT id FROM resource_groups WHERE id=$1 AND (owner_id=$2 OR owner_id IS NULL)', [id,teacherId]);
      if (!source.rows[0]) throw new AppError('GROUP_NOT_FOUND', 'Không tìm thấy nhóm.', HttpStatus.NOT_FOUND);
      const copy = await client.query(`INSERT INTO resource_groups(owner_id,title,cover_media_id,cover_crop,visibility)
        SELECT $2,left(title,89)||' (Bản sao)',cover_media_id,cover_crop,'hidden' FROM resource_groups WHERE id=$1 RETURNING id`,[id,teacherId]);
      await client.query(`INSERT INTO resource_group_members(group_id,resource_id,sort_order) SELECT $2,resource_id,sort_order FROM resource_group_members WHERE group_id=$1`,[id,copy.rows[0].id]);
      return { id: copy.rows[0].id };
    });
  }
}
