import { session } from '@/lib/auth/session';

export const authApi = {
  signIn: async (email: string, password: string) => {
    try {
      const data = await session.signInWithPassword(email, password);
      const { apiLogger } = await import('@/lib/logger');
      apiLogger.info('User signed in', { email });
      return data;
    } catch (error: any) {
      const { apiLogger } = await import('@/lib/logger');
      apiLogger.error('Sign in failed', { email, error: error.message });
      throw error;
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      const data = await session.signUp(email, password);
      const { apiLogger } = await import('@/lib/logger');
      apiLogger.info('User signed up', { email });
      return data;
    } catch (error: any) {
      const { apiLogger } = await import('@/lib/logger');
      apiLogger.error('Sign up failed', { email, error: error.message });
      throw error;
    }
  },

  signOut: async () => {
    try {
      await session.signOut();
      const { apiLogger } = await import('@/lib/logger');
      apiLogger.info('User signed out');
    } catch (error: any) {
      const { apiLogger } = await import('@/lib/logger');
      apiLogger.error('Sign out failed', { error: error.message });
      throw error;
    }
  },

  getSession: async () => {
    return session.getSession();
  },
};
