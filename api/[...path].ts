import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleApi } from '../server/app';

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
