import { runDailyMissedChallengesTracking } from '@/lib/db/queries/missed-challenges'
import { apiLogger } from '@/lib/logger'
import { NextResponse } from 'next/server'

export async function GET() {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()
  
  apiLogger.info('Cron job started: missed challenges tracking', {
    job: 'missed-challenges',
    startTime: timestamp
  })

  try {
    const result = await runDailyMissedChallengesTracking()
    const duration = Date.now() - startTime

    apiLogger.info('Cron job completed successfully: missed challenges tracking', {
      job: 'missed-challenges',
      duration: `${duration}ms`,
      result,
      completedAt: new Date().toISOString()
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Missed challenges tracking completed',
      duration: `${duration}ms`,
      result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    const duration = Date.now() - startTime
    
    apiLogger.error('Cron job failed: missed challenges tracking', { 
      job: 'missed-challenges',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`,
      failedAt: new Date().toISOString()
    })
    
    return NextResponse.json({ 
      error: 'Failed to track missed challenges',
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`
    }, { status: 500 })
  }
}