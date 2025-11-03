import { eq, desc, and, count, sql } from 'drizzle-orm'
import { db } from '../index'
import { apiLogs } from '../schema'

export async function getLogs({
  page = 1,
  limit = 25,
  level = 'all'
}: {
  page?: number
  limit?: number
  level?: string
}) {
  const offset = (page - 1) * limit
  
  let whereCondition = undefined
  if (level !== 'all') {
    whereCondition = eq(apiLogs.level, level)
  }

  const [logsResult, totalResult] = await Promise.all([
    db
      .select()
      .from(apiLogs)
      .where(whereCondition)
      .orderBy(desc(apiLogs.timestamp))
      .limit(limit)
      .offset(offset),
    
    db
      .select({ count: count() })
      .from(apiLogs)
      .where(whereCondition)
  ])

  return {
    logs: logsResult,
    total: totalResult[0].count
  }
}

export async function insertLog({
  level,
  message,
  meta
}: {
  level: string
  message: string
  meta?: string
}) {
  return await db
    .insert(apiLogs)
    .values({
      level,
      message,
      meta,
      timestamp: new Date()
    })
    .returning()
}

export async function clearAllLogs() {
  return await db.delete(apiLogs)
}