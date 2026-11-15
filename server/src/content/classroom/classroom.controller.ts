import { Body, Controller, Get, Inject, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { schoolYearStart } from '@bluesteam/contracts';
import { DatabaseService } from '../../database/database.service.js';
import { TeacherSessionGuard } from '../../auth/session.guard.js';
import { AuthService } from '../../auth/auth.service.js';
import { AppError } from '../../common/errors.js';
import { readProfileEvidence } from './profile-evidence.js';
import { readClassEvidence } from './class-evidence.js';
import { activateEnrollment } from './class-enrollment.js';

const name = z.string().trim().min(1).max(150);
const uuid = z.string().uuid();
const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value=>{
  const date=new Date(value);
  return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value;
});

@Controller('api/v1')
export class ClassroomController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService, @Inject(AuthService) private readonly auth: AuthService) {}

  private async owned(teacher: string, id: string) {
    if (!uuid.safeParse(id).success) throw new AppError('NOT_FOUND', 'Không tìm thấy lớp.', 404);
    const { rows } = await this.db.query(
      `SELECT c.*,c.start_date::text AS start_date,c.end_date::text AS end_date,s.name AS school,y.name AS year,s.owner_id=$2 AS "canManage",coalesce((SELECT role FROM class_teachers WHERE class_id=c.id AND teacher_id=$2),'owner') AS "teacherRole" FROM school_classes c JOIN schools s ON s.id=c.school_id JOIN school_years y ON y.id=c.year_id WHERE c.id=$1 AND (s.owner_id=$2 OR EXISTS(SELECT 1 FROM class_teachers t WHERE t.class_id=c.id AND t.teacher_id=$2))`, [id,teacher]);
    if (!rows[0]) throw new AppError('NOT_FOUND', 'Không tìm thấy lớp được phân công.', 404);
    return rows[0];
  }

  @Get('teacher/classroom')
  @UseGuards(TeacherSessionGuard)
  async index(@Req() req: any) {
    const teacher = req.actor.teacherId;
    const profile = await this.db.query('SELECT display_name AS name,birth_date::text AS "birthDate" FROM teachers WHERE id=$1', [teacher]);
    const schools = await this.db.query('SELECT id,name FROM schools WHERE owner_id=$1 ORDER BY name,id', [teacher]);
    const classes = await this.db.query(
      'SELECT c.*,c.start_date::text AS start_date,c.end_date::text AS end_date,s.name AS school,y.name AS year FROM school_classes c JOIN schools s ON s.id=c.school_id JOIN school_years y ON y.id=c.year_id WHERE s.owner_id=$1 OR EXISTS(SELECT 1 FROM class_teachers t WHERE t.class_id=c.id AND t.teacher_id=$1) ORDER BY y.name DESC,c.name,c.id', [teacher]);
    return { profile:profile.rows[0], schools:schools.rows, classes:classes.rows };
  }

  @Patch('teacher/classroom/profile')
  @UseGuards(TeacherSessionGuard)
  async profile(@Req() req:any,@Body() body:unknown) {
    const birthDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
      const date = new Date(value);
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === value && date <= new Date();
    });
    const input=z.object({name:z.string().trim().min(1).max(80),birthDate:birthDate.nullable()}).safeParse(body);
    if(!input.success) throw new AppError('INVALID_PROFILE','Thông tin cá nhân không hợp lệ.',400);
    await this.db.query('UPDATE teachers SET display_name=$2,birth_date=$3,updated_at=now() WHERE id=$1',[req.actor.teacherId,input.data.name,input.data.birthDate]);
    return {ok:true};
  }

  @Post('teacher/classroom/schools')
  @UseGuards(TeacherSessionGuard)
  async school(@Req() req:any,@Body() body:unknown) {
    const input=z.object({name}).safeParse(body);
    if(!input.success) throw new AppError('INVALID_SCHOOL','Nhập tên trường.',400);
    const {rows}=await this.db.query('INSERT INTO schools(name,owner_id) VALUES($1,$2) RETURNING id',[input.data.name,req.actor.teacherId]);
    return rows[0];
  }

  @Post('teacher/classroom/classes')
  @UseGuards(TeacherSessionGuard)
  async create(@Req() req:any,@Body() body:unknown) {
    const input=z.object({schoolId:uuid,year:name,name,ageGroup:z.string().trim().max(80)}).safeParse(body);
    if(!input.success) throw new AppError('INVALID_CLASS','Thông tin lớp không hợp lệ.',400);
    const value=input.data;
    return this.db.withTransaction(async client=>{
      const school=await client.query('SELECT id FROM schools WHERE id=$1 AND owner_id=$2 FOR UPDATE',[value.schoolId,req.actor.teacherId]);
      if(!school.rowCount) throw new AppError('NOT_FOUND','Không tìm thấy trường được quản lý.',404);
      const year=await client.query('INSERT INTO school_years(school_id,name) VALUES($1,$2) ON CONFLICT(school_id,name) DO UPDATE SET name=EXCLUDED.name RETURNING id',[value.schoolId,value.year]);
      const result=await client.query('INSERT INTO school_classes(school_id,year_id,name,age_group) VALUES($1,$2,$3,$4) ON CONFLICT(year_id,name) DO NOTHING RETURNING id',[value.schoolId,year.rows[0].id,value.name,value.ageGroup]);
      if(!result.rows[0]) throw new AppError('CLASS_EXISTS','Tên lớp đã có trong năm học này.',409);
      await client.query("INSERT INTO class_teachers(class_id,teacher_id,role) VALUES($1,$2,'lead')",[result.rows[0].id,req.actor.teacherId]);
      return result.rows[0];
    });
  }

  @Get('teacher/classroom/classes/:id')
  @UseGuards(TeacherSessionGuard)
  async detail(@Req() req:any,@Param('id') id:string) {
    const classroom=await this.owned(req.actor.teacherId,id);
    const members=await this.db.query(
      'SELECT e.*,l.display_name AS name,l.avatar_key,l.student_number,(SELECT count(DISTINCT lower(regexp_replace(trim(i.body->>\'title\'),\'[[:space:]]+\',\' \',\'g\')))::int FROM learner_studied_species s JOIN learner_catalog_active a ON a.singleton JOIN learner_catalog_items i ON i.version=a.version AND i.id=s.organism_id WHERE s.learner_id=e.learner_id AND s.context_id=e.context_id) AS species,(SELECT count(DISTINCT r.content_id)::int FROM interactive_usage_runs r WHERE r.kind=\'game\' AND r.learner_id=e.learner_id AND r.study_context_id=e.context_id AND EXISTS(SELECT 1 FROM interactive_usage_interactions i WHERE i.run_id=r.id)) AS games FROM class_enrollments e JOIN learners l ON l.id=e.learner_id WHERE e.class_id=$1 ORDER BY l.display_name,e.id',[id]);
    const teachers=await this.db.query('SELECT t.id,t.display_name AS name,t.avatar_key,t.avatar_media_id,a.role FROM class_teachers a JOIN teachers t ON t.id=a.teacher_id WHERE a.class_id=$1 ORDER BY a.role DESC,t.display_name,t.id',[id]);
    return {classroom,members:members.rows,teachers:teachers.rows,evidence:await readClassEvidence(this.db,id)};
  }

  @Patch('teacher/classroom/classes/:id')
  @UseGuards(TeacherSessionGuard)
  async update(@Req() req:any,@Param('id') id:string,@Body() body:unknown) {
    const classroom=await this.owned(req.actor.teacherId,id);
    const input=z.object({name,ageGroup:z.string().trim().max(80),archived:z.boolean(),startDate:calendarDate.nullable().optional(),endDate:calendarDate.nullable().optional(),requiresApproval:z.boolean().optional()})
      .refine(value=>!value.startDate||!value.endDate||value.startDate<=value.endDate).safeParse(body);
    if(!input.success) throw new AppError('INVALID_CLASS','Thông tin lớp không hợp lệ.',400);
    if(input.data.requiresApproval!==undefined&&!classroom.canManage) {
      throw new AppError('FORBIDDEN','Người phụ trách trường quản lý chế độ duyệt yêu cầu.',403);
    }
    try {
      await this.db.query(`UPDATE school_classes SET name=$2,age_group=$3,archived=$4,
        start_date=CASE WHEN $7 THEN $5::date ELSE start_date END,end_date=CASE WHEN $8 THEN $6::date ELSE end_date END,
        requires_approval=COALESCE($9::boolean,requires_approval) WHERE id=$1`,
        [id,input.data.name,input.data.ageGroup,input.data.archived,input.data.startDate??null,input.data.endDate??null,
          Object.hasOwn(input.data,'startDate'),Object.hasOwn(input.data,'endDate'),input.data.requiresApproval??null]);
    } catch(error) {
      if((error as {code?:string}).code==='23505') throw new AppError('CLASS_EXISTS','Tên lớp đã có trong năm học này.',409);
      if((error as {code?:string}).code==='23514') throw new AppError('INVALID_DATES','Ngày kết thúc cần sau ngày bắt đầu.',400);
      throw error;
    }
    return {ok:true};
  }

  @Get('teacher/classroom/classes/:id/learners/:learner')
  @UseGuards(TeacherSessionGuard)
  async learnerDetail(@Req() req:any,@Param('id') id:string,@Param('learner') learner:string) {
    await this.owned(req.actor.teacherId,id);
    if (!uuid.safeParse(learner).success) throw new AppError('NOT_FOUND','Không tìm thấy học sinh.',404);
    const enrollment = await this.db.query('SELECT context_id FROM class_enrollments WHERE class_id=$1 AND learner_id=$2 AND context_id IS NOT NULL', [id,learner]);
    if (!enrollment.rows[0]) throw new AppError('NOT_FOUND','Học sinh chưa có lịch sử trong lớp này.',404);
    return readProfileEvidence(this.db,learner,enrollment.rows[0].context_id);
  }

  @Post('teacher/classroom/classes/:id/invitation')
  @UseGuards(TeacherSessionGuard)
  async invitation(@Req() req:any,@Param('id') id:string) {
    await this.owned(req.actor.teacherId,id);
    const {rows}=await this.db.query("UPDATE school_classes SET invite_code=classroom_invite_code(),legacy_invite_code=NULL,invite_expires_at=now()+interval '14 days' WHERE id=$1 AND NOT archived RETURNING invite_code",[id]);
    if(!rows[0]) throw new AppError('CLASS_ARCHIVED','Lớp đã lưu trữ.',409);
    return rows[0];
  }

  @Post('teacher/classroom/classes/:id/teachers')
  @UseGuards(TeacherSessionGuard)
  async assign(@Req() req:any,@Param('id') id:string,@Body() body:unknown) {
    const classroom=await this.owned(req.actor.teacherId,id);
    if(!classroom.canManage) throw new AppError('FORBIDDEN','Người phụ trách trường quản lý phân công giáo viên.',403);
    const input=z.object({email:z.string().trim().email().max(254),role:z.enum(['lead','assistant','remove'])}).safeParse(body);
    if(!input.success) throw new AppError('INVALID_TEACHER','Chọn tài khoản và vai trò giáo viên.',400);
    const teacher=await this.db.query('SELECT id FROM teachers WHERE lower(email)=lower($1)',[input.data.email]);
    if(!teacher.rows[0]) throw new AppError('NOT_FOUND','Giáo viên cần có tài khoản trước khi được phân công.',404);
    if(input.data.role==='remove') {
      if(teacher.rows[0].id===req.actor.teacherId) throw new AppError('OWNER_REQUIRED','Người quản lý trường cần giữ vai trò phụ trách.',409);
      await this.db.query('DELETE FROM class_teachers WHERE class_id=$1 AND teacher_id=$2',[id,teacher.rows[0].id]);
    } else {
      await this.db.query('INSERT INTO class_teachers(class_id,teacher_id,role) VALUES($1,$2,$3) ON CONFLICT(class_id,teacher_id) DO UPDATE SET role=EXCLUDED.role',[id,teacher.rows[0].id,input.data.role]);
    }
    return {ok:true};
  }

  @Post('teacher/classroom/classes/:id/enrollments/:enrollment')
  @UseGuards(TeacherSessionGuard)
  async decide(@Req() req:any,@Param('id') id:string,@Param('enrollment') enrollment:string,@Body() body:unknown) {
    await this.owned(req.actor.teacherId,id);
    const input=z.object({action:z.enum(['approve','reject','end'])}).safeParse(body);
    if(!input.success||!uuid.safeParse(enrollment).success) throw new AppError('INVALID_ENROLLMENT','Yêu cầu không hợp lệ.',400);
    return this.db.withTransaction(async client=>{
      const classroom=await client.query('SELECT c.*,c.start_date::text AS start_date,c.end_date::text AS end_date,s.name AS school,y.name AS year FROM school_classes c JOIN schools s ON s.id=c.school_id JOIN school_years y ON y.id=c.year_id WHERE c.id=$1 FOR UPDATE OF c',[id]);
      const c=classroom.rows[0];
      const result=await client.query('SELECT * FROM class_enrollments WHERE id=$1 AND class_id=$2 FOR UPDATE',[enrollment,id]);
      const e=result.rows[0];
      if(!e) throw new AppError('NOT_FOUND','Không tìm thấy học sinh trong lớp.',404);
      if(input.data.action==='approve'){
        if(e.status==='active') return {ok:true};
        if(c.archived||e.status!=='pending') throw new AppError('INVALID_STATE','Yêu cầu không còn chờ duyệt.',409);
        await activateEnrollment(client,c,e.learner_id);
      } else {
        const expected=input.data.action==='end'?'active':'pending';
        if(e.status!==expected) throw new AppError('INVALID_STATE','Trạng thái theo học đã thay đổi.',409);
        await client.query('UPDATE class_enrollments SET status=$2,ended_at=now() WHERE id=$1',[enrollment,input.data.action==='end'?'ended':'rejected']);
      }
      return {ok:true};
    });
  }

  @Post('teacher/classroom/classes/:id/roster')
  @UseGuards(TeacherSessionGuard)
  async addToRoster(@Req() req:any,@Param('id') id:string,@Body() body:unknown) {
    const classroom = await this.owned(req.actor.teacherId,id);
    const input = z.object({emails:z.array(z.string().trim().email().max(254)).min(1).max(50)}).safeParse(body);
    if (!input.success) throw new AppError('INVALID_ROSTER','Nhập từ 1 đến 50 email tài khoản học sinh hợp lệ.',400);
    const emails = [...new Set(input.data.emails.map(email=>email.toLowerCase()))];
    return this.db.withTransaction(async client=>{
      const {rows:[current]} = await client.query('SELECT archived,name FROM school_classes WHERE id=$1 FOR UPDATE',[id]);
      if (!current || current.archived) throw new AppError('CLASS_ARCHIVED','Lớp đã lưu trữ.',409);
      const {rows:learners} = await client.query(
        `SELECT l.id FROM learners l WHERE l.email=ANY($1::text[]) AND l.status='active'
         AND EXISTS (SELECT 1 FROM class_enrollments e JOIN school_classes c ON c.id=e.class_id
           WHERE e.learner_id=l.id AND ((c.school_id=$2 AND e.status='active')
             OR (e.class_id=$3 AND e.status='pending'))) ORDER BY l.id`,
        [emails,classroom.school_id,id]);
      if (learners.length!==emails.length) {
        throw new AppError('LEARNER_UNAVAILABLE','Có email chưa thuộc trường hoặc chưa gửi yêu cầu vào lớp. Gửi lời mời để bé tham gia bằng mã.',404);
      }
      for (const learner of learners) await activateEnrollment(client,{...classroom,name:current.name},learner.id);
      return {ok:true};
    });
  }

  @Post('teacher/classroom/classes/:id/enrollments/:enrollment/transfer')
  @UseGuards(TeacherSessionGuard)
  async transfer(@Req() req:any,@Param('id') id:string,@Param('enrollment') enrollment:string,@Body() body:unknown) {
    const input = z.object({destinationId:uuid}).safeParse(body);
    if (!input.success || !uuid.safeParse(enrollment).success) {
      throw new AppError('INVALID_TRANSFER','Chọn học sinh và một lớp đích khác.',400);
    }
    return this.moveEnrollments(req.actor.teacherId,id,input.data.destinationId,[enrollment]);
  }

  @Post('teacher/classroom/classes/:id/transfers')
  @UseGuards(TeacherSessionGuard)
  async transferGroup(@Req() req:any,@Param('id') id:string,@Body() body:unknown) {
    const input = z.object({destinationId:uuid,mode:z.enum(['transfer','promote']),enrollmentIds:z.array(uuid).min(1)}).safeParse(body);
    if (!input.success) throw new AppError('INVALID_TRANSFER','Chọn học sinh và lớp đích.',400);
    const {destinationId,enrollmentIds,mode} = input.data;
    return this.moveEnrollments(req.actor.teacherId,id,destinationId,enrollmentIds,mode);
  }

  private async moveEnrollments(teacher:string,id:string,destinationId:string,enrollmentIds:string[],mode?:'transfer'|'promote') {
    const [source,destination] = await Promise.all([this.owned(teacher,id),this.owned(teacher,destinationId)]);
    if (source.id===destination.id) throw new AppError('INVALID_TRANSFER','Chọn một lớp đích khác.',400);
    if (source.school_id!==destination.school_id) throw new AppError('INVALID_TRANSFER','Hai lớp cần thuộc cùng một trường.',400);
    if (mode==='transfer' && source.year_id!==destination.year_id) {
      throw new AppError('INVALID_TRANSFER','Chọn lớp trong cùng năm học để chuyển lớp.',400);
    }
    const start = schoolYearStart(source.year);
    if (mode==='promote' && (start===null || schoolYearStart(destination.year)!==start+1)) {
      throw new AppError('INVALID_PROMOTION','Chọn lớp thuộc năm học kế tiếp.',400);
    }
    const ids = [...new Set(enrollmentIds.map(value=>value.toLowerCase()))];
    return this.db.withTransaction(async client=>{
      const {rows:classes} = await client.query('SELECT id,name,archived FROM school_classes WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE',[[source.id,destination.id]]);
      const {rows:members} = await client.query(
        'SELECT id,learner_id,status,context_id,transfer_to_class_id FROM class_enrollments WHERE id=ANY($1::uuid[]) AND class_id=$2 ORDER BY learner_id FOR UPDATE',
        [ids,source.id]);
      if (members.length!==ids.length) throw new AppError('NOT_FOUND','Có học sinh không thuộc lớp này.',404);
      const remaining = members.filter(member=>member.status!=='ended'||member.transfer_to_class_id!==destination.id);
      if (!remaining.length) return {ok:true};
      const target = classes.find(value=>value.id===destination.id);
      if (!target || classes.length!==2 || classes.some(value=>value.archived) || remaining.some(member=>member.status!=='active')) {
        throw new AppError('INVALID_TRANSFER','Có học sinh hoặc lớp đã đổi trạng thái. Kiểm tra lại danh sách đã chọn.',409);
      }
      for (const member of remaining) {
        const contextId = await activateEnrollment(client,{...destination,name:target.name},member.learner_id);
        await client.query("UPDATE class_enrollments SET status='ended',ended_at=now(),transfer_to_class_id=$2 WHERE id=$1",[member.id,destination.id]);
        await client.query('UPDATE learner_personal_information SET context_id=$2 WHERE learner_id=$1 AND context_id=$3',[member.learner_id,contextId,member.context_id]);
      }
      return {ok:true};
    });
  }

  @Post('learner-ocean/join-class')
  async join(@Req() req:any,@Body() body:unknown) {
    const actor=await this.auth.resolveActorFromRequest(req);
    if(actor?.kind!=='student') throw new AppError('UNAUTHORIZED','Bé cần đăng nhập.',401);
    const input=z.object({code:z.string().trim().min(6).max(32)}).safeParse(body);
    if(!input.success) throw new AppError('INVALID_CODE','Nhập mã tham gia lớp.',400);
    const shortCode = input.data.code.toUpperCase().replace(/[\s-]/g,'').replace(/^([A-Z2-9]{4})([A-Z2-9]{4})$/,'$1-$2');
    return this.db.withTransaction(async client=>{
      const {rows:[classroom]}=await client.query(
        `SELECT c.id,c.name,c.requires_approval,s.name AS school,y.name AS year
         FROM school_classes c JOIN schools s ON s.id=c.school_id JOIN school_years y ON y.id=c.year_id
         WHERE (c.invite_code=$1 OR c.legacy_invite_code=$2) AND c.invite_expires_at>now() AND NOT c.archived
         FOR UPDATE OF c`,[shortCode,input.data.code.toLowerCase()]);
      if(!classroom) throw new AppError('INVALID_CODE','Mã lớp đã hết hạn hoặc không tồn tại.',404);
      const enrollmentKey=[classroom.id,actor.learnerId];
      const lookup='SELECT id,status FROM class_enrollments WHERE class_id=$1 AND learner_id=$2';
      if(!classroom.requires_approval && !(await client.query(lookup,enrollmentKey)).rowCount) {
        await activateEnrollment(client,classroom,actor.learnerId);
        return (await client.query(lookup,enrollmentKey)).rows[0];
      }
      const {rows:[enrollment]}=await client.query(
        `INSERT INTO class_enrollments(class_id,learner_id) VALUES($1,$2)
         ON CONFLICT(class_id,learner_id) DO UPDATE SET
           requested_at=CASE WHEN class_enrollments.status IN ('rejected','ended') THEN now() ELSE class_enrollments.requested_at END,
           status=CASE WHEN class_enrollments.status IN ('rejected','ended') THEN 'pending' ELSE class_enrollments.status END
         RETURNING id,status`,enrollmentKey);
      return enrollment;
    });
  }

  @Get('learner-ocean/enrollments')
  async enrollments(@Req() req:any) {
    const actor=await this.auth.resolveActorFromRequest(req);
    if(actor?.kind!=='student') throw new AppError('UNAUTHORIZED','Bé cần đăng nhập.',401);
    const {rows}=await this.db.query('SELECT e.id,e.status,e.context_id AS "contextId",c.archived,c.name AS "className",s.name AS school,y.name AS "schoolYear" FROM class_enrollments e JOIN school_classes c ON c.id=e.class_id JOIN schools s ON s.id=c.school_id JOIN school_years y ON y.id=c.year_id WHERE e.learner_id=$1 ORDER BY e.requested_at DESC',[actor.learnerId]);
    return {items:rows};
  }

  @Post('learner-ocean/active-class')
  async activeClass(@Req() req:any,@Body() body:unknown) {
    const actor=await this.auth.resolveActorFromRequest(req);
    if(actor?.kind!=='student') throw new AppError('UNAUTHORIZED','Bé cần đăng nhập.',401);
    const input=z.object({contextId:uuid}).safeParse(body);
    if(!input.success) throw new AppError('INVALID_CONTEXT','Lớp không hợp lệ.',400);
    const result=await this.db.query("INSERT INTO learner_personal_information(learner_id,context_id) SELECT e.learner_id,e.context_id FROM class_enrollments e JOIN school_classes c ON c.id=e.class_id WHERE e.learner_id=$1 AND e.context_id=$2 AND e.status='active' AND NOT c.archived ON CONFLICT(learner_id) DO UPDATE SET context_id=EXCLUDED.context_id RETURNING context_id",[actor.learnerId,input.data.contextId]);
    if(!result.rowCount) throw new AppError('NOT_FOUND','Lớp chưa được xác nhận hoặc đã ngừng hoạt động.',404);
    return {ok:true};
  }
}

