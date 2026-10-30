import { Inject, Injectable } from '@nestjs/common';
import type pg from 'pg';
import { DB_POOL } from './pool.js';

@Injectable()
export class DatabaseService {
  constructor(@Inject(DB_POOL) private readonly pool: pg.Pool) {}

  getPool(): pg.Pool {
    return this.pool;
  }

  async query<T extends pg.QueryResultRow = any>(
    text: string,
    values?: unknown[],
  ): Promise<pg.QueryResult<T>> {
    return this.pool.query<T>(text, values);
  }

  async withTransaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
