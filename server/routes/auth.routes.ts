import { hashPassword, signToken, verifyPassword } from '../auth';
import { all, one, run } from '../db';
import { ApiError, type ApiRequest, type Router, requireUser } from '../http';
import { nowIso, uuid } from '../util';

interface AuthUserRow {
  id: string;
  email: string;
  password_hash: string;
}

/**
 * Bootstrap only: the very first registered account becomes super_admin so the
 * admin panel is reachable on a fresh database. Every subsequent signup is a
 * regular user with NO admin_users row — admin membership must be granted
 * explicitly by an admin via the users endpoints.
 */
async function bootstrapFirstAdmin(userId: string, email: string) {
  const anyAdmin = await all('SELECT id FROM admin_users LIMIT 1');
  if (anyAdmin.length > 0) return;
  await run(
    `INSERT INTO admin_users (id, user_id, email, role, is_active, created_at, updated_at)
     VALUES (?, ?, ?, 'super_admin', 1, ?, ?)`,
    [uuid(), userId, email, nowIso(), nowIso()]
  );
}

export function registerAuthRoutes(router: Router) {
  router.post('/auth/signup', async (req: ApiRequest) => {
    const { email, password } = (req.body ?? {}) as { email?: string; password?: string };
    if (!email || !password) throw new ApiError(400, 'Email and password are required');

    const existing = await one('SELECT id FROM auth_users WHERE email = ?', [email]);
    if (existing) throw new ApiError(409, 'A user with this email already exists');

    const id = uuid();
    const hash = await hashPassword(password);
    await run(
      `INSERT INTO auth_users (id, email, password_hash, email_confirmed, created_at, updated_at)
       VALUES (?, ?, ?, 1, ?, ?)`,
      [id, email, hash, nowIso(), nowIso()]
    );
    await bootstrapFirstAdmin(id, email);

    const user = { id, email };
    return { user, token: signToken(user) };
  });

  router.post('/auth/signin', async (req: ApiRequest) => {
    const { email, password } = (req.body ?? {}) as { email?: string; password?: string };
    if (!email || !password) throw new ApiError(400, 'Email and password are required');

    const row = await one<AuthUserRow>('SELECT * FROM auth_users WHERE email = ?', [email]);
    if (!row || !(await verifyPassword(password, row.password_hash))) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const user = { id: row.id, email: row.email };
    return { user, token: signToken(user) };
  });

  // Stateless JWT: sign-out is a client-side token drop. Endpoint kept for parity.
  router.post('/auth/signout', async () => ({ success: true }));

  router.get('/auth/session', async (req: ApiRequest) => {
    if (!req.user) return { user: null };
    const row = await one<AuthUserRow>('SELECT id, email FROM auth_users WHERE id = ?', [
      req.user.id,
    ]);
    return { user: row ? { id: row.id, email: row.email } : null };
  });

  router.get('/auth/user', async (req: ApiRequest) => {
    const user = requireUser(req);
    return { user };
  });
}
