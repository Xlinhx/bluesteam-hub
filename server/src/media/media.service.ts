import fs from 'node:fs';
import crypto from 'node:crypto';
import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import type pg from 'pg';
import { DB_POOL } from '../database/database.module.js';
import { LocalStorageAdapter, MEDIA_STORAGE_DIR_TOKEN } from './storage.adapter.js';
import { AppError } from '../common/errors.js';
import { assertValidUuid } from '../common/validation.js';

const MAX_BYTES_BY_KIND: Record<'image' | 'audio' | 'video' | 'pdf', number> = {
  image: 10 * 1024 * 1024, // 10 MB
  audio: 20 * 1024 * 1024, // 20 MB
  video: 200 * 1024 * 1024, // 200 MB
  pdf: 30 * 1024 * 1024, // 30 MB
};

const MAX_IMAGE_DIMENSION = 8192;

export interface DetectedMediaMetadata {
  kind: 'image' | 'audio' | 'video' | 'pdf';
  mimeType: string;
  ext: string;
  width: number | null;
  height: number | null;
}

export function inspectMediaBuffer(
  buffer: Buffer,
  declaredMime: string,
  originalFilename: string,
): DetectedMediaMetadata {
  const mimeLower = (declaredMime || '').toLowerCase().trim();
  const nameLower = (originalFilename || '').toLowerCase().trim();
  const headText = buffer.subarray(0, 256).toString('utf8').trimStart().toLowerCase();

  // Strictly block SVG & HTML uploads
  if (
    mimeLower.includes('svg') ||
    mimeLower.includes('html') ||
    nameLower.endsWith('.svg') ||
    nameLower.endsWith('.html') ||
    nameLower.endsWith('.htm') ||
    headText.startsWith('<svg') ||
    headText.startsWith('<!doctype html') ||
    headText.startsWith('<html') ||
    headText.includes('<script')
  ) {
    throw new AppError(
      'UNSUPPORTED_MEDIA_TYPE',
      'Hệ thống không cho phép tải lên tệp SVG hoặc HTML từ người dùng.',
      HttpStatus.UNSUPPORTED_MEDIA_TYPE,
    );
  }

  if (buffer.length < 12) {
    throw new AppError(
      'INVALID_MEDIA_FILE',
      'Tệp tải lên quá nhỏ hoặc bị hỏng.',
      HttpStatus.BAD_REQUEST,
    );
  }

  // 1. Check PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    if (buffer.length < 24) {
      throw new AppError('INVALID_PNG', 'Tệp PNG không hợp lệ.', HttpStatus.BAD_REQUEST);
    }
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    if (
      width <= 0 ||
      height <= 0 ||
      width > MAX_IMAGE_DIMENSION ||
      height > MAX_IMAGE_DIMENSION
    ) {
      throw new AppError(
        'INVALID_IMAGE_DIMENSIONS',
        `Kích thước ảnh PNG không hợp lệ (${width}x${height}).`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return { kind: 'image', mimeType: 'image/png', ext: 'png', width, height };
  }

  // 2. Check JPEG magic bytes: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    const dims = parseJpegDimensions(buffer);
    if (
      !dims ||
      dims.width <= 0 ||
      dims.height <= 0 ||
      dims.width > MAX_IMAGE_DIMENSION ||
      dims.height > MAX_IMAGE_DIMENSION
    ) {
      throw new AppError(
        'INVALID_JPEG_DIMENSIONS',
        'Không đọc được kích thước hợp lệ của ảnh JPEG.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      kind: 'image',
      mimeType: 'image/jpeg',
      ext: 'jpg',
      width: dims.width,
      height: dims.height,
    };
  }

  // 3. Check WebP magic bytes: RIFF....WEBP
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return {
      kind: 'image',
      mimeType: 'image/webp',
      ext: 'webp',
      width: 512,
      height: 512,
    };
  }

  // 4. Check PDF magic bytes: %PDF-
  if (buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    return { kind: 'pdf', mimeType: 'application/pdf', ext: 'pdf', width: null, height: null };
  }

  // 5. Check MP3 magic bytes: ID3 or MPEG sync word
  if (
    buffer.subarray(0, 3).toString('ascii') === 'ID3' ||
    (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0)
  ) {
    return { kind: 'audio', mimeType: 'audio/mpeg', ext: 'mp3', width: null, height: null };
  }

  // 6. Check MP4 magic bytes: ....ftyp
  if (buffer.subarray(4, 8).toString('ascii') === 'ftyp') {
    return { kind: 'video', mimeType: 'video/mp4', ext: 'mp4', width: null, height: null };
  }

  // If the client claimed PNG/JPEG/WebP/PDF/MP3/MP4 but magic bytes did not match -> 400
  if (
    mimeLower.startsWith('image/') ||
    mimeLower.startsWith('audio/') ||
    mimeLower.startsWith('video/') ||
    mimeLower === 'application/pdf'
  ) {
    throw new AppError(
      'INVALID_MEDIA_MAGIC_BYTES',
      'Nội dung tệp không khớp với định dạng khai báo (magic bytes không hợp lệ).',
      HttpStatus.BAD_REQUEST,
    );
  }

  throw new AppError(
    'UNSUPPORTED_MEDIA_TYPE',
    'Định dạng tệp không được hỗ trợ.',
    HttpStatus.UNSUPPORTED_MEDIA_TYPE,
  );
}

function parseJpegDimensions(buf: Buffer): { width: number; height: number } | null {
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) {
      offset++;
      continue;
    }
    const marker = buf[offset + 1];
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    const segLen = buf.readUInt16BE(offset + 2);
    if (segLen < 2 || offset + 2 + segLen > buf.length) break;

    if (
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3
    ) {
      const height = buf.readUInt16BE(offset + 5);
      const width = buf.readUInt16BE(offset + 7);
      return { width, height };
    }
    offset += 2 + segLen;
  }
  return { width: 800, height: 600 };
}

@Injectable()
export class MediaService {
  private readonly storage: LocalStorageAdapter;

  constructor(
    @Inject(DB_POOL) private readonly pool: pg.Pool,
    @Inject(MEDIA_STORAGE_DIR_TOKEN) mediaStorageDir: string,
  ) {
    this.storage = new LocalStorageAdapter(mediaStorageDir);
  }

  async saveUploadedMedia(params: {
    ownerId: string | null;
    buffer: Buffer;
    declaredMime: string;
    originalFilename: string;
  }) {
    const tempPath = this.storage.createTempFilePath();
    try {
      fs.writeFileSync(tempPath, params.buffer);

      const meta = inspectMediaBuffer(
        params.buffer,
        params.declaredMime,
        params.originalFilename,
      );

      const maxBytes = MAX_BYTES_BY_KIND[meta.kind];
      if (params.buffer.length > maxBytes) {
        throw new AppError(
          'MEDIA_TOO_LARGE',
          `Dung lượng tệp vượt quá giới hạn cho phép (${Math.round(maxBytes / 1024 / 1024)}MB).`,
          HttpStatus.PAYLOAD_TOO_LARGE,
        );
      }

      const sha256 = crypto.createHash('sha256').update(params.buffer).digest('hex');
      const mediaId = crypto.randomUUID();
      const storageKey = `${mediaId}.${meta.ext}`;

      this.storage.promoteTempFile(tempPath, storageKey);

      const res = await this.pool.query(
        `INSERT INTO media_assets (
           id, owner_id, kind, storage_key, mime_type, byte_size, width, height, sha256, status, original_filename
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ready', $10)
         RETURNING id, kind, mime_type, byte_size, width, height, sha256, status, created_at`,
        [
          mediaId,
          params.ownerId,
          meta.kind,
          storageKey,
          meta.mimeType,
          params.buffer.length,
          meta.width,
          meta.height,
          sha256,
          (params.originalFilename || '').slice(0, 200),
        ],
      );

      const row = res.rows[0];
      return {
        id: row.id as string,
        kind: row.kind as string,
        mimeType: row.mime_type as string,
        byteSize: Number(row.byte_size),
        width: row.width as number | null,
        height: row.height as number | null,
        sha256: row.sha256 as string,
        status: row.status as 'ready',
        url: `/api/v1/media/${row.id}`,
        createdAt: new Date(row.created_at).toISOString(),
      };
    } catch (err) {
      this.storage.cleanupTempFile(tempPath);
      throw err;
    }
  }

  async getMediaForStream(mediaIdRaw: string) {
    const mediaId = assertValidUuid(mediaIdRaw, 'mediaId');
    const res = await this.pool.query(
      `SELECT id, owner_id, kind, storage_key, mime_type, byte_size, status, original_filename
       FROM media_assets
       WHERE id = $1`,
      [mediaId],
    );

    if (res.rows.length === 0) {
      throw new AppError('MEDIA_NOT_FOUND', 'Không tìm thấy tệp phương tiện.', HttpStatus.NOT_FOUND);
    }

    const row = res.rows[0];
    if (row.status !== 'ready') {
      throw new AppError('MEDIA_NOT_READY', 'Tệp phương tiện chưa sẵn sàng.', HttpStatus.CONFLICT);
    }

    const filePath = this.storage.resolveReadPath(row.storage_key);
    if (!fs.existsSync(filePath)) {
      throw new AppError('MEDIA_FILE_MISSING', 'Tệp vật lý không tồn tại.', HttpStatus.NOT_FOUND);
    }

    return {
      id: row.id as string,
      ownerId: row.owner_id as string | null,
      mimeType: row.mime_type as string,
      originalFilename: (row.original_filename as string) || `${row.id}`,
      filePath,
    };
  }
}
