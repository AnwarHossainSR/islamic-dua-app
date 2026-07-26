import { randomUUID } from 'node:crypto';

/** Generate a v4 UUID (matches the TEXT ids used across the schema). */
export function uuid(): string {
  return randomUUID();
}

/** Current epoch milliseconds (matches Postgres BIGINT millisecond columns). */
export function nowMs(): number {
  return Date.now();
}

/**
 * Validate a SQL identifier (table/column name) before it is interpolated into
 * a query. Table/column names cannot be passed as bound parameters, so callers
 * must guarantee they are safe; this rejects anything but plain identifiers.
 */
export function safeIdentifier(name: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error(`Unsafe SQL identifier: ${name}`);
  }
  return name;
}

/** ISO-8601 timestamp (matches Postgres TIMESTAMPTZ columns stored as TEXT). */
export function nowIso(): string {
  return new Date().toISOString();
}

/** Coerce a SQLite 0/1 (or boolean) into a real boolean. */
export function toBool(v: unknown): boolean {
  return v === 1 || v === true || v === '1';
}

/** Coerce a boolean into the 0/1 integer SQLite stores. */
export function fromBool(v: unknown): number {
  return v ? 1 : 0;
}

/**
 * Map a DB row's known boolean columns from 0/1 to true/false so the client
 * keeps receiving the same shape it did from Supabase/Postgres.
 */
export function coerceBooleans<T extends Record<string, unknown>>(
  row: T | null,
  boolCols: string[]
): T | null {
  if (!row) return row;
  const out = { ...row } as Record<string, unknown>;
  for (const col of boolCols) {
    if (col in out && out[col] !== null && out[col] !== undefined) {
      out[col] = toBool(out[col]);
    }
  }
  return out as T;
}

export function coerceBooleansAll<T extends Record<string, unknown>>(
  rows: T[],
  boolCols: string[]
): T[] {
  return rows.map((r) => coerceBooleans(r, boolCols) as T);
}
