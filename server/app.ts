import { userFromAuthHeader } from './auth';
import { ensureSchema } from './db';
import { ApiError, type ApiRequest, type ApiResponse, Router } from './http';
import { registerActivityRoutes } from './routes/activities.routes';
import { registerAdminRoutes } from './routes/admin.routes';
import { registerAiRoutes } from './routes/ai.routes';
import { registerAuthRoutes } from './routes/auth.routes';
import { registerChallengeRoutes } from './routes/challenges.routes';
import { registerDashboardRoutes } from './routes/dashboard.routes';
import { registerDuaRoutes } from './routes/duas.routes';
import { registerLogRoutes } from './routes/logs.routes';
import { registerMcpRoutes } from './routes/mcp.routes';
import { registerMissedChallengeRoutes } from './routes/missed-challenges.routes';
import { registerPermissionRoutes } from './routes/permissions.routes';
import { registerSettingsRoutes } from './routes/settings.routes';
import { registerUserRoutes } from './routes/users.routes';

const router = new Router();
registerAuthRoutes(router);
registerDuaRoutes(router);
registerChallengeRoutes(router);
registerActivityRoutes(router);
registerDashboardRoutes(router);
registerMissedChallengeRoutes(router);
registerSettingsRoutes(router);
registerUserRoutes(router);
registerPermissionRoutes(router);
registerLogRoutes(router);
registerAdminRoutes(router);
registerAiRoutes(router);
registerMcpRoutes(router);

export interface RawRequest {
  method: string;
  /** Full path including `/api` prefix, e.g. `/api/duas/123`. */
  path: string;
  query: Record<string, string>;
  body: unknown;
  headers: Record<string, string | undefined>;
}

/**
 * Core, framework-agnostic API entrypoint. Both the Vercel serverless adapter
 * and the Vite dev-server middleware call into this.
 */
export async function handleApi(raw: RawRequest): Promise<ApiResponse> {
  try {
    await ensureSchema();

    // Strip the `/api` prefix.
    let path = raw.path.replace(/^\/api/, '');
    if (path === '') path = '/';
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);

    const matched = router.match(raw.method, path);
    if (!matched) {
      return { status: 404, body: { error: `No route for ${raw.method} ${path}` } };
    }

    const req: ApiRequest = {
      method: raw.method,
      path,
      query: raw.query,
      body: raw.body,
      headers: raw.headers,
      user: userFromAuthHeader(raw.headers.authorization ?? raw.headers.Authorization),
    };

    const result = await matched.handler(req, matched.params);
    return { status: 200, body: result === undefined ? null : result };
  } catch (err) {
    if (err instanceof ApiError) {
      return { status: err.status, body: { error: err.message } };
    }
    const message = err instanceof Error ? err.message : 'Internal server error';
    // eslint-disable-next-line no-console
    console.error('API error:', err);
    return { status: 500, body: { error: message } };
  }
}
