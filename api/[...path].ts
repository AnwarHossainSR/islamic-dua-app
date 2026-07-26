import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleApi } from '../server/app';

/**
 * Minimal shapes for the Vercel Node request/response we actually use. Avoids a
 * dependency on `@vercel/node` (and its vulnerable transitive tree) since we
 * only need `req.body` on top of the standard Node http types.
 */
type VercelRequest = IncomingMessage & { body?: unknown; query?: Record<string, unknown> };
type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => VercelResponse;
};

/**
 * Vercel serverless catch-all for every `/api/*` request.
 * In production, set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN (Turso) or
 * DATABASE_URL=file:... for a bundled SQLite file.
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  const headers: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    headers[key.toLowerCase()] = Array.isArray(value) ? value.join(',') : value;
  }

  const response = await handleApi({
    method: req.method ?? 'GET',
    path: url.pathname,
    query,
    body: req.body,
    headers,
  });

  res.status(response.status).json(response.body);
}
