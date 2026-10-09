import pg from 'pg';

export function createPool(connectionString: string, ssl: boolean): pg.Pool {
  return new pg.Pool({
    connectionString,
    ssl: ssl ? { rejectUnauthorized: false } : undefined,
    max: 10,
  });
}
