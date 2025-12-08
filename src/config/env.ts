export const env = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  },
} as const;

export const ENV = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
} as const;

export function validateEnv() {
  if (!env.supabase.url || !env.supabase.anonKey) {
    throw new Error('Missing required environment variables');
  }
}
