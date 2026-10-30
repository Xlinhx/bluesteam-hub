import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { TeacherSessionGuard } from '../../auth/session.guard.js';
import { InteractiveGroupsService } from './interactive-groups.service.js';
import { rejectInteractiveWrite } from './interactive-read-only.js';

@Controller('api/v1')
export class InteractiveGroupsController {
  constructor(@Inject(InteractiveGroupsService) private readonly groups: InteractiveGroupsService) {}
  @Get('interactive-groups') list(@Query('kind') kind?: string,@Query('cursor') cursor?: string) { return this.groups.list({kind,cursor}); }
  @Get('teacher/interactive-groups') @UseGuards(TeacherSessionGuard)
  listTeacher(@Req() req: any,@Query('kind') kind?: string,@Query('cursor') cursor?: string) { return this.groups.list({kind,cursor}); }
  @Post('teacher/interactive-groups') @UseGuards(TeacherSessionGuard)
  create(@Req() req: any,@Body() body: unknown) { return rejectInteractiveWrite(); }
  @Patch('teacher/interactive-groups/:id') @UseGuards(TeacherSessionGuard)
  update(@Req() req: any,@Param('id') id: string,@Body() body: unknown) { return rejectInteractiveWrite(); }
  @Post('teacher/interactive-groups/:id/members') @UseGuards(TeacherSessionGuard)
  add(@Req() req: any,@Param('id') id: string,@Body() body: unknown) { return rejectInteractiveWrite(); }
  @Delete('teacher/interactive-groups/:id/members') @UseGuards(TeacherSessionGuard)
  removeMembers(@Req() req: any,@Param('id') id: string,@Body() body: unknown) { return rejectInteractiveWrite(); }
  @Delete('teacher/interactive-groups/:id') @UseGuards(TeacherSessionGuard)
  remove(@Req() req: any,@Param('id') id: string) { return rejectInteractiveWrite(); }
}
