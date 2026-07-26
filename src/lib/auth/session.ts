/**
 * Client-side auth session store — the replacement for `supabase.auth`.
 *
 * Persists the current user + JWT in localStorage and notifies subscribers on
 * change, mirroring the small slice of the Supabase auth API the app used
 * (`getUser`, `getSession`, `signInWithPassword`, `signUp`, `signOut`,
 * `onAuthStateChange`).
 */
import { getToken, http, setToken } from '@/lib/api/http';

export interface AppUser {
  id: string;
  email: string;
}

export interface AppSession {
  user: AppUser;
  token: string;
}

const USER_KEY = 'idua.user';

type Listener = (user: AppUser | null) => void;
const listeners = new Set<Listener>();

function readUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
}

function writeUser(user: AppUser | null): void {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

function notify(user: AppUser | null): void {
  for (const listener of listeners) listener(user);
}

export const session = {
  getUser(): AppUser | null {
    return readUser();
  },

  getSession(): AppSession | null {
    const user = readUser();
    const token = getToken();
    return user && token ? { user, token } : null;
  },

  async refresh(): Promise<AppUser | null> {
    const token = getToken();
    if (!token) return null;
    try {
      const { user } = await http.get<{ user: AppUser | null }>('/auth/session');
      // If sign-out happened while this refresh was in flight, the token is
      // gone — don't restore the user from a stale response.
      if (!getToken()) return null;
      writeUser(user);
      notify(user);
      return user;
    } catch (err) {
      // Only sign out on an auth rejection (401/403). A transient network or
      // server error must not log the user out — keep the stored session.
      const status = (err as { status?: number })?.status;
      if (status === 401 || status === 403) {
        setToken(null);
        writeUser(null);
        notify(null);
        return null;
      }
      return readUser();
    }
  },

  async signInWithPassword(email: string, password: string): Promise<AppSession> {
    const { user, token } = await http.post<{ user: AppUser; token: string }>(
      '/auth/signin',
      { email, password },
      { anonymous: true }
    );
    setToken(token);
    writeUser(user);
    notify(user);
    return { user, token };
  },

  async signUp(email: string, password: string): Promise<AppSession> {
    const { user, token } = await http.post<{ user: AppUser; token: string }>(
      '/auth/signup',
      { email, password },
      { anonymous: true }
    );
    setToken(token);
    writeUser(user);
    notify(user);
    return { user, token };
  },

  async signOut(): Promise<void> {
    try {
      await http.post('/auth/signout');
    } catch {
      /* best-effort */
    }
    setToken(null);
    writeUser(null);
    notify(null);
  },

  onAuthStateChange(listener: Listener): { unsubscribe: () => void } {
    listeners.add(listener);
    return {
      unsubscribe: () => {
        listeners.delete(listener);
      },
    };
  },
};
