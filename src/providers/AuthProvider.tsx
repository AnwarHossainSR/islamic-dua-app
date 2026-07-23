import { createContext, useEffect, useState } from 'react';
import { type AppUser, session } from '@/lib/auth/session';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(session.getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate the persisted token against the backend on mount.
    session.refresh().then((u) => {
      setUser(u);
      setLoading(false);
    });

    const { unsubscribe } = session.onAuthStateChange((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await session.signOut();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>;
}
