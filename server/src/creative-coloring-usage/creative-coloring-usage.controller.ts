import {Controller,Post,Get,Body,Param,Query,Req,Res,Inject,UseGuards} from '@nestjs/common';
import {TeacherSessionGuard} from '../auth/session.guard.js';
import {CreativeColoringUsageService} from './creative-coloring-usage.service.js';
@Controller('api/v1')
export class CreativeColoringUsageController{
 constructor(@Inject(CreativeColoringUsageService)private service:CreativeColoringUsageService){}
 @Post('creative-coloring-usage/runs') open(@Req()r:any,@Body()b:unknown){return this.service.open(b,r.ip||'unknown');}
 @Post('creative-coloring-usage/runs/:id/events') events(@Req()r:any,@Param('id')id:string,@Body()b:unknown){return this.service.events(id,r.headers['x-participant-token']||'',b);}
 @Get('teacher/creative-coloring-usage') @UseGuards(TeacherSessionGuard) report(@Query()q:any){return this.service.report(q);}
 @Get('teacher/creative-coloring-usage/export.csv') @UseGuards(TeacherSessionGuard) async csv(@Query()q:any,@Res()res:any){res.setHeader('Content-Type','text/csv; charset=utf-8');res.setHeader('Content-Disposition','attachment; filename="khao-sat-to-mau.csv"');res.send(await this.service.csv(q));}
 @Get('teacher/creative-coloring-usage/contents/:id') @UseGuards(TeacherSessionGuard) detail(@Param('id')id:string,@Query()q:any){return this.service.report({...q,contentId:id});}
}
