import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Signing secret for JWT sessions. Must be provided via JWT_SECRET in any real
 * deployment. When it is missing (e.g. local dev), a random per-process secret
 * is generated so no secret is ever hard-coded in source — the trade-off is
 * that sessions do not survive a dev-server restart.
 */
const JWT_SECRET: string = (() => {
  const fromEnv = process.env.JWT_SECRET;
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  // biome-ignore lint/suspicious/noConsole: startup warning is intentional
  console.warn('[auth] JWT_SECRET is not set — using an ephemeral random secret.');
  return randomBytes(32).toString('hex');
})();
const TOKEN_TTL = '30d';

export interface AuthUser {
  id: string;
  email: string;
}

export interface SessionUser extends AuthUser {
  role?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(user: AuthUser): string {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: TOKEN_TTL,
  });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    if (!payload.sub || !payload.email) return null;
    return { id: String(payload.sub), email: String(payload.email) };
  } catch {
    return null;
  }
}

/** Extract and verify the bearer token from an Authorization header value. */
export function userFromAuthHeader(header?: string | null): AuthUser | null {
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return null;
  return verifyToken(match[1]);
}
