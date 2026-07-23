import { hashPassword } from '../auth';
import { all, one, run } from '../db';
import { ApiError, type ApiRequest, type Router, requireUser } from '../http';
import { coerceBooleansAll, nowIso, uuid } from '../util';

export function registerUserRoutes(router: Router) {
  router.get('/users', async (req: ApiRequest) => {
    requireUser(req);
    // admin_users already carries email in this schema.
    const rows = await all('SELECT * FROM admin_users ORDER BY created_at DESC');
    return coerceBooleansAll(rows, ['is_active']);
  });

  router.post('/users', async (req: ApiRequest) => {
    requireUser(req);
    const { email, role, password } = (req.body ?? {}) as {
      email?: string;
      role?: string;
      password?: string;
    };
    if (!email || !role) throw new ApiError(400, 'Email and role are required');

    let authUser = await one<{ id: string; email: string }>(
      'SELECT id, email FROM auth_users WHERE email = ?',
      [email]
    );
    let generatedPassword: string | null = null;
    let userCreated = false;

    if (!authUser) {
      generatedPassword = password || `${Math.random().toString(36).slice(-8)}A1!`;
      const id = uuid();
      const hash = await hashPassword(generatedPassword);
      await run(
        `INSERT INTO auth_users (id, email, password_hash, email_confirmed, created_at, updated_at)
         VALUES (?, ?, ?, 1, ?, ?)`,
        [id, email, hash, nowIso(), nowIso()]
      );
      authUser = { id, email };
      userCreated = true;
    }

    const existingAdmin = await one('SELECT id FROM admin_users WHERE user_id = ?', [authUser.id]);
    if (existingAdmin) throw new ApiError(409, 'User is already an admin');

    const adminId = uuid();
    await run(
      `INSERT INTO admin_users (id, user_id, email, role, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, ?, ?)`,
      [adminId, authUser.id, authUser.email, role, nowIso(), nowIso()]
    );
    const data = await one('SELECT * FROM admin_users WHERE id = ?', [adminId]);
    return { data, userCreated, generatedPassword: userCreated ? generatedPassword : null };
  });

  router.put('/users/:id', async (req: ApiRequest, params) => {
    requireUser(req);
    const { role, is_active } = (req.body ?? {}) as { role?: string; is_active?: boolean };
    const sets: string[] = [];
    const args: (string | number)[] = [];
    if (role !== undefined) {
      sets.push('role = ?');
      args.push(role);
    }
    if (is_active !== undefined) {
      sets.push('is_active = ?');
      args.push(is_active ? 1 : 0);
    }
    if (sets.length === 0) throw new ApiError(400, 'Nothing to update');
    args.push(params.id);
    await run(`UPDATE admin_users SET ${sets.join(', ')} WHERE id = ?`, args);
    return one('SELECT * FROM admin_users WHERE id = ?', [params.id]);
  });

  router.delete('/users/:id', async (req: ApiRequest, params) => {
    requireUser(req);
    await run('DELETE FROM admin_users WHERE id = ?', [params.id]);
    return { success: true };
  });
}
