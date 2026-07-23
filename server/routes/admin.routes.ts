import { all, run } from '../db';
import { type ApiRequest, type Router, requireUser } from '../http';
import { coerceBooleansAll, nowIso } from '../util';

export function registerAdminRoutes(router: Router) {
  router.get('/admin/users', async (req: ApiRequest) => {
    requireUser(req);
    const rows = await all('SELECT * FROM admin_users ORDER BY created_at DESC');
    return coerceBooleansAll(rows, ['is_active']);
  });

  // Role is stored on admin_users (the source of truth for the permission
  // system). userId is the auth user id (admin_users.user_id).
  router.put('/admin/users/:userId/role', async (req: ApiRequest, params) => {
    requireUser(req);
    const { role } = (req.body ?? {}) as { role?: string };
    await run('UPDATE admin_users SET role = ?, updated_at = ? WHERE user_id = ?', [
      role ?? 'editor',
      nowIso(),
      params.userId,
    ]);
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
