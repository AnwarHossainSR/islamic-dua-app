export const env = {
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  },
} as const;

export const ENV = {
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
} as const;

export function validateEnv() {
  // The database now lives behind the app's own `/api` backend (SQLite/Turso),
  // so no client-side database credentials are required.
}
