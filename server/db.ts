import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Client, createClient, type InValue } from '@libsql/client';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * A single libSQL client is reused across serverless invocations.
 *
 * Connection target is resolved from env, supporting both hosting modes:
 *   - Turso:        TURSO_DATABASE_URL=libsql://... + TURSO_AUTH_TOKEN=...
 *   - Local SQLite: DATABASE_URL=file:./data/local.db  (or nothing -> default file)
 */
let client: Client | null = null;
let schemaReady: Promise<void> | null = null;

function resolveConfig(): { url: string; authToken?: string } {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  if (tursoUrl) {
    return { url: tursoUrl, authToken: process.env.TURSO_AUTH_TOKEN };
  }
  const url = process.env.DATABASE_URL || 'file:./data/local.db';
  // @libsql/client does not create missing parent directories for file URLs,
  // so ensure it exists before the client opens the database.
  if (url.startsWith('file:')) {
    try {
      mkdirSync(dirname(url.slice('file:'.length)), { recursive: true });
    } catch {
      /* best-effort */
    }
  }
  return { url };
}

/** Split a SQL file into executable statements, stripping `--` comment lines. */
function splitStatements(sql: string): string[] {
  return sql
    .split(';')
    .map((chunk) =>
      chunk
        .split('\n')
        .filter((line) => !line.trim().startsWith('--'))
        .join('\n')
        .trim()
    )
    .filter((s) => s.length > 0);
}

export function getClient(): Client {
  if (!client) {
    client = createClient(resolveConfig());
  }
  return client;
}

/**
 * Ensure the schema exists. Runs once per process. Safe for the local-file
 * mode; for Turso the schema can also be applied ahead of time via the seed
 * script, but running it here keeps first-boot painless (all statements use
 * IF NOT EXISTS).
 */
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
      const statements = splitStatements(sql);
      await getClient().batch(
        statements.map((s) => ({ sql: s, args: [] })),
        'write'
      );
    })();
  }
  return schemaReady;
}

export type Row = Record<string, unknown>;

/** Run a query and return all rows as plain objects. */
export async function all<T = Row>(sql: string, args: InValue[] = []): Promise<T[]> {
  const rs = await getClient().execute({ sql, args });
  return rs.rows as unknown as T[];
}

/** Run a query and return the first row, or null. */
export async function one<T = Row>(sql: string, args: InValue[] = []): Promise<T | null> {
  const rows = await all<T>(sql, args);
  return rows.length > 0 ? rows[0] : null;
}

/** Run a write statement; returns affected row count. */
export async function run(sql: string, args: InValue[] = []): Promise<number> {
  const rs = await getClient().execute({ sql, args });
  return rs.rowsAffected;
}

/** Run a `SELECT count(*) AS c ...` and return the number. */
export async function count(sql: string, args: InValue[] = []): Promise<number> {
  const row = await one<{ c: number }>(sql, args);
  return Number(row?.c ?? 0);
}

/** Execute several statements atomically. */
export async function batch(stmts: { sql: string; args?: InValue[] }[]): Promise<void> {
  await getClient().batch(
    stmts.map((s) => ({ sql: s.sql, args: s.args ?? [] })),
    'write'
  );
}
