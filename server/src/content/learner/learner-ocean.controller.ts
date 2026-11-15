import { Controller, Get, HttpStatus, Inject, Param, Put, Post, Query, Body, Req } from '@nestjs/common';
import { z } from 'zod';
import { PERSISTED_ANIMAL_AVATAR_KEYS } from '@bluesteam/contracts';
import { AuthService } from '../../auth/auth.service.js';
import { AppError } from '../../common/errors.js';
import { DatabaseService } from '../../database/database.service.js';
import { catalogSearch } from '../../database/seeds/install-learner-pack.js';
import { readLearnerProfileJourney } from './learner-profile-journey.js';
import { recordResourceView } from './record-resource-view.js';

const contextFields = z.object({
  name: z.string().trim().min(1).max(100),
  school: z.string().trim().min(1).max(150),
  schoolYear: z.string().trim().min(1).max(32),
  className: z.string().trim().min(1).max(80),
  editId: z.string().uuid().optional(),
});
const ACTIVE = 'JOIN learner_catalog_active a ON a.version=i.version';
const ORGANISM_KEY = "lower(regexp_replace(trim(i.body->>'title'),'[[:space:]]+',' ','g'))";
const DEFAULT_STUDY_CONTEXT = 'COALESCE((SELECT context_id FROM learner_personal_information WHERE learner_id=$1), (SELECT id FROM learner_study_contexts WHERE learner_id=$1 AND personal))';
const STUDIED_KEYS = 'WITH studied AS (SELECT DISTINCT ' + ORGANISM_KEY + ' AS key FROM learner_studied_species log' +
  ' JOIN learner_catalog_active active ON active.singleton' +
  " JOIN learner_catalog_items i ON i.version=active.version AND i.id=log.organism_id AND i.kind='species'" +
  ' WHERE log.learner_id=$1 AND log.context_id=' + DEFAULT_STUDY_CONTEXT + ') ';
const LEARNED = ' LEFT JOIN studied s ON s.key=' + ORGANISM_KEY;
const VR_UNVERIFIED = 'Thiết bị này có thể xem VR khi được hỗ trợ. Điểm VR đang chờ xác minh lượt quan sát.';

@Controller('api/v1/learner-ocean')
export class LearnerOceanController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService,
              @Inject(AuthService) private readonly auth: AuthService) {}

  private async learner(req: Parameters<AuthService['resolveActorFromRequest']>[0], required = true) {
    const actor = await this.auth.resolveActorFromRequest(req);
    if (actor?.kind === 'student') return actor.learnerId;
    if (required) throw new AppError('UNAUTHORIZED', 'Bé cần đăng nhập để lưu hành trình.', HttpStatus.UNAUTHORIZED);
    return null;
  }

  @Put('avatar')
  async updateAvatar(@Req() req:Parameters<AuthService['resolveActorFromRequest']>[0],@Body() body:unknown) {
    const learner = await this.learner(req);
    const input = z.object({avatarKey:z.enum(PERSISTED_ANIMAL_AVATAR_KEYS)}).safeParse(body);
    if (!input.success) throw new AppError('INVALID_AVATAR','Hình đại diện không hợp lệ.',400);
    await this.db.query('UPDATE learners SET avatar_key=$2 WHERE id=$1',[learner,input.data.avatarKey]);
    return {avatarKey:input.data.avatarKey};
  }

  @Get('zones')
  async zones() {
    const { rows } = await this.db.query('SELECT v.version,v.zones FROM learner_catalog_active a JOIN learner_catalog_versions v USING(version)');
    if (!rows[0]) throw new AppError('CATALOG_UNAVAILABLE', 'Đại dương đang được chuẩn bị.', HttpStatus.SERVICE_UNAVAILABLE);
    return rows[0];
  }

  @Get('groups')
  async groups(@Query('zone') zone = '', @Query('kind') kind = 'species', @Query('allZones') allZones?: string) {
    const { rows } = await this.db.query('SELECT i.group_name AS name, count(*)::integer AS count FROM learner_catalog_items i ' + ACTIVE +
      ' WHERE ($3 OR i.zone=$1) AND i.kind=$2 GROUP BY i.group_name ORDER BY min(i.position)', [zone, kind, allZones === '1']);
    return { items: rows };
  }

  @Get('items')
  async items(@Req() req: Parameters<AuthService['resolveActorFromRequest']>[0], @Query() q: Record<string,string>) {
    const actor = q.kind === 'species' ? await this.learner(req, false) : null;
    const numbered = /^[1-9]\d{0,8}$/.test(q.page ?? '');
    const before = !numbered && /^\d{1,9}$/.test(q.before ?? '');
    const cursor = before ? Number(q.before) : !numbered && /^\d{1,9}$/.test(q.cursor ?? '') ? Number(q.cursor) : -1;
    const limit = q.limit === '5' ? 5 : q.limit === '6' ? 6 : q.limit === '12' ? 12 : 24;
    const offset = numbered ? (Number(q.page) - 1) * limit : 0;
    const term = typeof q.q === 'string' ? catalogSearch(q.q.slice(0,120)) : '';
    const { rows } = await this.db.query(
      STUDIED_KEYS + `SELECT i.position, i.body - 'facts' - 'file' - 'images'
        || jsonb_build_object('image',i.body->'images'->0)
        || CASE WHEN i.kind='collection' AND i.id LIKE 'food-chain-%'
          THEN jsonb_build_object('foodChain',i.body->'facts'->0->>'text') ELSE '{}'::jsonb END
        || CASE WHEN i.kind IN ('audio','download') THEN jsonb_build_object('file',i.body->'file') ELSE '{}'::jsonb END
        AS item, (s.key IS NOT NULL) AS learned${numbered ? ', COUNT(*) OVER()::integer AS total' : ''} FROM learner_catalog_items i ` + ACTIVE +
      LEARNED +
      " WHERE i.kind=$2 AND ($9 OR i.zone=$3) AND ($4='' OR i.group_name=$4) AND strpos(i.search_name,$5)>0" +
      " AND ($7='' OR ($7='learned' AND s.key IS NOT NULL) OR ($7='new' AND s.key IS NULL))" +
      (before ? ' AND i.position<$6 ORDER BY i.position DESC' : ' AND i.position>$6 ORDER BY i.position') + ' LIMIT $8' + (numbered ? ' OFFSET $10' : ''),
      [actor, q.kind || 'species', q.zone || '', q.group || '', term, cursor, q.status === 'learned' || q.status === 'new' ? q.status : '', limit + 1, q.allZones === '1', ...(numbered ? [offset] : [])],
    );
    const page = rows.slice(0, limit);
    if (before) page.reverse();
    const hasExtra = rows.length > limit;
    return {
      items: page.map(row => ({ ...row.item, learned:row.learned })),
      ...(numbered ? { total: rows[0]?.total ?? 0 } : {}),
      nextCursor: page.length && (before || hasExtra) ? String(page.at(-1)!.position) : null,
      previousCursor: page.length && (before ? hasExtra : numbered ? offset > 0 : cursor >= 0) ? String(page[0].position) : null,
    };
  }

  @Get('items/:id')
  async item(@Req() req: Parameters<AuthService['resolveActorFromRequest']>[0], @Param('id') id: string) {
    const actor = await this.learner(req, false);
    const { rows } = await this.db.query(STUDIED_KEYS + `SELECT i.body, (s.key IS NOT NULL) AS learned,
      ARRAY(SELECT jsonb_build_object('id', v.id, 'kind', v.kind, 'title', v.body->'title', 'coverUrl', v.body->'images'->0,
          'drawingTemplateKey', v.body->'drawingTemplateKey')
        FROM learner_catalog_items v
        WHERE v.version=i.version AND v.kind<>i.kind AND v.kind<>'download' AND i.kind<>'download'
          AND (
            (v.kind NOT IN ('species','audio') AND i.kind NOT IN ('species','audio')
              AND v.body->'images' ?| ARRAY(SELECT jsonb_array_elements_text(i.body->'images')))
            OR (v.kind='audio' AND i.kind='species' AND EXISTS (
              SELECT 1 FROM jsonb_array_elements(i.body->'facts') fact WHERE fact->>'audio'=v.body->>'file'))
            OR (v.kind='species' AND i.kind='audio' AND EXISTS (
              SELECT 1 FROM jsonb_array_elements(v.body->'facts') fact WHERE fact->>'audio'=i.body->>'file'))
          ) ORDER BY v.position) AS variants
      FROM learner_catalog_items i ` + ACTIVE +
      LEARNED + ' WHERE i.id=$2', [actor, id]);
    if (!rows[0]) throw new AppError('NOT_FOUND', 'Chưa tìm thấy nội dung này.', HttpStatus.NOT_FOUND);
    return { ...rows[0].body, learned: rows[0].learned, variants: rows[0].variants };
  }

  @Post('studied/:id')
  async study(@Req() req: Parameters<AuthService['resolveActorFromRequest']>[0], @Param('id') id: string) {
    const actor = await this.learner(req);
    return this.db.withTransaction(async client => {
      const result = await client.query('SELECT i.id FROM learner_catalog_items i ' + ACTIVE + " WHERE i.id=$1 AND i.kind='species'", [id]);
      if (!result.rowCount) throw new AppError('NOT_FOUND', 'Chưa tìm thấy sinh vật.', HttpStatus.NOT_FOUND);
      const { rows: [scope] } = await client.query('SELECT learner_recording_context($1) AS id', [actor]);
      if (!scope.id) throw new AppError('CLASS_CLOSED', 'Lớp đã ngừng nhận hoạt động. Bé chọn lớp đang theo học trong Hồ sơ nhé.', 409);
      await client.query('INSERT INTO learner_studied_species(learner_id,context_id,organism_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',
        [actor, scope.id, id]);
      return { learned: true };
    });
  }

  @Post('model-runs')
  async beginModel(@Req() req: Parameters<AuthService['resolveActorFromRequest']>[0], @Body() body: unknown) {
    const actor = await this.auth.resolveActorFromRequest(req);
    if (actor?.kind !== 'student') throw new AppError('UNAUTHORIZED', 'Bé cần đăng nhập để nhận điểm.', 401);
    const parsed = z.object({ modelId:z.literal('digitallife-72b'), mode:z.enum(['vr','inspector']) }).safeParse(body);
    if (!parsed.success) throw new AppError('MODEL_MODE', 'Chế độ quan sát không hợp lệ.', 400);
    const { modelId, mode } = parsed.data;
    if (mode === 'vr') throw new AppError('VR_UNVERIFIED', VR_UNVERIFIED, HttpStatus.FORBIDDEN);
    const { rows } = await this.db.query(
      'INSERT INTO learner_model_runs (learner_id,session_id,model_id,mode) VALUES ($1,$2,$3,$4) RETURNING id',
      [actor.learnerId,actor.sessionId,modelId,mode]);
    return { id:rows[0].id };
  }

  @Post('model-runs/:id/award')
  async claimModel(@Req() req: Parameters<AuthService['resolveActorFromRequest']>[0], @Param('id') id: string) {
    const actor = await this.auth.resolveActorFromRequest(req);
    if (actor?.kind !== 'student') throw new AppError('UNAUTHORIZED', 'Bé cần đăng nhập để nhận điểm.', 401);
    if (!z.string().uuid().safeParse(id).success) throw new AppError('MODEL_RUN', 'Lượt quan sát không hợp lệ.', 400);
    return this.db.withTransaction(async client => {
      const { rows } = await client.query(
        "SELECT model_id,mode FROM learner_model_runs WHERE id=$1 AND learner_id=$2 AND session_id=$3 AND started_at>now()-interval '10 minutes'",
        [id,actor.learnerId,actor.sessionId]);
      if (!rows[0]) throw new AppError('MODEL_RUN', 'Lượt quan sát đã hết hạn hoặc không hợp lệ.', 409);
      if (rows[0].mode === 'vr') throw new AppError('VR_UNVERIFIED', VR_UNVERIFIED, HttpStatus.FORBIDDEN);
      const award = await client.query(
        'INSERT INTO learner_model_awards (learner_id,model_id,mode) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
        [actor.learnerId,rows[0].model_id,rows[0].mode]);
      return { awarded:Boolean(award.rowCount) };
    });
  }

  @Get('profile')
  async profile(@Req() req: Parameters<AuthService['resolveActorFromRequest']>[0], @Query('contextId') requestedContext?: string) {
    const actor = await this.learner(req);
    const { rows } = await this.db.query(
      `SELECT l.display_name AS name, p.context_id AS "contextId", x.id AS "personalContextId" FROM learners l
       LEFT JOIN learner_personal_information p ON p.learner_id=l.id
       LEFT JOIN learner_study_contexts x ON x.learner_id=l.id AND x.personal WHERE l.id=$1`, [actor]);
    const contexts = await this.db.query('SELECT x.id,coalesce(s.name,x.school) AS school,coalesce(y.name,x.school_year) AS "schoolYear",coalesce(c.name,x.class_name) AS "className",x.class_id AS "classId",c.archived,(SELECT e.status FROM class_enrollments e WHERE e.class_id=x.class_id AND e.learner_id=x.learner_id) AS "enrollmentStatus" FROM learner_study_contexts x LEFT JOIN school_classes c ON c.id=x.class_id LEFT JOIN schools s ON s.id=c.school_id LEFT JOIN school_years y ON y.id=c.year_id WHERE x.learner_id=$1 AND NOT x.personal ORDER BY school,"schoolYear" DESC,"className"', [actor]);
    const contextId = requestedContext ?? rows[0]?.contextId ?? rows[0]?.personalContextId ?? null;
    if (requestedContext && requestedContext !== rows[0]?.personalContextId && !contexts.rows.some(context => context.id === requestedContext)) {
      throw new AppError('NOT_FOUND', 'Không tìm thấy lớp trong hồ sơ của bé.', HttpStatus.NOT_FOUND);
    }
    const totals = await this.db.query(
      'SELECT count(DISTINCT ' + ORGANISM_KEY + ')::integer AS total,count(DISTINCT ' + ORGANISM_KEY +
      ') FILTER (WHERE s.organism_id IS NOT NULL)::integer AS learned,' +
      ' (SELECT min(studied_at) FROM learner_studied_species WHERE learner_id=$1 AND context_id=$2) AS first FROM learner_catalog_items i ' + ACTIVE +
      " LEFT JOIN learner_studied_species s ON s.learner_id=$1 AND s.context_id=$2 AND s.organism_id=i.id WHERE i.kind='species'",
      [actor, contextId]);
    const games = await this.db.query(
      "SELECT r.content_id AS id, (array_agg(r.snapshot->>'title' ORDER BY r.opened_at DESC,r.id DESC))[1] AS title, " +
      "(array_agg(r.snapshot->>'coverUrl' ORDER BY r.opened_at DESC,r.id DESC))[1] AS \"coverUrl\" " +
      "FROM interactive_usage_runs r WHERE r.kind='game' AND r.learner_id=$1 AND r.study_context_id=$2 " +
      "AND EXISTS (SELECT 1 FROM interactive_usage_interactions e WHERE e.run_id=r.id) " +
      "GROUP BY r.content_id ORDER BY max(r.opened_at) DESC",
      [actor, contextId]);
    const points = await this.db.query('SELECT count(*)::integer*100 AS points FROM learner_model_awards WHERE learner_id=$1', [actor]);
    return { ...rows[0], contexts: contexts.rows, ...totals.rows[0], games: games.rows, points:points.rows[0].points };
  }

  @Post('resource-views')
  async resourceView(@Req() req: Parameters<AuthService['resolveActorFromRequest']>[0], @Body() body: unknown) {
    const learnerId = await this.learner(req, false);
    const input = z.discriminatedUnion('kind', [
      z.object({kind:z.literal('source'), id:z.string().trim().min(1).max(180)}),
      z.object({kind:z.literal('published'), id:z.string().uuid()}),
    ]).safeParse(body);
    if (!input.success) throw new AppError('INVALID_RESOURCE','Học liệu không hợp lệ.',400);
    if (learnerId) await recordResourceView(this.db, learnerId, input.data.kind, input.data.id);
    return { ok:true };
  }

  @Get('study-context')
  async studyContext(@Req() req: Parameters<AuthService['resolveActorFromRequest']>[0]) {
    const learnerId = await this.learner(req);
    const { rows } = await this.db.query(`SELECT p.context_id AS "contextId" FROM learner_personal_information p
      JOIN learner_study_contexts x ON x.id=p.context_id LEFT JOIN school_classes c ON c.id=x.class_id
      WHERE p.learner_id=$1 AND (x.class_id IS NULL OR (NOT c.archived AND EXISTS
      (SELECT 1 FROM class_enrollments e WHERE e.context_id=x.id AND e.learner_id=p.learner_id AND e.status='active')))`, [learnerId]);
    return { learnerId, contextId:rows[0]?.contextId ?? null };
  }

  @Get('evidence')
  async evidence(@Req() req: Parameters<AuthService['resolveActorFromRequest']>[0], @Query('contextId') contextId?: string) {
    const learner = (await this.learner(req))!;
    if (contextId !== undefined && !z.string().uuid().safeParse(contextId).success) {
      throw new AppError('INVALID_CONTEXT', 'Hành trình không hợp lệ.', 400);
    }
    const { rows: [scope] } = contextId
      ? await this.db.query('SELECT id FROM learner_study_contexts WHERE learner_id=$1 AND id=$2', [learner,contextId])
      : await this.db.query(`SELECT ${DEFAULT_STUDY_CONTEXT} AS id`, [learner]);
    if (!scope) throw new AppError('NOT_FOUND', 'Không tìm thấy hành trình của bé.', 404);
    return readLearnerProfileJourney(this.db, learner, scope.id);
  }

  @Put('name')
  async updateName(@Req() req: Parameters<AuthService['resolveActorFromRequest']>[0], @Body() body: unknown) {
    const learner = await this.learner(req);
    const input = z.object({name:z.string().trim().min(1).max(100)}).safeParse(body);
    if (!input.success) throw new AppError('INVALID_PROFILE', 'Nhập họ tên của bé.', 400);
    await this.db.query('UPDATE learners SET display_name=$2 WHERE id=$1', [learner,input.data.name]);
    return input.data;
  }

  @Get('history')
  async history(@Req() req: Parameters<AuthService['resolveActorFromRequest']>[0], @Query('cursor') cursor?: string, @Query('contextId') requestedContext?: string) {
    const actor = await this.learner(req);
    if (requestedContext && !z.string().uuid().safeParse(requestedContext).success) {
      throw new AppError('INVALID_CONTEXT', 'Lớp không hợp lệ.', HttpStatus.BAD_REQUEST);
    }
    const offset = cursor && /^\d{1,8}$/.test(cursor) ? Number(cursor) : 0;
    const { rows } = await this.db.query(
      "SELECT id,zone,title,image FROM (SELECT DISTINCT ON (" + ORGANISM_KEY + ") i.id, i.zone, i.body->>'title' AS title, i.body->'images'->>0 AS image, s.studied_at FROM learner_studied_species s " +
      "JOIN learner_study_contexts c ON c.learner_id=s.learner_id AND c.id=s.context_id " +
      "JOIN learner_catalog_active a ON a.singleton " +
      "JOIN learner_catalog_items i ON i.version=a.version AND i.id=s.organism_id " +
      "WHERE s.learner_id=$1 AND s.context_id=COALESCE($3::uuid," + DEFAULT_STUDY_CONTEXT + ") ORDER BY " + ORGANISM_KEY + ", s.studied_at DESC,i.id) recent ORDER BY studied_at DESC,id LIMIT 25 OFFSET $2", [actor,offset,requestedContext ?? null]);
    return { items: rows.slice(0,24), nextCursor: rows.length > 24 ? String(offset + 24) : null };
  }

  @Put('profile')
  async updateProfile(@Req() req: Parameters<AuthService['resolveActorFromRequest']>[0], @Body() body: unknown) {
    const actor = await this.learner(req);
    const form = contextFields.safeParse(body);
    if (!form.success) throw new AppError('INVALID_PROFILE', 'Bé hãy điền họ tên, trường, năm học và lớp.', HttpStatus.BAD_REQUEST);
    const { name,school,schoolYear,className,editId } = form.data;
    return this.db.withTransaction(async client => {
      if (editId) {
        const context = await client.query('SELECT class_id FROM learner_study_contexts WHERE learner_id=$1 AND id=$2 AND NOT personal FOR UPDATE', [actor,editId]);
        if (context.rows[0]?.class_id) throw new AppError('MANAGED_CLASS', 'Thông tin lớp do giáo viên quản lý.', HttpStatus.CONFLICT);
      }
      await client.query('UPDATE learners SET display_name=$2 WHERE id=$1', [actor,name]);
      const existing = await client.query('SELECT id FROM learner_study_contexts WHERE learner_id=$1 AND school=$2 AND school_year=$3 AND class_name=$4 AND class_id IS NULL', [actor,school,schoolYear,className]);
      if (editId && existing.rows[0] && existing.rows[0].id !== editId) {
        throw new AppError('CONTEXT_EXISTS', 'Bối cảnh này đã có. Bé có thể chọn lại ở danh sách bên dưới.', HttpStatus.CONFLICT);
      }
      const result = editId
        ? await client.query('UPDATE learner_study_contexts SET school=$2,school_year=$3,class_name=$4 WHERE learner_id=$1 AND id=$5 RETURNING id', [actor,school,schoolYear,className,editId])
        : existing.rowCount ? existing : await client.query('INSERT INTO learner_study_contexts(learner_id,school,school_year,class_name) VALUES ($1,$2,$3,$4) RETURNING id', [actor,school,schoolYear,className]);
      if (!result.rows[0]) throw new AppError('NOT_FOUND', 'Không tìm thấy lớp này trong hồ sơ của bé.', HttpStatus.NOT_FOUND);
      const contextId = result.rows[0].id;
      await client.query('INSERT INTO learner_personal_information VALUES ($1,$2) ON CONFLICT (learner_id) DO UPDATE SET context_id=EXCLUDED.context_id', [actor,contextId]);
      return { name, contextId };
    });
  }
}
