import type { AuthUser } from './auth';

export interface ApiRequest {
  method: string;
  /** Path after the `/api` prefix, e.g. `/duas/123`. */
  path: string;
  query: Record<string, string>;
  body: unknown;
  user: AuthUser | null;
  headers: Record<string, string | undefined>;
}

export interface ApiResponse {
  status: number;
  body: unknown;
}

/** Thrown by handlers to short-circuit with a specific status + message. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function requireUser(req: ApiRequest): AuthUser {
  if (!req.user) {
    throw new ApiError(401, 'Not authenticated');
  }
  return req.user;
}

export type RouteParams = Record<string, string>;
export type Handler = (req: ApiRequest, params: RouteParams) => Promise<unknown> | unknown;

interface Route {
  method: string;
  regex: RegExp;
  keys: string[];
  handler: Handler;
}

export class Router {
  private routes: Route[] = [];

  add(method: string, pattern: string, handler: Handler): void {
    const keys: string[] = [];
    const regexStr = pattern
      .replace(/\/:([^/]+)/g, (_m, key) => {
        keys.push(key);
        return '/([^/]+)';
      })
      .replace(/\//g, '\\/');
    this.routes.push({
      method: method.toUpperCase(),
      regex: new RegExp(`^${regexStr}$`),
      keys,
      handler,
    });
  }

  get(pattern: string, handler: Handler) {
    this.add('GET', pattern, handler);
  }
  post(pattern: string, handler: Handler) {
    this.add('POST', pattern, handler);
  }
  put(pattern: string, handler: Handler) {
    this.add('PUT', pattern, handler);
  }
  patch(pattern: string, handler: Handler) {
    this.add('PATCH', pattern, handler);
  }
  delete(pattern: string, handler: Handler) {
    this.add('DELETE', pattern, handler);
  }

  match(method: string, path: string): { handler: Handler; params: RouteParams } | null {
    for (const route of this.routes) {
      if (route.method !== method.toUpperCase()) continue;
      const m = route.regex.exec(path);
      if (!m) continue;
      const params: RouteParams = {};
      route.keys.forEach((key, i) => {
        params[key] = decodeURIComponent(m[i + 1]);
      });
      return { handler: route.handler, params };
    }
    return null;
  }
}
