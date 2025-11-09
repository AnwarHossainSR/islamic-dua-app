import { db } from '@/lib/db'
import {
  activityStats,
  challengeTemplates,
  duas,
  userActivityStats,
  userChallengeProgress,
} from '@/lib/db/schema'
import { and, desc, eq, like, or, sql } from 'drizzle-orm'

interface MCPFunction {
  name: string
  description: string
  parameters: Record<string, any>
}

interface DatabaseSchema {
  table: string
  description: string
  columns: Array<{
    name: string
    type: string
    description: string
  }>
}

export class EnhancedMCPServer {
  private userId: string
  private schema: DatabaseSchema[]

  constructor(userId: string) {
    this.userId = userId
    this.schema = this.buildSchemaDescription()
  }

  // Build a description of your database schema for the AI
  private buildSchemaDescription(): DatabaseSchema[] {
    return [
      {
        table: 'challenge_templates',
        description: 'Available spiritual challenges users can join',
        columns: [
          { name: 'id', type: 'string', description: 'Unique challenge ID' },
          { name: 'title_bn', type: 'string', description: 'Challenge title in Bengali' },
          { name: 'title_en', type: 'string', description: 'Challenge title in English' },
          {
            name: 'description_bn',
            type: 'string',
            description: 'Challenge description in Bengali',
          },
          { name: 'arabic_text', type: 'string', description: 'Arabic text for the challenge' },
          { name: 'translation_bn', type: 'string', description: 'Bengali translation' },
          { name: 'daily_target_count', type: 'number', description: 'Daily target count' },
          { name: 'total_days', type: 'number', description: 'Total duration in days' },
          { name: 'fazilat_bn', type: 'string', description: 'Benefits/virtues in Bengali' },
          { name: 'category', type: 'string', description: 'Challenge category' },
        ],
      },
      {
        table: 'user_challenge_progress',
        description: 'User progress in their active challenges',
        columns: [
          { name: 'id', type: 'string', description: 'Progress record ID' },
          {
            name: 'user_id',
            type: 'string',
            description: 'User ID (always filtered by current user)',
          },
          { name: 'challenge_id', type: 'string', description: 'Related challenge ID' },
          { name: 'status', type: 'string', description: 'active, paused, or completed' },
          { name: 'current_day', type: 'number', description: 'Current day in the challenge' },
          { name: 'current_streak', type: 'number', description: 'Current consecutive days' },
          { name: 'longest_streak', type: 'number', description: 'Best streak achieved' },
          { name: 'total_completed_days', type: 'number', description: 'Total days completed' },
          { name: 'missed_days', type: 'number', description: 'Total days missed' },
          { name: 'started_at', type: 'timestamp', description: 'When user started' },
          { name: 'last_completed_at', type: 'timestamp', description: 'Last completion date' },
        ],
      },
      {
        table: 'duas',
        description: 'Collection of Islamic prayers and supplications',
        columns: [
          { name: 'id', type: 'string', description: 'Dua ID' },
          { name: 'title_bn', type: 'string', description: 'Dua title in Bengali' },
          { name: 'title_en', type: 'string', description: 'Dua title in English' },
          { name: 'dua_text_ar', type: 'string', description: 'Arabic text of the dua' },
          { name: 'translation_bn', type: 'string', description: 'Bengali translation' },
          { name: 'translation_en', type: 'string', description: 'English translation' },
          { name: 'category', type: 'string', description: 'Category (morning, evening, etc)' },
          { name: 'benefits', type: 'string', description: 'Benefits of reciting this dua' },
          { name: 'is_important', type: 'boolean', description: 'Marked as important dua' },
        ],
      },
      {
        table: 'activity_stats',
        description: 'Types of spiritual activities users can track',
        columns: [
          { name: 'id', type: 'string', description: 'Activity ID' },
          { name: 'name_bn', type: 'string', description: 'Activity name in Bengali' },
          { name: 'name_en', type: 'string', description: 'Activity name in English' },
          { name: 'category', type: 'string', description: 'Activity category' },
        ],
      },
      {
        table: 'user_activity_stats',
        description: 'User statistics for tracked activities',
        columns: [
          { name: 'user_id', type: 'string', description: 'User ID' },
          { name: 'activity_stat_id', type: 'string', description: 'Related activity ID' },
          { name: 'total_completed', type: 'number', description: 'Total times completed' },
          { name: 'current_streak', type: 'number', description: 'Current streak' },
          { name: 'longest_streak', type: 'number', description: 'Best streak' },
          { name: 'last_completed_at', type: 'timestamp', description: 'Last completion' },
        ],
      },
    ]
  }

  // Main execution point
  async executeFunction(name: string, args: any = {}) {
    console.log(`[MCP] Executing: ${name}`, args)

    switch (name) {
      // Original static functions (keep these for backwards compatibility)
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

      // New dynamic functions
      case 'get_database_schema':
        return this.getDatabaseSchema()
      case 'query_user_challenges':
        return this.queryUserChallenges(args)
      case 'query_duas':
        return this.queryDuas(args)
      case 'query_user_activities':
        return this.queryUserActivities(args)
      case 'get_challenge_statistics':
        return this.getChallengeStatistics(args)
      case 'get_streak_analysis':
        return this.getStreakAnalysis()
      case 'get_completion_trends':
        return this.getCompletionTrends(args)

      default:
        throw new Error(`Unknown MCP function: ${name}`)
    }
  }

  // Return schema information to the AI
  private async getDatabaseSchema() {
    return {
      schema: this.schema,
      userContext: {
        userId: this.userId,
        note: 'All queries are automatically filtered by this user ID for security',
      },
    }
  }

  // Dynamic challenge queries
  private async queryUserChallenges(args: {
    status?: 'active' | 'paused' | 'completed'
    minStreak?: number
    minDay?: number
    difficulty?: string
    sortBy?: 'streak' | 'progress' | 'recent'
  }) {
    try {
      const results = await db.execute(sql`
        SELECT 
          ucp.id,
          ct.title_bn as "challengeTitle",
          ct.title_en as "challengeTitleEn",
          ucp.status,
          ucp.current_day as "currentDay",
          ct.total_days as "totalDays",
          ROUND((ucp.current_day::numeric / ct.total_days::numeric) * 100, 1) as "progressPercentage",
          ucp.current_streak as "currentStreak",
          ucp.longest_streak as "longestStreak",
          ucp.total_completed_days as "completedDays",
          ucp.missed_days as "missedDays",
          ucp.started_at as "startedAt",
          ucp.last_completed_at as "lastCompletedAt"
        FROM user_challenge_progress ucp
        INNER JOIN challenge_templates ct ON ucp.challenge_id = ct.id
        WHERE ucp.user_id = ${this.userId}
        ${args.status ? sql`AND ucp.status = ${args.status}` : sql``}
        ${args.minStreak ? sql`AND ucp.current_streak >= ${args.minStreak}` : sql``}
        ${args.minDay ? sql`AND ucp.current_day >= ${args.minDay}` : sql``}
        ${args.difficulty ? sql`AND ct.difficulty_level = ${args.difficulty}` : sql``}
        ORDER BY 
          ${
            args.sortBy === 'streak'
              ? sql`ucp.current_streak DESC`
              : args.sortBy === 'progress'
              ? sql`(ucp.current_day::numeric / ct.total_days::numeric) DESC`
              : sql`ucp.last_completed_at DESC NULLS LAST`
          }
      `)

      return results
    } catch (error) {
      console.error('Error in queryUserChallenges:', error)
      return []
    }
  }

  // Advanced dua search
  private async queryDuas(args: {
    category?: string
    searchText?: string
    isImportant?: boolean
    language?: 'bn' | 'en' | 'both'
    limit?: number
  }) {
    const conditions: any[] = [eq(duas.is_active, true)]

    if (args.category) {
      conditions.push(eq(duas.category, args.category))
    }

    if (args.isImportant !== undefined) {
      conditions.push(eq(duas.is_important, args.isImportant))
    }

    if (args.searchText) {
      const searchPattern = `%${args.searchText}%`
      const searchCondition = or(
        like(duas.title_bn, searchPattern),
        like(duas.title_en, searchPattern),
        like(duas.translation_bn, searchPattern),
        like(duas.benefits, searchPattern)
      )
      if (searchCondition) {
        conditions.push(searchCondition)
      }
    }

    const results = await db
      .select({
        id: duas.id,
        titleBn: duas.title_bn,
        titleEn: duas.title_en,
        duaTextAr: duas.dua_text_ar,
        translationBn: duas.translation_bn,
        translationEn: duas.translation_en,
        category: duas.category,
        benefits: duas.benefits,
        isImportant: duas.is_important,
      })
      .from(duas)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .limit(args.limit || 10)

    return results
  }

  // Get detailed statistics
  private async getChallengeStatistics(args: { challengeId?: string }) {
    if (args.challengeId) {
      const progress = await db
        .select({
          challengeTitle: challengeTemplates.title_bn,
          currentDay: userChallengeProgress.current_day,
          totalDays: challengeTemplates.total_days,
          completedDays: userChallengeProgress.total_completed_days,
          missedDays: userChallengeProgress.missed_days,
          currentStreak: userChallengeProgress.current_streak,
          longestStreak: userChallengeProgress.longest_streak,
          completionRate: sql<number>`ROUND((${userChallengeProgress.total_completed_days}::numeric / ${userChallengeProgress.current_day}::numeric) * 100, 1)`,
          status: userChallengeProgress.status,
        })
        .from(userChallengeProgress)
        .innerJoin(
          challengeTemplates,
          eq(userChallengeProgress.challenge_id, challengeTemplates.id)
        )
        .where(
          and(
            eq(userChallengeProgress.user_id, this.userId),
            eq(userChallengeProgress.challenge_id, args.challengeId)
          )
        )
        .limit(1)

      return progress[0] || null
    }

    // Overall statistics
    const allProgress = await db
      .select()
      .from(userChallengeProgress)
      .where(eq(userChallengeProgress.user_id, this.userId))

    const totalChallenges = allProgress.length
    const activeChallenges = allProgress.filter(p => p.status === 'active').length
    const completedChallenges = allProgress.filter(p => p.status === 'completed').length
    const totalCompletedDays = allProgress.reduce(
      (sum, p) => sum + (p.total_completed_days || 0),
      0
    )
    const averageStreak =
      allProgress.reduce((sum, p) => sum + (p.current_streak || 0), 0) / totalChallenges || 0
    const bestStreak = Math.max(...allProgress.map(p => p.longest_streak || 0), 0)

    return {
      totalChallenges,
      activeChallenges,
      completedChallenges,
      totalCompletedDays,
      averageStreak: Math.round(averageStreak * 10) / 10,
      bestStreak,
    }
  }

  // Analyze user's streaks
  private async getStreakAnalysis() {
    const challenges = await db
      .select({
        title: challengeTemplates.title_bn,
        currentStreak: userChallengeProgress.current_streak,
        longestStreak: userChallengeProgress.longest_streak,
        status: userChallengeProgress.status,
      })
      .from(userChallengeProgress)
      .innerJoin(challengeTemplates, eq(userChallengeProgress.challenge_id, challengeTemplates.id))
      .where(eq(userChallengeProgress.user_id, this.userId))
      .orderBy(desc(userChallengeProgress.current_streak))

    const activeStreaks = challenges.filter(c => c.status === 'active')
    const bestPerformer = challenges[0]
    const needsAttention = challenges.filter(
      (c: any) => c.currentStreak < 3 && c.status === 'active'
    )

    return {
      totalChallenges: challenges.length,
      activeStreaks: activeStreaks.length,
      bestPerformer: bestPerformer
        ? {
            title: bestPerformer.title,
            streak: bestPerformer.currentStreak,
          }
        : null,
      needsAttention: needsAttention.map(c => ({
        title: c.title,
        streak: c.currentStreak,
      })),
      allStreaks: challenges,
    }
  }

  // Get completion trends
  private async getCompletionTrends(args: { days?: number }) {
    const daysToAnalyze = args.days || 7

    const recentActivities = await db
      .select({
        challengeTitle: challengeTemplates.title_bn,
        lastCompleted: userChallengeProgress.last_completed_at,
        totalCompleted: userChallengeProgress.total_completed_days,
        currentStreak: userChallengeProgress.current_streak,
      })
      .from(userChallengeProgress)
      .innerJoin(challengeTemplates, eq(userChallengeProgress.challenge_id, challengeTemplates.id))
      .where(eq(userChallengeProgress.user_id, this.userId))
      .orderBy(desc(userChallengeProgress.last_completed_at))

    return {
      period: `Last ${daysToAnalyze} days`,
      activities: recentActivities,
      summary: `Found ${recentActivities.length} challenges with recent activity`,
    }
  }

  private async queryUserActivities(args: { sortBy?: 'streak' | 'total' }) {
    const activities = await db
      .select({
        activityName: activityStats.name_bn,
        activityNameEn: activityStats.name_en,
        totalCompleted: userActivityStats.total_completed,
        currentStreak: userActivityStats.current_streak,
        longestStreak: userActivityStats.longest_streak,
        lastCompletedAt: userActivityStats.last_completed_at,
      })
      .from(userActivityStats)
      .innerJoin(activityStats, eq(userActivityStats.activity_stat_id, activityStats.id))
      .where(eq(userActivityStats.user_id, this.userId))

    if (args.sortBy === 'streak') {
      activities.sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0))
    } else if (args.sortBy === 'total') {
      activities.sort((a, b) => (b.totalCompleted || 0) - (a.totalCompleted || 0))
    }

    return activities
  }

  // Original static methods (keeping for backwards compatibility)
  private async getUserChallenges() {
    return this.queryUserChallenges({ status: 'active' })
  }

  private async getUserProgress(challengeId?: string) {
    if (challengeId) {
      return this.getChallengeStatistics({ challengeId })
    }
    return this.getChallengeStatistics({})
  }

  private async searchDuas(query?: string) {
    if (!query) return []
    return this.queryDuas({ searchText: query })
  }

  private async getUserStats() {
    const [activities, challengeStats] = await Promise.all([
      this.queryUserActivities({}),
      this.getChallengeStatistics({}),
    ])

    return {
      activities,
      challenges: challengeStats,
    }
  }

  private async getRecentActivities() {
    return this.queryUserChallenges({ sortBy: 'recent' })
  }

  private async getChallengeByName(name?: string) {
    if (!name) return []

    return await db
      .select({
        id: challengeTemplates.id,
        titleBn: challengeTemplates.title_bn,
        titleEn: challengeTemplates.title_en,
        descriptionBn: challengeTemplates.description_bn,
        arabicText: challengeTemplates.arabic_text,
        translationBn: challengeTemplates.translation_bn,
        dailyTargetCount: challengeTemplates.daily_target_count,
        totalDays: challengeTemplates.total_days,
        fazilat: challengeTemplates.fazilat_bn,
      })
      .from(challengeTemplates)
      .where(
        or(
          like(challengeTemplates.title_bn, `%${name}%`),
          like(challengeTemplates.title_en, `%${name}%`)
        ) || eq(challengeTemplates.id, '')
      )
      .limit(5)
  }

  // Get all available functions with their descriptions
  getAvailableFunctions(): MCPFunction[] {
    return [
      {
        name: 'get_database_schema',
        description:
          'Get the complete database schema to understand what data is available. Use this first to plan your queries.',
        parameters: {},
      },
      {
        name: 'query_user_challenges',
        description:
          'Query user challenges with flexible filtering - filter by status (active/paused/completed), minimum streak, minimum day, category, and sort by streak/progress/recent',
        parameters: {
          status: {
            type: 'string',
            enum: ['active', 'paused', 'completed'],
            description: 'Filter by challenge status',
          },
          minStreak: { type: 'number', description: 'Minimum current streak' },
          minDay: { type: 'number', description: 'Minimum current day' },
          category: { type: 'string', description: 'Filter by category' },
          sortBy: {
            type: 'string',
            enum: ['streak', 'progress', 'recent'],
            description: 'How to sort results',
          },
        },
      },
      {
        name: 'query_duas',
        description: 'Search and filter duas with multiple criteria',
        parameters: {
          category: { type: 'string', description: 'Filter by category' },
          searchText: { type: 'string', description: 'Search in titles, translations, benefits' },
          isImportant: { type: 'boolean', description: 'Filter for important duas only' },
          language: {
            type: 'string',
            enum: ['bn', 'en', 'both'],
            description: 'Preferred language',
          },
          limit: { type: 'number', description: 'Maximum results (default 10)' },
        },
      },
      {
        name: 'get_challenge_statistics',
        description: 'Get detailed statistics for a specific challenge or overall user statistics',
        parameters: {
          challengeId: {
            type: 'string',
            description: 'Specific challenge ID, or omit for overall stats',
          },
        },
      },
      {
        name: 'get_streak_analysis',
        description:
          'Analyze all user streaks - shows best performers and challenges needing attention',
        parameters: {},
      },
      {
        name: 'get_completion_trends',
        description: 'Get completion trends and recent activity patterns',
        parameters: {
          days: { type: 'number', description: 'Number of days to analyze (default 7)' },
        },
      },
      {
        name: 'query_user_activities',
        description: 'Get user activity statistics with sorting options',
        parameters: {
          sortBy: {
            type: 'string',
            enum: ['streak', 'total'],
            description: 'Sort by current streak or total completed',
          },
        },
      },
      {
        name: 'search_by_category',
        description: 'Search challenges or duas by category',
        parameters: {
          category: { type: 'string', description: 'Category to search' },
          type: {
            type: 'string',
            enum: ['challenge', 'dua'],
            description: 'What to search for',
          },
        },
      },
      // Legacy functions (backwards compatible)
      {
        name: 'get_user_challenges',
        description: 'Legacy: Get active challenges (use query_user_challenges for more options)',
        parameters: {},
      },
      {
        name: 'search_duas',
        description: 'Legacy: Simple dua search (use query_duas for more options)',
        parameters: {
          query: { type: 'string', description: 'Search query' },
        },
      },
    ]
  }
}
