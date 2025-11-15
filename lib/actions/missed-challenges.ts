'use server'

import {
  getMissedChallengesSummary,
  getUserMissedChallenges,
  runDailyMissedChallengesTracking,
  getLastSyncTime,
} from '@/lib/db/queries/missed-challenges'
import { getUser } from './auth'

export async function getMissedChallenges() {
  try {
    const user = await getUser()
    if (!user) return []

    return await getUserMissedChallenges(user.id)
  } catch (error) {
    console.error('Error fetching missed challenges:', error)
    return []
  }
}

export async function getMissedChallengesSummaryData() {
  try {
    const user = await getUser()
    if (!user)
      return {
        total_missed: 0,
        last_7_days: 0,
        last_30_days: 0,
        most_missed_challenge: null,
      }

    return await getMissedChallengesSummary(user.id)
  } catch (error) {
    console.error('Error fetching missed challenges summary:', error)
    return {
      total_missed: 0,
      last_7_days: 0,
      last_30_days: 0,
      most_missed_challenge: null,
    }
  }
}

export async function trackDailyMissedChallenges() {
  try {
    await runDailyMissedChallengesTracking()
    return { success: true }
  } catch (error) {
    console.error('Error tracking daily missed challenges:', error)
    return { success: false, error: 'Failed to track missed challenges' }
  }
}

export async function getLastSyncTimeAction() {
  try {
    return await getLastSyncTime()
  } catch (error) {
    console.error('Error getting last sync time:', error)
    return null
  }
}
