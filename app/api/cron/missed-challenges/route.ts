import { runDailyMissedChallengesTracking } from '@/lib/db/queries/missed-challenges'
import { apiLogger } from '@/lib/logger'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await runDailyMissedChallengesTracking()

    return NextResponse.json({ 
      success: true, 
      message: 'Missed challenges tracking completed',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    apiLogger.error('Error in missed challenges cron job', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json({ 
      error: 'Failed to track missed challenges',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}