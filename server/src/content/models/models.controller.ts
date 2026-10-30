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
import { ModelsService } from './models.service.js';
import { rejectInteractiveWrite } from '../activities/interactive-read-only.js';
import { TeacherSessionGuard } from '../../auth/session.guard.js';

function parseStringList(val?: string | string[]): string[] | undefined {
  if (!val) return undefined;
  const raw = Array.isArray(val) ? val : val.split(',');
  const cleaned = raw.map((s) => s.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned : undefined;
}

@Controller('api/v1')
export class ModelsController {
  constructor(@Inject(ModelsService) private readonly modelsService: ModelsService) {}

  @Get('models')
  async listPublicModels(
    @Query('topicIds') topicIds?: string | string[],
    @Query('q') q?: string,
    @Query('groupId') groupId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.modelsService.listModels({
      isTeacher: false,
      topicIds: parseStringList(topicIds),
      q,
      groupId,
      cursor,
      limit: limit ? Number(limit) : 9,
    });
  }

  @Get('models/:id')
  async getPublicModel(@Param('id') id: string) {
    return this.modelsService.getModelById(id, { isTeacher: false });
  }

  @Get('teacher/models')
  @UseGuards(TeacherSessionGuard)
  async listTeacherModels(
    @Req() req: any,
    @Query('topicIds') topicIds?: string | string[],
    @Query('q') q?: string,
    @Query('groupId') groupId?: string,
    @Query('visibility') visibility?: string,
    @Query('source') source?: 'all' | 'owned' | 'seed',
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.modelsService.listModels({
      isTeacher: false,
      teacherId: req.actor.teacherId,
      topicIds: parseStringList(topicIds),
      q,
      groupId,
      visibility,
      source,
      cursor,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get('teacher/models/:id')
  @UseGuards(TeacherSessionGuard)
  async getTeacherModel(@Req() req: any, @Param('id') id: string) {
    return this.modelsService.getModelById(id, {
      isTeacher: false,
      teacherId: req.actor.teacherId,
    });
  }

  @Post('teacher/models')
  @UseGuards(TeacherSessionGuard)
  @HttpCode(HttpStatus.CREATED)
  async createTeacherModel(@Req() req: any, @Body() body: any) {
    return rejectInteractiveWrite();
  }

  @Patch('teacher/models/:id')
  @UseGuards(TeacherSessionGuard)
  async updateTeacherModel(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return rejectInteractiveWrite();
  }

  @Post('teacher/models/:id/duplicate')
  @UseGuards(TeacherSessionGuard)
  @HttpCode(HttpStatus.CREATED)
  async duplicateTeacherModel(@Req() req: any, @Param('id') id: string) {
    return rejectInteractiveWrite();
  }

  @Delete('teacher/models/:id')
  @UseGuards(TeacherSessionGuard)
  async deleteTeacherModel(@Req() req: any, @Param('id') id: string) {
    return rejectInteractiveWrite();
  }
}
