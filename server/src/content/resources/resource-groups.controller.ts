import { Controller, Inject, Get, Post, Patch, Delete, Param, Query, Body, Req, UseGuards } from '@nestjs/common';
import { TeacherSessionGuard } from '../../auth/session.guard.js';
import { ResourceGroupsService } from './resource-groups.service.js';

@Controller('api/v1')
export class ResourceGroupsController {
  constructor(@Inject(ResourceGroupsService) private readonly groups: ResourceGroupsService) {}
  @Get('resource-groups')
  list(@Query('q') q?: string, @Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    return this.groups.list({ q, cursor, limit: Number(limit) });
  }
  @Get('teacher/resource-groups') @UseGuards(TeacherSessionGuard)
  teacherList(@Req() req: any, @Query('q') q?: string, @Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    return this.groups.list({ teacherId: req.actor.teacherId, q, cursor, limit: Number(limit) });
  }
  @Post('teacher/resource-groups') @UseGuards(TeacherSessionGuard)
  create(@Req() req: any, @Body() body: unknown) { return this.groups.save(req.actor.teacherId, body); }
  @Get('resource-groups/:id')
  get(@Param('id') id: string) { return this.groups.get(id); }
  @Get('teacher/resource-groups/:id') @UseGuards(TeacherSessionGuard)
  teacherGet(@Req() req: any, @Param('id') id: string) { return this.groups.get(id, req.actor.teacherId); }
  @Patch('teacher/resource-groups/:id') @UseGuards(TeacherSessionGuard)
  update(@Req() req: any, @Param('id') id: string, @Body() body: unknown) { return this.groups.save(req.actor.teacherId, body, id); }
  @Post('teacher/resource-groups/:id/members') @UseGuards(TeacherSessionGuard)
  add(@Req() req: any, @Param('id') id: string, @Body() body: unknown) { return this.groups.members(req.actor.teacherId, id, body); }
  @Delete('teacher/resource-groups/:id/members') @UseGuards(TeacherSessionGuard)
  unlink(@Req() req: any, @Param('id') id: string, @Body() body: unknown) { return this.groups.members(req.actor.teacherId, id, body, true); }
  @Delete('teacher/resource-groups/:id') @UseGuards(TeacherSessionGuard)
  remove(@Req() req: any, @Param('id') id: string) { return this.groups.remove(req.actor.teacherId, id); }
  @Post('teacher/resource-groups/:id/duplicate') @UseGuards(TeacherSessionGuard)
  duplicate(@Req() req: any, @Param('id') id: string) { return this.groups.duplicate(req.actor.teacherId, id); }
}
