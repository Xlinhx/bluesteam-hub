import pg from 'pg';

const { Pool } = pg;

export type DbPool = pg.Pool;
export type DbClient = pg.PoolClient;

export const DB_POOL = Symbol('DB_POOL');

export function assertTestDatabaseUrl(databaseUrl: string): void {
  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error('Invalid DATABASE_URL format for test database.');
  }
  const dbName = parsed.pathname.replace(/^\//, '');
  if (!dbName.endsWith('_test') && !dbName.includes('test')) {
    throw new Error(
      `Refusing to run destructive test suite against non-test database "${dbName}". Expected a *_test database.`,
    );
  }
}

export function createDatabasePool(databaseUrl?: string): pg.Pool {
  const connectionString =
    databaseUrl ||
    process.env.DATABASE_URL ||
    'postgresql://bluesteam:bluesteam_dev_local@127.0.0.1:5442/bluesteam';

  return new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

export async function withTransaction<T>(
  pool: pg.Pool,
  fn: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
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
