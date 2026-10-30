import {
  Controller,
  Inject,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service.js';
import { rejectInteractiveWrite } from './interactive-read-only.js';
import { TeacherSessionGuard } from '../../auth/session.guard.js';

function parseStringList(val?: string | string[]): string[] | undefined {
  if (!val) return undefined;
  const raw = Array.isArray(val) ? val : val.split(',');
  const cleaned = raw.map((s) => s.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned : undefined;
}

@Controller('api/v1')
export class ActivitiesController {
  constructor(
    @Inject(ActivitiesService) private readonly activitiesService: ActivitiesService,
  ) {}

  @Get('activities')
  async listPublicActivities(
    @Query('kind') kind?: string,
    @Query('groupId') groupId?: string,
    @Query('topicIds') topicIds?: string | string[],
    @Query('q') q?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activitiesService.listActivities({
      isTeacher: false,
      kind,
      groupId,
      topicIds: parseStringList(topicIds),
      q,
      cursor,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get('activities/:id')
  async getPublicActivity(@Param('id') id: string) {
    return this.activitiesService.getActivityById(id, { isTeacher: false });
  }

  @Get('teacher/activities')
  @UseGuards(TeacherSessionGuard)
  async listTeacherActivities(
    @Req() req: any,
    @Query('kind') kind?: string,
    @Query('groupId') groupId?: string,
    @Query('topicIds') topicIds?: string | string[],
    @Query('q') q?: string,
    @Query('visibility') visibility?: string,
    @Query('source') source?: 'all' | 'owned' | 'seed',
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activitiesService.listActivities({
      isTeacher: false,
      teacherId: req.actor.teacherId,
      kind,
      groupId,
      topicIds: parseStringList(topicIds),
      q,
      visibility,
      source,
      cursor,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get('teacher/activities/:id')
  @UseGuards(TeacherSessionGuard)
  async getTeacherActivity(@Req() req: any, @Param('id') id: string) {
    return this.activitiesService.getActivityById(id, {
      isTeacher: false,
      teacherId: req.actor.teacherId,
    });
  }

  @Post('teacher/activities')
  @UseGuards(TeacherSessionGuard)
  @HttpCode(HttpStatus.CREATED)
  async createTeacherActivity(@Req() req: any, @Body() body: any) {
    return rejectInteractiveWrite();
  }

  @Patch('teacher/activities/:id')
  @UseGuards(TeacherSessionGuard)
  async updateTeacherActivity(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return rejectInteractiveWrite();
  }

  @Post('teacher/activities/:id/duplicate')
  @UseGuards(TeacherSessionGuard)
  @HttpCode(HttpStatus.CREATED)
  async duplicateTeacherActivity(@Req() req: any, @Param('id') id: string) {
    return rejectInteractiveWrite();
  }

  @Delete('teacher/activities/:id')
  @UseGuards(TeacherSessionGuard)
  async deleteTeacherActivity(@Req() req: any, @Param('id') id: string) {
    return rejectInteractiveWrite();
  }
}
