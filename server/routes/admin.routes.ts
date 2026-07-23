import { requireAdmin, requireSuperAdmin } from '../authz';
import { all, run } from '../db';
import type { ApiRequest, Router } from '../http';
import { coerceBooleansAll, nowIso } from '../util';

export function registerAdminRoutes(router: Router) {
  router.get('/admin/users', async (req: ApiRequest) => {
    await requireAdmin(req);
    const rows = await all('SELECT * FROM admin_users ORDER BY created_at DESC');
    return coerceBooleansAll(rows, ['is_active']);
  });

  // Role is stored on admin_users (the source of truth for the permission
  // system). userId is the auth user id (admin_users.user_id). Assigning or
  // changing to/from super_admin requires super_admin; other role changes
  // require admin.
  router.put('/admin/users/:userId/role', async (req: ApiRequest, params) => {
    const { role } = (req.body ?? {}) as { role?: string };
    if (role === 'super_admin') {
      await requireSuperAdmin(req);
    } else {
      await requireAdmin(req);
    }
    await run('UPDATE admin_users SET role = ?, updated_at = ? WHERE user_id = ?', [
      role ?? 'editor',
      nowIso(),
      params.userId,
    ]);
    return { success: true };
  });

  router.get('/admin/logs', async (req: ApiRequest) => {
    await requireAdmin(req);
    return all('SELECT * FROM api_logs ORDER BY timestamp DESC LIMIT 100');
  });

  router.get('/admin/permissions', async (req: ApiRequest) => {
    await requireAdmin(req);
    return all('SELECT * FROM permissions');
  });
}
