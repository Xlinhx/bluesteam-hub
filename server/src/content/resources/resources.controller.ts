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
import { ResourcesService } from './resources.service.js';
import { TeacherSessionGuard } from '../../auth/session.guard.js';

function parseStringList(val?: string | string[]): string[] | undefined {
  if (!val) return undefined;
  const raw = Array.isArray(val) ? val : val.split(',');
  const cleaned = raw.map((s) => s.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned : undefined;
}

@Controller('api/v1')
export class ResourcesController {
  constructor(
    @Inject(ResourcesService) private readonly resourcesService: ResourcesService,
  ) {}

  @Get('resources')
  async listPublicResources(
    @Query('capability') capability?:'screen'|'print'|'all',
    @Query('kind') kind?: string,
    @Query('topicIds') topicIds?: string | string[],
    @Query('q') q?: string,
    @Query('savedIds') savedIds?: string | string[],
    @Query('cursor') cursor?: string,
    @Query('before') before?: string,
    @Query('limit') limit?: string,
    @Query('groupId') groupId?: string,
    @Query('library') library?: string,
    @Query('page') page?: string,
  ) {
    return this.resourcesService.listResources({
      isTeacher: false,capability, library: library === '1',
      groupId,
      kind,
      topicIds: parseStringList(topicIds),
      q,
      savedIds: savedIds !== undefined ? parseStringList(savedIds) || [] : undefined,
      cursor,
      before,
      page: page === undefined ? undefined : Number(page),
      limit: limit ? Number(limit) : 12,
    });
  }

  @Get('resources/:id')
  async getPublicResource(@Param('id') id: string) {
    return this.resourcesService.getResourceById(id, { isTeacher: false });
  }

  @Get('teacher/resources')
  @UseGuards(TeacherSessionGuard)
  async listTeacherResources(
    @Req() req: any,
    @Query('kind') kind?: string,
    @Query('topicIds') topicIds?: string | string[],
    @Query('q') q?: string,
    @Query('visibility') visibility?: string,
    @Query('source') source?: 'all' | 'owned' | 'seed',
    @Query('membershipGroupId') membershipGroupId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('groupId') groupId?: string,
    @Query('page') page?: string,
  ) {
    return this.resourcesService.listResources({
      isTeacher: true,
      groupId,
      teacherId: req.actor.teacherId,
      membershipGroupId,
      kind,
      topicIds: parseStringList(topicIds),
      q,
      visibility,
      source,
      cursor,
      page: page === undefined ? undefined : Number(page),
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get('teacher/resources/:id')
  @UseGuards(TeacherSessionGuard)
  async getTeacherResource(@Req() req: any, @Param('id') id: string) {
    return this.resourcesService.getResourceById(id, {
      isTeacher: true,
      teacherId: req.actor.teacherId,
    });
  }

  @Post('teacher/resources')
  @UseGuards(TeacherSessionGuard)
  @HttpCode(HttpStatus.CREATED)
  async createTeacherResource(@Req() req: any, @Body() body: any) {
    return this.resourcesService.createTeacherResource(req.actor.teacherId, body || {});
  }

  @Patch('teacher/resources/:id')
  @UseGuards(TeacherSessionGuard)
  async updateTeacherResource(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.resourcesService.updateTeacherResource(
      req.actor.teacherId,
      id,
      body || {},
    );
  }

  @Post('teacher/resources/:id/duplicate')
  @UseGuards(TeacherSessionGuard)
  @HttpCode(HttpStatus.CREATED)
  async duplicateTeacherResource(@Req() req: any, @Param('id') id: string) {
    return this.resourcesService.duplicateResource(req.actor.teacherId, id);
  }

  @Delete('teacher/resources/:id')
  @UseGuards(TeacherSessionGuard)
  async deleteTeacherResource(@Req() req: any, @Param('id') id: string) {
    return this.resourcesService.deleteHiddenResource(req.actor.teacherId, id);
  }
}
