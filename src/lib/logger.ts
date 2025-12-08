import { supabase } from './supabase/client';

async function logToDatabase(level: string, message: string, meta?: any) {
  try {
    await supabase.from('api_logs').insert({
      level,
      message,
      meta: meta ? JSON.stringify(meta) : null,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Failed to log to database:', error);
  }
}

export const apiLogger = {
  info: (message: string, meta?: any) => {
    console.info(message, meta);
    logToDatabase('info', message, meta);
  },
  error: (message: string, meta?: any) => {
    console.error(message, meta);
    logToDatabase('error', message, meta);
  },
  warn: (message: string, meta?: any) => {
    console.warn(message, meta);
    logToDatabase('warn', message, meta);
  },
  debug: (message: string, meta?: any) => {
    console.debug(message, meta);
    logToDatabase('debug', message, meta);
  },
};
