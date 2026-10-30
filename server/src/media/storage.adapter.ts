import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Injectable, HttpStatus } from '@nestjs/common';
import { AppError } from '../common/errors.js';

export const MEDIA_STORAGE_DIR_TOKEN = 'MEDIA_STORAGE_DIR';

@Injectable()
export class LocalStorageAdapter {
  public readonly baseDir: string;
  public readonly tempDir: string;

  constructor(baseDir: string) {
    this.baseDir = path.resolve(baseDir);
    this.tempDir = path.join(this.baseDir, '_tmp');
    fs.mkdirSync(this.baseDir, { recursive: true });
    fs.mkdirSync(this.tempDir, { recursive: true });
  }

  createTempFilePath(): string {
    return path.join(this.tempDir, `upload-${crypto.randomUUID()}.part`);
  }

  promoteTempFile(tempPath: string, storageKey: string): string {
    const safeKey = path.basename(storageKey);
    if (safeKey !== storageKey || storageKey.includes('..')) {
      this.cleanupTempFile(tempPath);
      throw new AppError(
        'INVALID_STORAGE_KEY',
        'Tên khóa lưu trữ không hợp lệ.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const targetPath = path.resolve(this.baseDir, safeKey);
    if (!targetPath.startsWith(this.baseDir)) {
      this.cleanupTempFile(tempPath);
      throw new AppError(
        'PATH_TRAVERSAL_BLOCKED',
        'Truy cập đường dẫn bị từ chối.',
        HttpStatus.BAD_REQUEST,
      );
    }
    fs.renameSync(tempPath, targetPath);
    return targetPath;
  }

  cleanupTempFile(tempPath?: string | null): void {
    if (!tempPath) return;
    try {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    } catch {
      // Ignore cleanup errors
    }
  }

  resolveReadPath(storageKey: string): string {
    if (storageKey.startsWith('/assets/')) {
      const repoRoot = path.resolve(process.cwd(), '..');
      const publicDir = fs.existsSync(path.join(process.cwd(), 'public', 'assets'))
        ? path.resolve(process.cwd(), 'public')
        : path.resolve(repoRoot, 'public');
      const resolved = path.resolve(publicDir, storageKey.replace(/^\/+/, ''));
      if (!resolved.startsWith(publicDir)) {
        throw new AppError(
          'PATH_TRAVERSAL_BLOCKED',
          'Đường dẫn tệp không hợp lệ.',
          HttpStatus.BAD_REQUEST,
        );
      }
      return resolved;
    }

    const safeKey = path.basename(storageKey);
    if (safeKey !== storageKey || storageKey.includes('..')) {
      throw new AppError(
        'PATH_TRAVERSAL_BLOCKED',
        'Đường dẫn tệp không hợp lệ.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const resolved = path.resolve(this.baseDir, safeKey);
    if (!resolved.startsWith(this.baseDir)) {
      throw new AppError(
        'PATH_TRAVERSAL_BLOCKED',
        'Đường dẫn tệp không hợp lệ.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return resolved;
  }
}
