import { all, one, run } from '../db';
import { type ApiRequest, type Router, requireUser } from '../http';
import { coerceBooleansAll, nowIso, uuid } from '../util';

export function registerAdminRoutes(router: Router) {
  router.get('/admin/users', async (req: ApiRequest) => {
    requireUser(req);
    const rows = await all('SELECT * FROM admin_users ORDER BY created_at DESC');
    return coerceBooleansAll(rows, ['is_active']);
  });

  router.put('/admin/users/:userId/role', async (req: ApiRequest, params) => {
    requireUser(req);
    const { role } = (req.body ?? {}) as { role?: string };
    const existing = await one('SELECT id FROM user_roles WHERE user_id = ?', [params.userId]);
    if (existing) {
      await run('UPDATE user_roles SET role = ?, updated_at = ? WHERE user_id = ?', [
        role ?? 'user',
        nowIso(),
        params.userId,
      ]);
    } else {
      await run(
        'INSERT INTO user_roles (id, user_id, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [uuid(), params.userId, role ?? 'user', nowIso(), nowIso()]
      );
    }
    return { success: true };
  });

  router.get('/admin/logs', async (req: ApiRequest) => {
    requireUser(req);
    return all('SELECT * FROM api_logs ORDER BY timestamp DESC LIMIT 100');
  });

  router.get('/admin/permissions', async (req: ApiRequest) => {
    requireUser(req);
    return all('SELECT * FROM permissions');
  });
}
