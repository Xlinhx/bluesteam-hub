import fs from 'node:fs';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { TeacherAuthGuard } from '../auth/teacher-auth.guard';
import { AppHttpException } from '../common/errors';
import { ArtworksService } from './artworks.service';

@Controller('api/v1')
export class ArtworksController {
  constructor(
    @Inject(ArtworksService) private readonly artworksService: ArtworksService,
  ) {}

  private getTeacherId(req: Request & { teacher?: { id: string } }): string {
    const id = req.teacher?.id;
    if (!id) {
      throw new AppHttpException('UNAUTHORIZED', 'Cần đăng nhập tài khoản giáo viên', 401);
    }
    return id;
  }

  @UseGuards(TeacherAuthGuard)
  @Get('teacher/artworks')
  async listTeacherArtworks(
    @Req() req: Request & { teacher?: { id: string } },
    @Query('kind') kind?: 'drawing' | 'habitat',
    @Query('q') q?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const teacherId = this.getTeacherId(req);
    const res = await this.artworksService.listTeacherArtworks({
      teacherId,
      kind: kind === 'drawing' || kind === 'habitat' ? kind : undefined,
      q: q || undefined,
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0,
    });
    return res;
  }

  @UseGuards(TeacherAuthGuard)
  @Get('teacher/artworks/:artworkId')
  async getTeacherArtwork(@Req() req:Request & {teacher?:{id:string}},@Param('artworkId') artworkId:string){
    return {item:await this.artworksService.getTeacherArtwork(this.getTeacherId(req),artworkId)};
  }

  @UseGuards(TeacherAuthGuard)
  @Put('teacher/artworks/:artworkId/note')
  async updateTeacherNotePut(
    @Req() req: Request & { teacher?: { id: string } },
    @Param('artworkId') artworkId: string,
    @Body() body: { note?: string; teacherNote?: string },
  ) {
    const teacherId = this.getTeacherId(req);
    const item = await this.artworksService.updateTeacherNote({
      artworkId,
      teacherId,
      note: body?.note ?? body?.teacherNote ?? '',
    });
    return { item };
  }

  @UseGuards(TeacherAuthGuard)
  @Patch('teacher/artworks/:artworkId/note')
  async updateTeacherNotePatch(
    @Req() req: Request & { teacher?: { id: string } },
    @Param('artworkId') artworkId: string,
    @Body() body: { note?: string; teacherNote?: string },
  ) {
    const teacherId = this.getTeacherId(req);
    const item = await this.artworksService.updateTeacherNote({
      artworkId,
      teacherId,
      note: body?.note ?? body?.teacherNote ?? '',
    });
    return { item };
  }

  @UseGuards(TeacherAuthGuard)
  @Get('teacher/artworks/:artworkId/download')
  async downloadTeacherArtwork(
    @Req() req: Request & { teacher?: { id: string } },
    @Param('artworkId') artworkId: string,
    @Res() res: Response,
  ) {
    const teacherId = this.getTeacherId(req);
    const { streamInfo } = await this.artworksService.getArtworkForTeacherDownload({
      artworkId,
      teacherId,
    });

    res.setHeader('Content-Type', streamInfo.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(streamInfo.originalFilename)}"`,
    );
    res.setHeader('Cache-Control', 'private, no-store');

    const stream = fs.createReadStream(streamInfo.filePath);
    stream.pipe(res);
  }
}
