import fs from 'node:fs';
import { Controller, Get, Inject, HttpStatus, Res } from '@nestjs/common';
import type pg from 'pg';
import { DB_POOL } from '../database/database.module.js';
import { MEDIA_STORAGE_DIR_TOKEN } from '../media/storage.adapter.js';

@Controller()
export class HealthController {
  constructor(
    @Inject(DB_POOL) private readonly pool: pg.Pool,
    @Inject(MEDIA_STORAGE_DIR_TOKEN) private readonly mediaDir: string,
  ) {}

  @Get(['api/v1/health/live', 'health/live'])
  live() {
    return {
      status: 'ok',
      service: 'bluesteam-api',
      timestamp: new Date().toISOString(),
    };
  }

  @Get(['api/v1/health/ready', 'health/ready'])
  async ready(@Res() res: any) {
    try {
      await this.pool.query('SELECT 1');
      fs.accessSync(this.mediaDir, fs.constants.R_OK | fs.constants.W_OK);
      res.status(HttpStatus.OK).json({
        status: 'ready',
        checks: {
          database: 'up',
          mediaStorage: 'writable',
        },
        timestamp: new Date().toISOString(),
      });
    } catch {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'not_ready',
        checks: {
          database: 'degraded',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
}
