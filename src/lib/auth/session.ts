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
      writeUser(user);
      notify(user);
      return user;
    } catch {
      // Invalid/expired token — clear it.
      setToken(null);
      writeUser(null);
      notify(null);
      return null;
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
