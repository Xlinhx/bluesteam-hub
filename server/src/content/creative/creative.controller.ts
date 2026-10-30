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
import { CreativeService } from './creative.service.js';
import { TeacherSessionGuard } from '../../auth/session.guard.js';

function parseStringList(val?: string | string[]): string[] | undefined {
  if (!val) return undefined;
  const raw = Array.isArray(val) ? val : val.split(',');
  const cleaned = raw.map((s) => s.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned : undefined;
}

@Controller('api/v1')
export class CreativeController {
  constructor(@Inject(CreativeService) private readonly creativeService: CreativeService) {}

  @Get('creative-templates')
  async listPublicTemplates(
    @Query('kind') kind?: string,
    @Query('topicIds') topicIds?: string | string[],
    @Query('q') q?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.creativeService.listTemplates({
      isTeacher: false,
      kind,
      topicIds: parseStringList(topicIds),
      q,
      cursor,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get('creative-materials')
  async listPublicMaterials(
    @Query('kind') kind?: string,
    @Query('q') q?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.creativeService.listMaterials({
      isTeacher: false,
      kind,
      q,
      cursor,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get('teacher/creative-templates')
  @UseGuards(TeacherSessionGuard)
  async listTeacherTemplates(
    @Req() req: any,
    @Query('kind') kind?: string,
    @Query('topicIds') topicIds?: string | string[],
    @Query('q') q?: string,
    @Query('visibility') visibility?: string,
    @Query('source') source?: 'all' | 'owned' | 'seed',
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.creativeService.listTemplates({
      isTeacher: true,
      teacherId: req.actor.teacherId,
      kind,
      topicIds: parseStringList(topicIds),
      q,
      visibility,
      source,
      cursor,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Post('teacher/creative-templates')
  @UseGuards(TeacherSessionGuard)
  @HttpCode(HttpStatus.CREATED)
  async createTeacherTemplate(@Req() req: any, @Body() body: any) {
    return this.creativeService.createTeacherTemplate(req.actor.teacherId, body || {});
  }

  @Get('teacher/creative-templates/:id')
  @UseGuards(TeacherSessionGuard)
  async getTeacherTemplate(@Req() req: any, @Param('id') id: string) {
    return this.creativeService.getTemplateById(id, { isTeacher: true, teacherId: req.actor.teacherId });
  }

  @Get('creative-templates/:id')
  async getPublicTemplate(@Param('id') id: string) {
    return this.creativeService.getTemplateById(id, { isTeacher: false });
  }

  @Patch('teacher/creative-templates/:id')
  @UseGuards(TeacherSessionGuard)
  async updateTeacherTemplate(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.creativeService.updateTeacherTemplate(req.actor.teacherId, id, body || {});
  }

  @Post('teacher/creative-templates/:id/duplicate')
  @UseGuards(TeacherSessionGuard)
  @HttpCode(HttpStatus.CREATED)
  async duplicateTeacherTemplate(@Req() req: any, @Param('id') id: string) {
    return this.creativeService.duplicateTemplateToDraft(req.actor.teacherId, id);
  }

  @Delete('teacher/creative-templates/:id')
  @UseGuards(TeacherSessionGuard)
  async deleteTeacherTemplate(@Req() req: any, @Param('id') id: string) {
    return this.creativeService.deleteDraftTemplate(req.actor.teacherId, id);
  }

  @Get('teacher/creative-materials')
  @UseGuards(TeacherSessionGuard)
  async listTeacherMaterials(
    @Req() req: any,
    @Query('kind') kind?: string,
    @Query('q') q?: string,
    @Query('visibility') visibility?: string,
    @Query('source') source?: 'all' | 'owned' | 'seed',
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.creativeService.listMaterials({
      isTeacher: true,
      teacherId: req.actor.teacherId,
      kind,
      q,
      visibility,
      source,
      cursor,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Post('teacher/creative-materials')
  @UseGuards(TeacherSessionGuard)
  @HttpCode(HttpStatus.CREATED)
  async createTeacherMaterial(@Req() req: any, @Body() body: any) {
    return this.creativeService.createTeacherMaterial(req.actor.teacherId, body || {});
  }

  @Patch('teacher/creative-materials/:id')
  @UseGuards(TeacherSessionGuard)
  async updateTeacherMaterial(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.creativeService.updateTeacherMaterial(req.actor.teacherId, id, body || {});
  }

  @Delete('teacher/creative-materials/:id')
  @UseGuards(TeacherSessionGuard)
  async deleteTeacherMaterial(@Req() req: any, @Param('id') id: string) {
    return this.creativeService.deleteDraftMaterial(req.actor.teacherId, id);
  }

  @Post('teacher/creative-materials/:id/duplicate')
  @UseGuards(TeacherSessionGuard)
  async duplicateMaterial(@Req() req: any, @Param('id') id: string) {
    return this.creativeService.duplicateMaterialToDraft(req.actor.teacherId, id);
  }
}
