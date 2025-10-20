import winston from 'winston'
import { getSupabaseServerClient } from './supabase/server'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})

export async function logToDatabase(level: string, message: string, meta?: any) {
  try {
    const supabase = await getSupabaseServerClient()
    await supabase.from('api_logs').insert({
      level,
      message,
      meta: meta ? JSON.stringify(meta) : null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to log to database:', error)
  }
}

export const apiLogger = {
  info: (message: string, meta?: any) => {
    logger.info(message, meta)
    logToDatabase('info', message, meta)
  },
  error: (message: string, meta?: any) => {
    logger.error(message, meta)
    logToDatabase('error', message, meta)
  },
  warn: (message: string, meta?: any) => {
    logger.warn(message, meta)
    logToDatabase('warn', message, meta)
  },
  debug: (message: string, meta?: any) => {
    logger.debug(message, meta)
    logToDatabase('debug', message, meta)
  }
}

export default logger