import { supabase } from '@/lib/supabase/client';

interface MCPFunction {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

interface DatabaseSchema {
  table: string;
  description: string;
  columns: Array<{
    name: string;
    type: string;
    description: string;
  }>;
}

export class EnhancedMCPServer {
  private userId: string;
  private schema: DatabaseSchema[];

  constructor(userId: string) {
    this.userId = userId;
    this.schema = this.buildSchemaDescription();
  }

  private buildSchemaDescription(): DatabaseSchema[] {
    return [
      {
        table: 'challenge_templates',
        description: 'Available spiritual challenges users can join',
        columns: [
          { name: 'id', type: 'string', description: 'Unique challenge ID' },
          {
            name: 'title_bn',
            type: 'string',
            description: 'Challenge title in Bengali',
          },
          {
            name: 'title_en',
            type: 'string',
            description: 'Challenge title in English',
          },
          {
            name: 'description_bn',
            type: 'string',
            description: 'Challenge description in Bengali',
          },
          {
            name: 'arabic_text',
            type: 'string',
            description: 'Arabic text for the challenge',
          },
          {
            name: 'translation_bn',
            type: 'string',
            description: 'Bengali translation',
          },
          {
            name: 'daily_target_count',
            type: 'number',
            description: 'Daily target count',
          },
          {
            name: 'total_days',
            type: 'number',
            description: 'Total duration in days',
          },
          {
            name: 'fazilat_bn',
            type: 'string',
            description: 'Benefits/virtues in Bengali',
          },
          {
            name: 'reference',
            type: 'string',
            description: 'Source/Reference (Quran/Hadith)',
          },
          {
            name: 'category',
            type: 'string',
            description: 'Challenge category',
          },
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
          {
            name: 'challenge_id',
            type: 'string',
            description: 'Related challenge ID',
          },
          {
            name: 'status',
            type: 'string',
            description: 'active, paused, or completed',
          },
          {
            name: 'current_day',
            type: 'number',
            description: 'Current day in the challenge',
          },
          {
            name: 'current_streak',
            type: 'number',
            description: 'Current consecutive days',
          },
          {
            name: 'longest_streak',
            type: 'number',
            description: 'Best streak achieved',
          },
          {
            name: 'total_completed_days',
            type: 'number',
            description: 'Total days completed',
          },
          {
            name: 'missed_days',
            type: 'number',
            description: 'Total days missed',
          },
          {
            name: 'started_at',
            type: 'timestamp',
            description: 'When user started',
          },
          {
            name: 'last_completed_at',
            type: 'timestamp',
            description: 'Last completion date',
          },
        ],
      },
      {
        table: 'duas',
        description: 'Collection of Islamic prayers and supplications',
        columns: [
          { name: 'id', type: 'string', description: 'Dua ID' },
          {
            name: 'title_bn',
            type: 'string',
            description: 'Dua title in Bengali',
          },
          {
            name: 'title_en',
            type: 'string',
            description: 'Dua title in English',
          },
          {
            name: 'dua_text_ar',
            type: 'string',
            description: 'Arabic text of the dua',
          },
          {
            name: 'translation_bn',
            type: 'string',
            description: 'Bengali translation',
          },
          {
            name: 'translation_en',
            type: 'string',
            description: 'English translation',
          },
          {
            name: 'category',
            type: 'string',
            description: 'Category (morning, evening, etc)',
          },
          {
            name: 'benefits',
            type: 'string',
            description: 'Benefits of reciting this dua',
          },
          {
            name: 'is_important',
            type: 'boolean',
            description: 'Marked as important dua',
          },
        ],
      },
    ];
  }

  async executeFunction(name: string, args: any = {}) {
    console.log(`[MCP] Executing: ${name}`, args);

    try {
      switch (name) {
        case 'get_database_schema':
          return this.getDatabaseSchema();
        case 'query_user_challenges':
          return this.queryUserChallenges(args);
        case 'query_duas':
          return this.queryDuas(args);
        case 'get_challenge_statistics':
          return this.getChallengeStatistics(args);
        case 'get_streak_analysis':
          return this.getStreakAnalysis();
        case 'get_user_challenges':
          return this.getUserChallenges();
        case 'search_duas':
          return this.searchDuas(args.query);
        default:
          throw new Error(`Unknown MCP function: ${name}`);
      }
    } catch (error: any) {
      const { apiLogger } = await import('@/lib/logger');
      apiLogger.error('MCP function execution failed', {
        function: name,
        args,
        error: error.message,
      });
      throw error;
    }
  }

  private async getDatabaseSchema() {
    return {
      schema: this.schema,
      userContext: {
        userId: this.userId,
        note: 'All queries are automatically filtered by this user ID for security',
      },
    };
  }

  private async queryUserChallenges(args: {
    status?: 'active' | 'paused' | 'completed';
    minStreak?: number;
  }) {
    let query = supabase
      .from('user_challenge_progress')
      .select(
        `
        id,
        status,
        current_day,
        current_streak,
        longest_streak,
        total_completed_days,
        missed_days,
        started_at,
        last_completed_at,
        challenge_templates (
          title_bn,
          title_en,
          total_days,
          reference,
          difficulty_level
        )
      `
      )
      .eq('user_id', this.userId);

    if (args.status) {
      query = query.eq('status', args.status);
    }

    if (args.minStreak) {
      query = query.gte('current_streak', args.minStreak);
    }

    const { data, error } = await query.order('last_completed_at', {
      ascending: false,
    });

    if (error) {
      const { apiLogger } = await import('@/lib/logger');
      apiLogger.error('Query user challenges failed', {
        userId: this.userId,
        args,
        error: error.message,
      });
      throw error;
    }

    return (
      data?.map((item: any) => ({
        id: item.id,
        challengeTitle: item.challenge_templates?.title_bn,
        challengeTitleEn: item.challenge_templates?.title_en,
        status: item.status,
        currentDay: item.current_day,
        totalDays: item.challenge_templates?.total_days,
        progressPercentage: item.challenge_templates?.total_days
          ? Math.round((item.current_day / item.challenge_templates.total_days) * 100)
          : 0,
        currentStreak: item.current_streak,
        longestStreak: item.longest_streak,
        completedDays: item.total_completed_days,
        missedDays: item.missed_days,
        startedAt: item.started_at,
        lastCompletedAt: item.last_completed_at,
      })) || []
    );
  }

  private async queryDuas(args: {
    category?: string;
    searchText?: string;
    isImportant?: boolean;
    limit?: number;
  }) {
    let query = supabase.from('duas').select('*').eq('is_active', true);

    if (args.category) {
      query = query.eq('category', args.category);
    }

    if (args.isImportant !== undefined) {
      query = query.eq('is_important', args.isImportant);
    }

    if (args.searchText) {
      query = query.or(
        `title_bn.ilike.%${args.searchText}%,title_en.ilike.%${args.searchText}%,translation_bn.ilike.%${args.searchText}%`
      );
    }

    const { data, error } = await query.limit(args.limit || 10);

    if (error) {
      const { apiLogger } = await import('@/lib/logger');
      apiLogger.error('Query duas failed', {
        userId: this.userId,
        args,
        error: error.message,
      });
      throw error;
    }

    return (
      data?.map((dua: any) => ({
        id: dua.id,
        titleBn: dua.title_bn,
        titleEn: dua.title_en,
        duaTextAr: dua.dua_text_ar,
        translationBn: dua.translation_bn,
        translationEn: dua.translation_en,
        category: dua.category,
        benefits: dua.benefits,
        isImportant: dua.is_important,
      })) || []
    );
  }

  private async getChallengeStatistics(args: { challengeId?: string }) {
    if (args.challengeId) {
      const { data, error } = await supabase
        .from('user_challenge_progress')
        .select(
          `
          current_day,
          total_completed_days,
          missed_days,
          current_streak,
          longest_streak,
          status,
          challenge_templates (
            title_bn,
            total_days,
            reference
          )
        `
        )
        .eq('user_id', this.userId)
        .eq('challenge_id', args.challengeId)
        .single();

      if (error) {
        const { apiLogger } = await import('@/lib/logger');
        apiLogger.error('Get challenge statistics failed', {
          userId: this.userId,
          challengeId: args.challengeId,
          error: error.message,
        });
        throw error;
      }

      return {
        challengeTitle: (data as any).challenge_templates?.title_bn,
        reference: (data as any).challenge_templates?.reference,
        currentDay: data.current_day,
        totalDays: (data as any).challenge_templates?.total_days,
        completedDays: data.total_completed_days,
        missedDays: data.missed_days,
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        completionRate:
          data.current_day > 0
            ? Math.round((data.total_completed_days / data.current_day) * 100)
            : 0,
        status: data.status,
      };
    }

    const { data, error } = await supabase
      .from('user_challenge_progress')
      .select('*')
      .eq('user_id', this.userId);

    if (error) {
      const { apiLogger } = await import('@/lib/logger');
      apiLogger.error('Get overall statistics failed', {
        userId: this.userId,
        error: error.message,
      });
      throw error;
    }

    const allProgress = data || [];
    const totalChallenges = allProgress.length;
    const activeChallenges = allProgress.filter((p) => p.status === 'active').length;
    const completedChallenges = allProgress.filter((p) => p.status === 'completed').length;
    const totalCompletedDays = allProgress.reduce(
      (sum, p) => sum + (p.total_completed_days || 0),
      0
    );
    const averageStreak =
      allProgress.reduce((sum, p) => sum + (p.current_streak || 0), 0) / totalChallenges || 0;
    const bestStreak = Math.max(...allProgress.map((p) => p.longest_streak || 0), 0);

    return {
      totalChallenges,
      activeChallenges,
      completedChallenges,
      totalCompletedDays,
      averageStreak: Math.round(averageStreak * 10) / 10,
      bestStreak,
    };
  }

  private async getStreakAnalysis() {
    const { data, error } = await supabase
      .from('user_challenge_progress')
      .select(
        `
        current_streak,
        longest_streak,
        status,
        challenge_templates (
          title_bn
        )
      `
      )
      .eq('user_id', this.userId)
      .order('current_streak', { ascending: false });

    if (error) {
      const { apiLogger } = await import('@/lib/logger');
      apiLogger.error('Get streak analysis failed', {
        userId: this.userId,
        error: error.message,
      });
      throw error;
    }

    const challenges =
      data?.map((item: any) => ({
        title: item.challenge_templates?.title_bn,
        currentStreak: item.current_streak,
        longestStreak: item.longest_streak,
        status: item.status,
      })) || [];

    const activeStreaks = challenges.filter((c) => c.status === 'active');
    const bestPerformer = challenges[0];
    const needsAttention = challenges.filter((c) => c.currentStreak < 3 && c.status === 'active');

    return {
      totalChallenges: challenges.length,
      activeStreaks: activeStreaks.length,
      bestPerformer: bestPerformer
        ? {
            title: bestPerformer.title,
            streak: bestPerformer.currentStreak,
          }
        : null,
      needsAttention: needsAttention.map((c) => ({
        title: c.title,
        streak: c.currentStreak,
      })),
      allStreaks: challenges,
    };
  }

  private async getUserChallenges() {
    return this.queryUserChallenges({ status: 'active' });
  }

  private async searchDuas(query?: string) {
    if (!query) return [];
    return this.queryDuas({ searchText: query });
  }

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
          'Query user challenges with flexible filtering - filter by status (active/paused/completed), minimum streak',
        parameters: {
          status: {
            type: 'string',
            enum: ['active', 'paused', 'completed'],
            description: 'Filter by challenge status',
          },
          minStreak: { type: 'number', description: 'Minimum current streak' },
        },
      },
      {
        name: 'query_duas',
        description: 'Search and filter duas with multiple criteria',
        parameters: {
          category: { type: 'string', description: 'Filter by category' },
          searchText: {
            type: 'string',
            description: 'Search in titles, translations, benefits',
          },
          isImportant: {
            type: 'boolean',
            description: 'Filter for important duas only',
          },
          limit: {
            type: 'number',
            description: 'Maximum results (default 10)',
          },
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
        name: 'get_user_challenges',
        description: 'Get active challenges',
        parameters: {},
      },
      {
        name: 'search_duas',
        description: 'Simple dua search',
        parameters: {
          query: { type: 'string', description: 'Search query' },
        },
      },
    ];
  }
}
