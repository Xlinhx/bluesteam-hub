import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import type pg from 'pg';
import { normalizeCreativeConfig, validateCreativeConfig } from '@bluesteam/contracts';
import { DB_POOL } from '../../database/database.module.js';
import { AppError } from '../../common/errors.js';
import { assertOwnerMatch } from '../../common/authorization.js';
import { assertValidUuid } from '../../common/validation.js';
import { encodeCursor, decodeCursor, resolveMediaPublicUrl } from '../resources/resources.service.js';

type Entity = 'templates' | 'materials';
interface CreativeInput {
  kind?: string; title?: string; description?: string; payload?: Record<string, any>;
  mediaId?: string | null; topicSlugs?: string[]; visibility?: string; expectedVersion?: number;
}
interface ListQuery {
  isTeacher: boolean; teacherId?: string; kind?: string; topicIds?: string[]; q?: string;
  visibility?: string; source?: 'all' | 'owned' | 'seed'; cursor?: string; limit?: number;
}

@Injectable()
export class CreativeService {
  constructor(@Inject(DB_POOL) private readonly pool: pg.Pool) {}

  private async map(row: any, entity: Entity, teacherId?: string) {
    const own = row.owner_id === teacherId;
    const draft = own ? row.draft_data : null;
    const data = draft ? { ...row, ...draft, media_id: draft.mediaId } : row;
    let mediaPath = row.media_storage_key;
    if (draft?.mediaId !== undefined) mediaPath = draft.mediaId ? (await this.pool.query('SELECT storage_key FROM media_assets WHERE id=$1', [draft.mediaId])).rows[0]?.storage_key : null;
    const mediaUrl = resolveMediaPublicUrl(mediaPath, data.media_id) || '';
    const common = {
      id: row.id, ownerId: row.owner_id, isSeed: row.owner_id === null, canEdit: own,
      kind: data.kind, title: data.title, description: data.description || '',
      payload: entity === 'templates' ? normalizeCreativeConfig(data.kind, data.payload) : data.payload,
      mediaId: data.media_id, visibility: draft ? 'draft' : row.visibility,
      publishedVisibility: row.visibility, hasDraft: Boolean(draft),
      version: own ? row.edit_version : row.version, publishedVersion: row.version,
      createdAt: new Date(row.created_at).toISOString(), updatedAt: new Date(row.updated_at).toISOString(),
    };
    if (entity === 'templates') return { ...common, schemaVersion: row.schema_version, previewUrl: mediaUrl, topicSlugs: draft?.topicSlugs ?? row.topic_slugs ?? [] };
    const usage = await this.pool.query(`SELECT DISTINCT ct.id, CASE WHEN ct.owner_id=$2 THEN COALESCE(ct.draft_data->>'title',ct.title) ELSE ct.title END AS title FROM creative_template_materials rel JOIN creative_templates ct ON ct.id=rel.template_id WHERE rel.material_id=$1 AND (ct.owner_id=$2 OR ct.owner_id IS NULL OR ct.visibility='published') ORDER BY title`, [row.id, teacherId || null]);
    return { ...common, mediaUrl, usageCount: usage.rows.length, usedBy: usage.rows };
  }

  private async list(entity: Entity, query: ListQuery) {
    const params: unknown[] = [];
    const p = (value: unknown) => { params.push(value); return `$${params.length}`; };
    const where: string[] = [];
    const teacher = query.isTeacher ? p(query.teacherId) : null;
    const field = (name: string) => teacher ? `CASE WHEN c.owner_id=${teacher} THEN COALESCE(c.draft_data->>'${name}',c.${name}) ELSE c.${name} END` : `c.${name}`;
    const visibility = teacher ? `CASE WHEN c.owner_id=${teacher} AND c.draft_data IS NOT NULL THEN 'draft' ELSE c.visibility END` : 'c.visibility';
    if (!teacher) where.push(`c.visibility='published'`);
    else if (query.source === 'owned') where.push(`c.owner_id=${teacher}`);
    else if (query.source === 'seed') where.push('c.owner_id IS NULL');
    else where.push(`(c.owner_id=${teacher} OR c.owner_id IS NULL OR c.visibility='published')`);
    if (query.kind && query.kind !== 'all') where.push(`${field('kind')}=${p(query.kind)}`);
    if (query.isTeacher && query.visibility && query.visibility !== 'all') where.push(`${visibility}=${p(query.visibility)}`);
    if (query.q?.trim()) where.push(`${field('title')} ILIKE ${p(`%${query.q.trim().slice(0,120)}%`)}`);
    if (entity === 'templates' && query.topicIds?.length) {
      const topics = p(query.topicIds);
      where.push(`EXISTS (SELECT 1 FROM creative_template_topics rel JOIN topics t ON t.id=rel.topic_id WHERE rel.template_id=c.id AND (t.slug=ANY(${topics}::text[]) OR t.id::text=ANY(${topics}::text[])))`);
    }
    const filter = () => `WHERE ${where.join(' AND ')}`;
    const total = Number((await this.pool.query(`SELECT COUNT(*)::int AS total FROM creative_${entity} c ${filter()}`, params)).rows[0].total);
    const cursor = decodeCursor(query.cursor);
    if (cursor) where.push(`(c.updated_at,c.id)<(${p(cursor.updatedAt)}::timestamptz,${p(cursor.id)}::uuid)`);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
    const topics = entity === 'templates' ? `, ARRAY(SELECT t.slug FROM creative_template_topics rel JOIN topics t ON t.id=rel.topic_id WHERE rel.template_id=c.id ORDER BY t.sort_order) AS topic_slugs` : '';
    const rows = (await this.pool.query(`SELECT c.*,m.storage_key AS media_storage_key ${topics} FROM creative_${entity} c LEFT JOIN media_assets m ON m.id=c.media_id ${filter()} ORDER BY c.updated_at DESC,c.id DESC LIMIT ${p(limit+1)}`, params)).rows;
    const slice = rows.slice(0,limit);
    return { items: await Promise.all(slice.map(row => this.map(row,entity,query.teacherId))), total, nextCursor: rows.length>limit ? encodeCursor(slice[slice.length-1].updated_at,slice[slice.length-1].id) : null };
  }
  listTemplates(query: ListQuery) { return this.list('templates',query); }
  listMaterials(query: ListQuery) { return this.list('materials',query); }

  private async get(entity: Entity, idRaw: string, teacherId?: string) {
    const id = assertValidUuid(idRaw, 'creativeId');
    const topics = entity === 'templates' ? `, ARRAY(SELECT t.slug FROM creative_template_topics rel JOIN topics t ON t.id=rel.topic_id WHERE rel.template_id=c.id ORDER BY t.sort_order) AS topic_slugs` : '';
    const row = (await this.pool.query(`SELECT c.*, m.storage_key AS media_storage_key ${topics} FROM creative_${entity} c LEFT JOIN media_assets m ON m.id=c.media_id WHERE c.id=$1`, [id])).rows[0];
    if (!row || (row.visibility !== 'published' && row.owner_id !== teacherId && !(teacherId && row.owner_id === null))) throw new AppError('CONTENT_NOT_FOUND','Không tìm thấy nội dung sáng tạo.',HttpStatus.NOT_FOUND);
    return this.map(row,entity,teacherId);
  }
  getTemplateById(id: string, options: { isTeacher: boolean; teacherId?: string }) { return this.get('templates',id,options.isTeacher ? options.teacherId : undefined); }
  getMaterialById(id: string, teacherId?: string) { return this.get('materials',id,teacherId); }

  private async media(db: pg.PoolClient, teacherId: string, id: unknown, kind?: string) {
    if (!id) return;
    assertValidUuid(String(id),'mediaId');
    const row = (await db.query(`SELECT owner_id,status,kind, EXISTS(SELECT 1 FROM creative_templates t WHERE t.visibility='published' AND (t.media_id=$1 OR t.payload->>'outlineMediaId'=$1::text OR t.payload->>'narrationMediaId'=$1::text)) OR EXISTS(SELECT 1 FROM creative_materials m WHERE m.visibility='published' AND m.media_id=$1) AS shared FROM media_assets WHERE id=$1`,[id])).rows[0];
    if (!row || row.status !== 'ready' || (row.owner_id && row.owner_id !== teacherId && !row.shared) || (kind && row.kind !== kind)) throw new AppError('INVALID_MEDIA','File chưa sẵn sàng hoặc cô không có quyền sử dụng.');
  }

  private async prepare(db: pg.PoolClient, entity: Entity, teacherId: string, data: any, publish: boolean) {
    if (typeof data.title !== 'string' || !data.title.trim() || data.title.trim().length>120) throw new AppError('VALIDATION_ERROR','Tên cần từ 1 đến 120 ký tự.');
    data.title = data.title.trim();
    if (!(entity === 'templates' ? ['drawing','habitat'] : ['stamp','habitat_item']).includes(data.kind)) throw new AppError('VALIDATION_ERROR','Loại nội dung không hợp lệ.');
    if (data.visibility && !['draft','published','hidden'].includes(data.visibility)) throw new AppError('VALIDATION_ERROR','Trạng thái không hợp lệ.');
    if (!data.payload || typeof data.payload !== 'object' || Array.isArray(data.payload) || JSON.stringify(data.payload).length>300000) throw new AppError('VALIDATION_ERROR','Cấu hình không hợp lệ hoặc quá lớn.');
    await this.media(db,teacherId,data.mediaId,'image');
    await this.media(db,teacherId,data.payload.outlineMediaId,'image');
    await this.media(db,teacherId,data.payload.narrationMediaId,'audio');
    for (const field of ['outlineMediaId','narrationMediaId']) if (data.payload[field]) {
      const media = (await db.query('SELECT storage_key FROM media_assets WHERE id=$1',[data.payload[field]])).rows[0];
      data.payload[field === 'outlineMediaId' ? 'outlineUrl' : 'narrationUrl'] = resolveMediaPublicUrl(media.storage_key,data.payload[field]);
    }
    if (entity === 'templates') {
      data.payload = normalizeCreativeConfig(data.kind,data.payload);
      const issues = publish ? validateCreativeConfig(data.kind,data.payload) : [];
      const materialIds: string[] = data.payload.materialIds;
      const validIds = materialIds.filter(id => /^[\da-f-]{36}$/i.test(id));
      const materials = validIds.length ? (await db.query('SELECT m.*,a.storage_key FROM creative_materials m LEFT JOIN media_assets a ON a.id=m.media_id WHERE m.id=ANY($1::uuid[]) FOR SHARE OF m',[validIds])).rows : [];
      if (publish) for (const id of materialIds) {
        const row = materials.find(m => m.id === id);
        if (!row || row.visibility !== 'published' || (data.kind === 'drawing' ? row.kind !== 'stamp' : row.kind !== 'habitat_item')) issues.push({ field: 'materialIds', materialId: id, message: `Vật liệu chưa xuất bản hoặc không phù hợp: ${row?.title || id}` });
      }
      if (issues.length) throw new AppError('CREATIVE_PUBLISH_INVALID','Mẫu chưa đủ điều kiện xuất bản.',HttpStatus.BAD_REQUEST,{ issues });
      if (publish) data.payload.materials = materials.map(m => ({ id:m.id,title:m.title,kind:m.kind,payload:m.payload,version:m.version,mediaUrl:resolveMediaPublicUrl(m.storage_key,m.media_id) }));
    } else if (publish && data.kind === 'stamp' && !data.mediaId && !data.payload.stampId) throw new AppError('VALIDATION_ERROR','Chọn hình nhãn dán hoặc con dấu.');
    else if (publish && data.kind === 'habitat_item' && !data.payload.assetId) throw new AppError('VALIDATION_ERROR','Chọn vật thể được sa bàn hỗ trợ.');
    return data;
  }

  private async relations(db: pg.PoolClient, id: string, data: any, revision: 'draft' | 'published') {
    await db.query('DELETE FROM creative_template_materials WHERE template_id=$1 AND revision=$2',[id,revision]);
    for (const materialId of data.payload.materialIds || []) if (/^[\da-f-]{36}$/i.test(materialId)) await db.query(`INSERT INTO creative_template_materials(template_id,material_id,revision) SELECT $1,id,$3 FROM creative_materials WHERE id=$2 AND (owner_id=$4 OR owner_id IS NULL OR visibility='published') ON CONFLICT DO NOTHING`,[id,materialId,revision,data.ownerId]);
  }

  private async save(entity: Entity, teacherId: string, input: CreativeInput, idRaw?: string): Promise<any> {
    const db = await this.pool.connect();
    let id = idRaw ? assertValidUuid(idRaw,'creativeId') : '';
    try {
      await db.query('BEGIN');
      const existing = id ? (await db.query(`SELECT * FROM creative_${entity} WHERE id=$1 FOR UPDATE`,[id])).rows[0] : null;
      if (id && !existing) throw new AppError('CONTENT_NOT_FOUND','Không tìm thấy nội dung.',HttpStatus.NOT_FOUND);
      if (existing) assertOwnerMatch(existing.owner_id,teacherId);
      if (existing && input.expectedVersion !== undefined && input.expectedVersion !== existing.edit_version) throw new AppError('EDIT_CONFLICT','Nội dung đã thay đổi ở nơi khác. Tải lại trước khi lưu.',HttpStatus.CONFLICT);
      const base = existing?.draft_data || (existing ? { kind:existing.kind,title:existing.title,description:existing.description,payload:existing.payload,mediaId:existing.media_id } : {});
      const visibility = input.visibility || (existing?.draft_data ? 'draft' : existing?.visibility) || 'draft';
      const data = await this.prepare(db,entity,teacherId,{
        ...base,...input,kind:input.kind ?? base.kind ?? (entity === 'templates' ? 'drawing' : 'stamp'),
        payload:{ ...base.payload,...input.payload }, mediaId:input.mediaId !== undefined ? input.mediaId : base.mediaId || null,
        visibility,ownerId:teacherId,
      },visibility === 'published');
      if (existing && existing.visibility === 'published' && visibility === 'draft') {
        await db.query(`UPDATE creative_${entity} SET draft_data=$2,edit_version=edit_version+1,updated_at=NOW() WHERE id=$1`,[id,JSON.stringify(data)]);
      } else if (existing) {
        const description = entity === 'templates' ? ',description=$7' : '';
        await db.query(`UPDATE creative_${entity} SET kind=$2,title=$3,payload=$4,media_id=$5,visibility=$6 ${description},draft_data=NULL,edit_version=edit_version+1,version=version+1,updated_at=NOW() WHERE id=$1`,[id,data.kind,data.title,JSON.stringify(data.payload),data.mediaId,visibility,...(entity === 'templates' ? [data.description || ''] : [])]);
      } else {
        const extra = entity === 'templates' ? ',description' : '';
        const value = entity === 'templates' ? ',$7' : '';
        id = (await db.query(`INSERT INTO creative_${entity}(owner_id,kind,title,payload,media_id,visibility${extra}) VALUES ($1,$2,$3,$4,$5,$6${value}) RETURNING id`,[teacherId,data.kind,data.title,JSON.stringify(data.payload),data.mediaId,visibility,...(entity === 'templates' ? [data.description || ''] : [])])).rows[0].id;
      }
      if (entity === 'templates') {
        await this.relations(db,id,data,visibility === 'published' ? 'published' : 'draft');
        if (visibility === 'published') await db.query("DELETE FROM creative_template_materials WHERE template_id=$1 AND revision='draft'",[id]);
        if (!(existing?.visibility === 'published' && visibility === 'draft') && data.topicSlugs) {
          await db.query('DELETE FROM creative_template_topics WHERE template_id=$1',[id]);
          await db.query('INSERT INTO creative_template_topics(template_id,topic_id) SELECT $1,id FROM topics WHERE slug=ANY($2::text[]) ON CONFLICT DO NOTHING',[id,data.topicSlugs]);
        }
      }
      await db.query('COMMIT');
    } catch (error) { await db.query('ROLLBACK'); throw error; }
    finally { db.release(); }
    return this.get(entity,id,teacherId);
  }
  createTeacherTemplate(teacherId: string,input: CreativeInput) { return this.save('templates',teacherId,input); }
  updateTeacherTemplate(teacherId: string,id: string,input: CreativeInput) { return this.save('templates',teacherId,input,id); }
  createTeacherMaterial(teacherId: string,input: CreativeInput) { return this.save('materials',teacherId,input); }
  updateTeacherMaterial(teacherId: string,id: string,input: CreativeInput) { return this.save('materials',teacherId,input,id); }
  async duplicateTemplateToDraft(teacherId: string,id: string) {
    const source: any = await this.get('templates',id,teacherId);
    return this.save('templates',teacherId,{ ...source,title:`${source.title} (Bản sao)`.slice(0,120),visibility:'draft' });
  }
  async duplicateMaterialToDraft(teacherId: string,id: string) {
    const source: any = await this.get('materials',id,teacherId);
    return this.save('materials',teacherId,{ ...source,title:`${source.title} (Bản sao)`.slice(0,120),visibility:'draft' });
  }
  private async remove(entity: Entity,teacherId: string,idRaw: string) {
    const id = assertValidUuid(idRaw,'creativeId');
    const row = (await this.pool.query(`SELECT owner_id,visibility FROM creative_${entity} WHERE id=$1`,[id])).rows[0];
    if (!row) throw new AppError('CONTENT_NOT_FOUND','Không tìm thấy nội dung.',HttpStatus.NOT_FOUND);
    assertOwnerMatch(row.owner_id,teacherId);
    if (row.visibility !== 'draft') throw new AppError('CANNOT_DELETE_PUBLISHED','Chỉ được xóa bản nháp chưa xuất bản.',HttpStatus.CONFLICT);
    if (entity === 'materials' && (await this.pool.query('SELECT 1 FROM creative_template_materials WHERE material_id=$1 LIMIT 1',[id])).rowCount) throw new AppError('MATERIAL_IN_USE','Vật liệu đang được mẫu sử dụng. Có thể tạm ẩn.',HttpStatus.CONFLICT);
    await this.pool.query(`DELETE FROM creative_${entity} WHERE id=$1 AND visibility='draft'`,[id]);
    return { deleted:true,id };
  }
  deleteDraftTemplate(teacherId: string,id: string) { return this.remove('templates',teacherId,id); }
  deleteDraftMaterial(teacherId: string,id: string) { return this.remove('materials',teacherId,id); }
}
