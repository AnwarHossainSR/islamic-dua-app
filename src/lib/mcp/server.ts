import { http } from '@/lib/api/http';

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
      // Schema is static client-side metadata; all data queries run on the
      // backend (scoped to the authenticated user).
      if (name === 'get_database_schema') {
        return this.getDatabaseSchema();
      }
      return await http.post('/mcp/execute', { name, args });
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
