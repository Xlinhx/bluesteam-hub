import {Body,Controller,Get,Inject,Param,Post,Query,Req,UseGuards} from '@nestjs/common';
import {TeacherSessionGuard} from '../auth/session.guard.js';
import {CreativeSessionsService} from './creative-sessions.service.js';
@Controller('api/v1')
export class CreativeSessionsController{
 constructor(@Inject(CreativeSessionsService)private readonly service:CreativeSessionsService){}
 @Get('teacher/creative-sessions') @UseGuards(TeacherSessionGuard) list(@Req()r:any,@Query('offset')offset?:string,@Query('kind')kind?:string){return this.service.list(r.actor.teacherId,Number(offset)||0,kind);}
 @Post('teacher/creative-sessions') @UseGuards(TeacherSessionGuard) create(@Req()r:any,@Body()b:unknown){return this.service.create(r.actor.teacherId,b);}
 @Get('teacher/creative-sessions/stats') @UseGuards(TeacherSessionGuard) stats(@Req()r:any){return this.service.stats(r.actor.teacherId);}
 @Get('teacher/creative-sessions/:id') @UseGuards(TeacherSessionGuard) detail(@Req()r:any,@Param('id')id:string,@Query()q:any){return this.service.detail(r.actor.teacherId,id,Number(q.offset)||0,{status:q.status,source:q.source,q:q.q,seaOffset:Number(q.seaOffset)||0,selected:q.selected});}
 @Post('teacher/creative-sessions/:id/state') @UseGuards(TeacherSessionGuard) state(@Req()r:any,@Param('id')id:string,@Body()b:unknown){return this.service.state(r.actor.teacherId,id,b);}
 @Post('teacher/creative-sessions/:id/invite') @UseGuards(TeacherSessionGuard) invite(@Req()r:any,@Param('id')id:string,@Body()b:any){return this.service.invite(r.actor.teacherId,id,b?.role==='operator'?'operator':'display');}
 @Post('teacher/creative-submissions/:id') @UseGuards(TeacherSessionGuard) update(@Req()r:any,@Param('id')id:string,@Body()b:unknown){return this.service.updateSubmission(r.actor.teacherId,id,b);}
 @Post('creative-sessions/join') join(@Req()r:any,@Body()b:any){return this.service.join(String(b?.code||''),r.ip||'unknown');}
 @Get('creative-sessions/context') context(@Req()r:any){return this.service.context(r.headers['x-participant-token']||'');}
 @Get('teacher/creative-sessions/:id/projects') @UseGuards(TeacherSessionGuard) projects(@Req()r:any,@Param('id')id:string,@Query('offset')offset?:string,@Query('q')q?:string){return this.service.projects(r.actor.teacherId,id,Number(offset)||0,q);}
 @Get('teacher/creative-sessions/:id/projects/:key/revisions') @UseGuards(TeacherSessionGuard) revisions(@Req()r:any,@Param('id')id:string,@Param('key')key:string,@Query('offset')offset?:string){return this.service.revisions(r.actor.teacherId,id,key,Number(offset)||0);}
 @Post('creative-sessions/media') upload(@Req()r:any,@Body()b:unknown){return this.service.upload(r.headers['x-participant-token']||'',b);}
 @Post('creative-sessions/submissions') submit(@Req()r:any,@Body()b:unknown){return this.service.submit(r.headers['x-participant-token']||'',b);}
 @Get('creative-sessions/display') display(@Req()r:any,@Query('offset')offset?:string){return this.service.display(r.headers['x-participant-token']||'',Number(offset)||0);}
 @Get('creative-sessions/events') events(@Req()r:any,@Query('after')after?:string){return this.service.events(r.headers['x-participant-token']||'',Math.max(0,Number(after)||0));}
}
