import type { Connect, Plugin } from 'vite';
import { handleApi } from './app';

/**
 * Vite dev-server middleware that serves the same `/api/*` handlers used by the
 * Vercel serverless function. This lets `npm run dev` run fully against a local
 * SQLite file (DATABASE_URL=file:./data/local.db) with no external services.
 */
export function apiDevServer(): Plugin {
  return {
    name: 'islamic-dua-api-dev-server',
    configureServer(server) {
      const middleware: Connect.NextHandleFunction = (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          next();
          return;
        }

        const chunks: Buffer[] = [];
        req.on('data', (c) => chunks.push(c as Buffer));
        req.on('end', async () => {
          try {
            const raw = Buffer.concat(chunks).toString('utf8');
            let body: unknown;
            if (raw) {
              try {
                body = JSON.parse(raw);
              } catch {
                body = raw;
              }
            }

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
              body,
              headers,
            });

            res.statusCode = response.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(response.body));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' })
            );
          }
        });
      };

      server.middlewares.use(middleware);
    },
  };
}
