import { all, one, run } from '../db';
import { ApiError, type ApiRequest, type Router, requireUser } from '../http';
import { coerceBooleans, uuid } from '../util';

const ROLES = ['user', 'editor', 'admin', 'super_admin'];

export function registerPermissionRoutes(router: Router) {
  router.get('/permissions', async () => {
    return all('SELECT * FROM permissions ORDER BY resource ASC');
  });

  router.get('/permissions/roles', async () => {
    const result = [];
    for (const role of ROLES) {
      const permissions = await all(
        `SELECT p.* FROM role_permissions rp
         JOIN permissions p ON p.id = rp.permission_id
         WHERE rp.role = ?`,
        [role]
      );
      result.push({ role, permissions });
    }
    return result;
  });

  router.get('/permissions/user/:userId', async (_req, params) => {
    const adminUser = await one<Record<string, unknown>>(
      'SELECT * FROM admin_users WHERE user_id = ?',
      [params.userId]
    );
    if (!adminUser) return null;
    const permissions = await all(
      `SELECT p.* FROM role_permissions rp
       JOIN permissions p ON p.id = rp.permission_id
       WHERE rp.role = ?`,
      [adminUser.role as string]
    );
    const allPermissions = await all('SELECT * FROM permissions ORDER BY resource ASC');
    return {
      ...coerceBooleans(adminUser, ['is_active']),
      permissions,
      allPermissions,
    };
  });

  router.post('/permissions/roles/:role', async (req: ApiRequest, params) => {
    requireUser(req);
    const { permissionId } = (req.body ?? {}) as { permissionId?: string };
    if (!permissionId) throw new ApiError(400, 'permissionId is required');
    await run('INSERT OR IGNORE INTO role_permissions (id, role, permission_id) VALUES (?, ?, ?)', [
      uuid(),
      params.role,
      permissionId,
    ]);
    return { success: true };
  });

  router.delete('/permissions/roles/:role/:permissionId', async (req: ApiRequest, params) => {
    requireUser(req);
    await run('DELETE FROM role_permissions WHERE role = ? AND permission_id = ?', [
      params.role,
      params.permissionId,
    ]);
    return { success: true };
  });

  router.post('/permissions', async (req: ApiRequest) => {
    requireUser(req);
    const p = (req.body ?? {}) as {
      name?: string;
      description?: string;
      resource?: string;
      action?: string;
    };
    if (!p.name) throw new ApiError(400, 'name is required');
    const id = uuid();
    await run(
      'INSERT INTO permissions (id, name, description, resource, action) VALUES (?, ?, ?, ?, ?)',
      [id, p.name, p.description ?? null, p.resource ?? null, p.action ?? null]
    );
    return one('SELECT * FROM permissions WHERE id = ?', [id]);
  });

  router.put('/permissions/:id', async (req: ApiRequest, params) => {
    requireUser(req);
    const p = (req.body ?? {}) as Record<string, unknown>;
    const cols = ['name', 'description', 'resource', 'action'];
    const sets: string[] = [];
    const args: (string | null)[] = [];
    for (const c of cols) {
      if (c in p) {
        sets.push(`${c} = ?`);
        args.push((p[c] as string) ?? null);
      }
    }
    if (sets.length === 0) throw new ApiError(400, 'Nothing to update');
    args.push(params.id);
    await run(`UPDATE permissions SET ${sets.join(', ')} WHERE id = ?`, args);
    return one('SELECT * FROM permissions WHERE id = ?', [params.id]);
  });

  router.delete('/permissions/:id', async (req: ApiRequest, params) => {
    requireUser(req);
    await run('DELETE FROM permissions WHERE id = ?', [params.id]);
    return { success: true };
  });
}
