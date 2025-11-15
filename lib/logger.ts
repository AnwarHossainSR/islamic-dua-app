import winston from 'winston'
import { db } from './db'
import { apiLogs } from './db/schema'

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
    await db.insert(apiLogs).values({
      level,
      message,
      meta: meta ? JSON.stringify(meta) : null,
      timestamp: Date.now()
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