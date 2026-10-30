import { DynamicModule, Global, Module, OnModuleDestroy, Inject } from '@nestjs/common';
import type pg from 'pg';
import { DB_POOL, createDatabasePool } from './pool.js';
import { DatabaseService } from './database.service.js';

export { DB_POOL, DatabaseService };

@Global()
@Module({})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject(DB_POOL) private readonly pool: pg.Pool) {}

  static forRoot(databaseUrl?: string): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: DB_POOL,
          useFactory: () => createDatabasePool(databaseUrl || process.env.DATABASE_URL),
        },
        DatabaseService,
      ],
      exports: [DB_POOL, DatabaseService],
    };
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
