import { Injectable, Inject, Controller, Get } from '@nestjs/common';
import type pg from 'pg';
import { DB_POOL } from '../../database/database.module.js';

@Injectable()
export class TopicsService {
  constructor(@Inject(DB_POOL) private readonly pool: pg.Pool) {}

  async listTopics() {
    const res = await this.pool.query(
      `SELECT id, slug, title, icon_key, sort_order
       FROM topics
       ORDER BY sort_order ASC, title ASC`,
    );
    return {
      items: res.rows.map((r) => ({
        id: r.id as string,
        slug: r.slug as string,
        title: r.title as string,
        iconKey: r.icon_key as string,
        sortOrder: Number(r.sort_order),
      })),
    };
  }
}

@Controller('api/v1/topics')
export class TopicsController {
  constructor(@Inject(TopicsService) private readonly topicsService: TopicsService) {}

  @Get()
  async getTopics() {
    return this.topicsService.listTopics();
  }
}
