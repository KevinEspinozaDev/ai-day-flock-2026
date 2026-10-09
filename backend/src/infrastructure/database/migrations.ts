import type pg from 'pg';

const MIGRATIONS: string[] = [
  `CREATE EXTENSION IF NOT EXISTS pgcrypto`,
  `CREATE TABLE IF NOT EXISTS users (
     id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     username      VARCHAR(80)  NOT NULL UNIQUE,
     display_name  VARCHAR(120) NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
   )`,
];

export async function runMigrations(pool: pg.Pool): Promise<void> {
  for (const sql of MIGRATIONS) {
    await pool.query(sql);
  }
}
