import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { type AppUser, session } from '@/lib/auth/session';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(session.getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    session.refresh().then((u) => {
      setUser(u);
      setLoading(false);
    });

    const { unsubscribe } = session.onAuthStateChange((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await session.signOut();
      setUser(null);
      toast.success('Signed out successfully!');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
