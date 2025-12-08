import type { User } from "@supabase/supabase-js";
import { createContext } from "react";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
