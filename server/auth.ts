import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const TOKEN_TTL = '30d';

/**
 * Signing secret for JWT sessions, resolved lazily on first token operation
 * (never at import time, so a production build that imports this module doesn't
 * trip the fail-fast check). Must be provided via JWT_SECRET in any real
 * deployment; in dev, a random per-process secret is generated so no secret is
 * ever hard-coded in source (sessions then don't survive a dev restart).
 */
let cachedSecret: string | null = null;
function getJwtSecret(): string {
  if (cachedSecret) return cachedSecret;
  const fromEnv = process.env.JWT_SECRET;
  if (fromEnv && fromEnv.length > 0) {
    cachedSecret = fromEnv;
    return cachedSecret;
  }
  // In production/serverless each cold start is a new process; an ephemeral
  // secret would invalidate tokens across invocations, so fail fast instead.
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    throw new Error('JWT_SECRET must be set in production/serverless deployments.');
  }
  // biome-ignore lint/suspicious/noConsole: startup warning is intentional
  console.warn('[auth] JWT_SECRET is not set — using an ephemeral random secret (dev only).');
  cachedSecret = randomBytes(32).toString('hex');
  return cachedSecret;
}

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
  return jwt.sign({ sub: user.id, email: user.email }, getJwtSecret(), {
    expiresIn: TOKEN_TTL,
  });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload;
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
