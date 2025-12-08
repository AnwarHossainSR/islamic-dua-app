import { supabase } from "@/lib/supabase/client";

export const authApi = {
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { apiLogger } = await import("@/lib/logger");
      apiLogger.info("User signed in", { email });
      return data;
    } catch (error: any) {
      const { apiLogger } = await import("@/lib/logger");
      apiLogger.error("Sign in failed", { email, error: error.message });
      throw error;
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      const { apiLogger } = await import("@/lib/logger");
      apiLogger.info("User signed up", { email });
      return data;
    } catch (error: any) {
      const { apiLogger } = await import("@/lib/logger");
      apiLogger.error("Sign up failed", { email, error: error.message });
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      const { apiLogger } = await import("@/lib/logger");
      apiLogger.info("User signed out");
    } catch (error: any) {
      const { apiLogger } = await import("@/lib/logger");
      apiLogger.error("Sign out failed", { error: error.message });
      throw error;
    }
  },

  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error: any) {
      const { apiLogger } = await import("@/lib/logger");
      apiLogger.error("Get session failed", { error: error.message });
      throw error;
    }
  },
};
