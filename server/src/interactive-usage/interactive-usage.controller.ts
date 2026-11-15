import { Body, Controller, Get, Headers, Inject, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { InteractiveUsageService } from './interactive-usage.service.js';
import { InteractiveUsageReportService } from './interactive-usage-report.service.js';
import { TeacherSessionGuard } from '../auth/session.guard.js';
import { AuthService } from '../auth/auth.service.js';
import { AppError } from '../common/errors.js';

@Controller('api/v1')
export class InteractiveUsageController {
  private readonly buckets = new Map<string,{count:number;until:number}>();
  constructor(@Inject(InteractiveUsageService) private readonly usage:InteractiveUsageService,@Inject(InteractiveUsageReportService) private readonly reports:InteractiveUsageReportService,@Inject(AuthService) private readonly auth:AuthService){}
  private async check(req: any) {
    const actor=await this.auth.resolveActorFromRequest(req);
    if(actor?.kind==='teacher') throw new AppError('PREVIEW_NOT_TRACKED','Xem thử của cô không được tính vào số liệu.',403);
    const now=Date.now(), key=String(req.ip || 'local');
    if(this.buckets.size>10000) for(const [k,v] of this.buckets) if(v.until<now) this.buckets.delete(k);
    const b=this.buckets.get(key); if(!b || b.until<now)this.buckets.set(key,{count:1,until:now+60000});
    else if(++b.count>600)throw new AppError('RATE_LIMITED','Vui lòng thử lại sau.',429);
    return actor;
  }
  @Post('interactive-usage/runs') async open(@Req() req:any,@Body() body:unknown){const actor=await this.check(req);return this.usage.open(body, actor?.kind==='student' ? actor.learnerId : null);}
  @Post('interactive-usage/runs/:runId/interactions') async record(@Req() req:any,@Param('runId') id:string,@Headers('x-usage-token') token:string,@Body() body:unknown){const actor=await this.check(req);return this.usage.record(id,token,body, actor?.kind==='student' ? actor.learnerId : null);}
  @Get('teacher/interactive-usage') @UseGuards(TeacherSessionGuard) report(@Query() query:Record<string,unknown>){return this.reports.report(query);}
  @Get('teacher/interactive-usage/export.csv') @UseGuards(TeacherSessionGuard) async csv(@Query() query:Record<string,unknown>,@Res() res:any){const csv=await this.reports.csv(query);res.setHeader('Content-Type','text/csv; charset=utf-8');res.setHeader('Content-Disposition','attachment; filename="bluesteam-interactive-usage.csv"');res.send(csv);}
  @Get('teacher/interactive-usage/contents/:id') @UseGuards(TeacherSessionGuard) detail(@Param('id') id:string,@Query() query:Record<string,unknown>){return this.reports.detail(id,query);}
}
