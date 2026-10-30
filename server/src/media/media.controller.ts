import fs from 'node:fs';
import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import busboy from 'busboy';
import { MediaService } from './media.service.js';
import { TeacherSessionGuard } from '../auth/session.guard.js';
import { AuthService } from '../auth/auth.service.js';
import { AppError } from '../common/errors.js';
import type pg from 'pg';
import { Inject } from '@nestjs/common';
import { DB_POOL } from '../database/database.module.js';

export function parseMultipartSingleFile(
  req: any,
  maxBytes = 210 * 1024 * 1024,
): Promise<{
  buffer: Buffer;
  filename: string;
  mimeType: string;
  fields: Record<string, string>;
}> {
  return new Promise((resolve, reject) => {
    const contentType = req.headers?.['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      reject(
        new AppError(
          'INVALID_MULTIPART',
          'Yêu cầu tải tệp phải sử dụng multipart/form-data.',
          HttpStatus.BAD_REQUEST,
        ),
      );
      return;
    }

    const bb = busboy({
      headers: req.headers,
      limits: {
        files: 1,
        fileSize: maxBytes,
      },
    });

    const chunks: Buffer[] = [];
    const fields: Record<string, string> = {};
    let filename = 'upload.bin';
    let mimeType = 'application/octet-stream';
    let hasFile = false;
    let sizeExceeded = false;

    bb.on('field', (name, val) => {
      fields[name] = val;
    });

    bb.on('file', (_name, fileStream, info) => {
      hasFile = true;
      filename = info.filename || 'upload.bin';
      mimeType = info.mimeType || 'application/octet-stream';

      fileStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      fileStream.on('limit', () => {
        sizeExceeded = true;
      });
    });

    bb.on('error', (err: Error) => {
      reject(
        new AppError(
          'MULTIPART_PARSE_ERROR',
          `Lỗi đọc dữ liệu tải lên: ${err.message}`,
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    bb.on('finish', () => {
      if (!hasFile) {
        reject(
          new AppError(
            'MISSING_FILE',
            'Không tìm thấy tệp đính kèm trong yêu cầu tải lên.',
            HttpStatus.BAD_REQUEST,
          ),
        );
        return;
      }
      if (sizeExceeded) {
        reject(
          new AppError(
            'MEDIA_TOO_LARGE',
            'Dung lượng tệp vượt quá giới hạn tối đa cho phép.',
            HttpStatus.PAYLOAD_TOO_LARGE,
          ),
        );
        return;
      }
      resolve({
        buffer: Buffer.concat(chunks),
        filename,
        mimeType,
        fields,
      });
    });

    req.pipe(bb);
  });
}

@Controller('api/v1')
export class MediaController {
  constructor(
    @Inject(MediaService) private readonly mediaService: MediaService,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(DB_POOL) private readonly pool: pg.Pool,
  ) {}

  @Post('teacher/media')
  @UseGuards(TeacherSessionGuard)
  @HttpCode(HttpStatus.CREATED)
  async uploadTeacherMedia(@Req() req: any) {
    const actor = req.actor;
    const parsed = await parseMultipartSingleFile(req);
    return this.mediaService.saveUploadedMedia({
      ownerId: actor.teacherId,
      buffer: parsed.buffer,
      declaredMime: parsed.mimeType,
      originalFilename: parsed.filename,
    });
  }

  @Get('teacher/media')
  @UseGuards(TeacherSessionGuard)
  async listTeacherMedia(@Req() req: any, @Query('kind') kind = 'image', @Query('q') q = '', @Query('cursor') cursor = '0') {
    const offset = Number(cursor);
    if (!['image', 'audio'].includes(kind) || !Number.isSafeInteger(offset) || offset < 0) throw new AppError('INVALID_MEDIA_QUERY', 'Bộ lọc media không hợp lệ.');
    const result = await this.pool.query(`SELECT m.* FROM media_assets m
      WHERE m.kind=$1 AND m.status='ready' AND (m.owner_id=$2 OR m.owner_id IS NULL)
        AND m.original_filename ILIKE $3
        AND NOT EXISTS (SELECT 1 FROM artworks a WHERE a.source_media_id=m.id OR a.preview_media_id=m.id)
      ORDER BY m.created_at DESC,m.id DESC LIMIT 25 OFFSET $4`, [kind, req.actor.teacherId, `%${q.trim()}%`, offset]);
    const items = result.rows.slice(0, 24).map(row => ({ id: row.id, kind: row.kind, mimeType: row.mime_type,
      byteSize: Number(row.byte_size), width: row.width, height: row.height, durationMs: row.duration_ms,
      sha256: row.sha256, status: row.status, url: row.storage_key.startsWith('/assets/') ? row.storage_key : `/api/v1/media/${row.id}` }));
    return { items, nextCursor: result.rows.length > 24 ? String(offset + 24) : null };
  }

  @Get('media/:id')
  async streamMedia(
    @Param('id') id: string,
    @Query('download') download: string | undefined,
    @Req() req: any,
    @Res() res: any,
  ) {
    const media = await this.mediaService.getMediaForStream(id);

    const artworkCheck = await this.pool.query(
      'SELECT owner_id FROM artworks WHERE source_media_id = $1 OR preview_media_id = $1', [media.id]);
    if (artworkCheck.rows.length) {
      const actor = await this.authService.resolveActorFromRequest(req);
      if (!actor || actor.kind !== 'teacher' || !artworkCheck.rows.some(row => row.owner_id === actor.teacherId)) {
        res.status(HttpStatus.FORBIDDEN).json({code:'FORBIDDEN_PRIVATE_MEDIA',message:'Bạn không có quyền truy cập tác phẩm này.'});
        return;
      }
      res.setHeader('Cache-Control', 'private, no-store');
    }
    const safeFilename = media.originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const disposition = download === '1' || download === 'true' ? 'attachment' : 'inline';

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Type', media.mimeType);
    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename="${safeFilename}"`,
    );

    const stream = fs.createReadStream(media.filePath);
    stream.pipe(res);
  }
}
