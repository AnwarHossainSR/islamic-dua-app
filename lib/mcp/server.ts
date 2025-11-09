import { db } from '@/lib/db'
import {
  activityStats,
  challengeTemplates,
  duas,
  userActivityStats,
  userChallengeProgress,
} from '@/lib/db/schema'
import { and, count, desc, eq, like } from 'drizzle-orm'

interface MCPFunction {
  name: string
  description: string
  parameters: Record<string, any>
}

interface MCPFunctionArgs {
  challengeId?: string
  query?: string
  name?: string
}

export class MCPServer {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  async executeFunction(name: string, args: MCPFunctionArgs = {}) {
    switch (name) {
      case 'get_user_challenges':
        return this.getUserChallenges()
      case 'get_user_progress':
        return this.getUserProgress(args?.challengeId)
      case 'search_duas':
        return this.searchDuas(args.query)
      case 'get_user_stats':
        return this.getUserStats()
      case 'get_recent_activities':
        return this.getRecentActivities()
      case 'get_challenge_by_name':
        return this.getChallengeByName(args.name)
      default:
        throw new Error(`Unknown function: ${name}`)
    }
  }

  private async getUserChallenges() {
    return await db
      .select({
        id: userChallengeProgress.id,
        challengeTitle: challengeTemplates.title_bn,
        status: userChallengeProgress.status,
        currentDay: userChallengeProgress.current_day,
        totalDays: challengeTemplates.total_days,
        currentStreak: userChallengeProgress.current_streak,
        longestStreak: userChallengeProgress.longest_streak,
        startedAt: userChallengeProgress.started_at,
      })
      .from(userChallengeProgress)
      .innerJoin(challengeTemplates, eq(userChallengeProgress.challenge_id, challengeTemplates.id))
      .where(eq(userChallengeProgress.user_id, this.userId))
  }

  private async getUserProgress(challengeId?: string) {
    const baseQuery = db
      .select({
        challengeTitle: challengeTemplates.title_bn,
        currentDay: userChallengeProgress.current_day,
        totalDays: challengeTemplates.total_days,
        completedDays: userChallengeProgress.total_completed_days,
        missedDays: userChallengeProgress.missed_days,
        currentStreak: userChallengeProgress.current_streak,
        status: userChallengeProgress.status,
      })
      .from(userChallengeProgress)
      .innerJoin(challengeTemplates, eq(userChallengeProgress.challenge_id, challengeTemplates.id))

    if (challengeId) {
      return await baseQuery.where(
        and(
          eq(userChallengeProgress.user_id, this.userId),
          eq(userChallengeProgress.challenge_id, challengeId)
        )
      )
    }
    return await baseQuery.where(eq(userChallengeProgress.user_id, this.userId))
  }

  private async searchDuas(query?: string) {
    if (!query) return []

    return await db
      .select({
        id: duas.id,
        titleBn: duas.title_bn,
        titleEn: duas.title_en,
        duaTextAr: duas.dua_text_ar,
        translationBn: duas.translation_bn,
        category: duas.category,
        benefits: duas.benefits,
      })
      .from(duas)
      .where(and(eq(duas.is_active, true), like(duas.title_bn, `%${query}%`)))
      .limit(10)
  }

  private async getUserStats() {
    const stats = await db
      .select({
        activityName: activityStats.name_bn,
        totalCompleted: userActivityStats.total_completed,
        currentStreak: userActivityStats.current_streak,
        longestStreak: userActivityStats.longest_streak,
        lastCompletedAt: userActivityStats.last_completed_at,
      })
      .from(userActivityStats)
      .innerJoin(activityStats, eq(userActivityStats.activity_stat_id, activityStats.id))
      .where(eq(userActivityStats.user_id, this.userId))

    const challengeCount = await db
      .select({ count: count() })
      .from(userChallengeProgress)
      .where(eq(userChallengeProgress.user_id, this.userId))

    return {
      activities: stats,
      totalChallenges: challengeCount[0]?.count || 0,
    }
  }

  private async getRecentActivities() {
    return await db
      .select({
        challengeTitle: challengeTemplates.title_bn,
        status: userChallengeProgress.status,
        lastCompletedAt: userChallengeProgress.last_completed_at,
        currentStreak: userChallengeProgress.current_streak,
      })
      .from(userChallengeProgress)
      .innerJoin(challengeTemplates, eq(userChallengeProgress.challenge_id, challengeTemplates.id))
      .where(eq(userChallengeProgress.user_id, this.userId))
      .orderBy(desc(userChallengeProgress.last_completed_at))
      .limit(5)
  }

  private async getChallengeByName(name?: string) {
    if (!name) return []

    return await db
      .select({
        id: challengeTemplates.id,
        titleBn: challengeTemplates.title_bn,
        descriptionBn: challengeTemplates.description_bn,
        arabicText: challengeTemplates.arabic_text,
        translationBn: challengeTemplates.translation_bn,
        dailyTargetCount: challengeTemplates.daily_target_count,
        totalDays: challengeTemplates.total_days,
        fazilat: challengeTemplates.fazilat_bn,
      })
      .from(challengeTemplates)
      .where(like(challengeTemplates.title_bn, `%${name}%`))
      .limit(5)
  }

  getAvailableFunctions(): MCPFunction[] {
    return [
      {
        name: 'get_user_challenges',
        description: 'Get all challenges the user is currently participating in',
        parameters: {},
      },
      {
        name: 'get_user_progress',
        description: 'Get detailed progress for user challenges',
        parameters: {
          challengeId: {
            type: 'string',
            description: 'Optional challenge ID to get specific progress',
          },
        },
      },
      {
        name: 'search_duas',
        description: 'Search for duas by title or content',
        parameters: {
          query: { type: 'string', description: 'Search query for duas' },
        },
      },
      {
        name: 'get_user_stats',
        description: 'Get user activity statistics and overall progress',
        parameters: {},
      },
      {
        name: 'get_recent_activities',
        description: 'Get user recent challenge activities',
        parameters: {},
      },
      {
        name: 'get_challenge_by_name',
        description: 'Find challenges by name',
        parameters: {
          name: { type: 'string', description: 'Challenge name to search for' },
        },
      },
    ] as const
  }
}
