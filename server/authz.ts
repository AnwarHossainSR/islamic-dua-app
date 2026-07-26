import type { AuthUser } from './auth';
import { one } from './db';
import { ApiError, type ApiRequest, requireUser } from './http';

const ADMIN_ROLES = new Set(['admin', 'super_admin']);

/** Return the admin role for a user, or null if they are not an active admin. */
export async function getAdminRole(userId: string): Promise<string | null> {
  const row = await one<{ role: string }>(
    'SELECT role FROM admin_users WHERE user_id = ? AND is_active = 1',
    [userId]
  );
  return row?.role ?? null;
}

/** Require an authenticated user who holds an admin or super_admin role. */
export async function requireAdmin(req: ApiRequest): Promise<{ user: AuthUser; role: string }> {
  const user = requireUser(req);
  const role = await getAdminRole(user.id);
  if (!role || !ADMIN_ROLES.has(role)) {
    throw new ApiError(403, 'Admin privileges required');
  }
  return { user, role };
}

/** Require super_admin specifically (e.g. to grant/revoke super_admin). */
export async function requireSuperAdmin(req: ApiRequest): Promise<AuthUser> {
  const user = requireUser(req);
  const role = await getAdminRole(user.id);
  if (role !== 'super_admin') {
    throw new ApiError(403, 'Super admin privileges required');
  }
  return user;
}

/**
 * Require the authenticated user to be the owner of `targetUserId`, or an admin.
 * Used to scope per-user data routes so callers can't read/modify others' data.
 */
export async function requireSelfOrAdmin(req: ApiRequest, targetUserId: string): Promise<AuthUser> {
  const user = requireUser(req);
  if (user.id === targetUserId) return user;
  const role = await getAdminRole(user.id);
  if (role && ADMIN_ROLES.has(role)) return user;
  throw new ApiError(403, 'Forbidden');
}
