import { supabase } from '@/lib/supabase/client';

const { apiLogger } = await import('@/lib/logger');

export const missedChallengesApi = {
  getMissedChallenges: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_missed_challenges')
      .select(
        `
        *,
        challenge:challenge_templates(id, title_bn, icon, color)
      `
      )
      .eq('user_id', userId)
      .order('missed_date', { ascending: false });

    if (error) throw error;

    return data.map((item) => ({
      ...item,
      challenge_id: item.challenge_id,
      challenge_title_bn: item.challenge?.title_bn,
      challenge_icon: item.challenge?.icon,
      challenge_color: item.challenge?.color,
      days_ago: Math.floor(
        (Date.now() - new Date(item.missed_date).getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));
  },

  getSummary: async (userId: string) => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const [total, last7, last30, mostMissed] = await Promise.all([
      supabase
        .from('user_missed_challenges')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),

      supabase
        .from('user_missed_challenges')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('missed_date', sevenDaysAgo),

      supabase
        .from('user_missed_challenges')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('missed_date', thirtyDaysAgo),

      supabase
        .from('user_missed_challenges')
        .select('challenge_id, challenge:challenge_templates(title_bn)')
        .eq('user_id', userId),
    ]);

    const challengeCounts = mostMissed.data?.reduce(
      (acc, item) => {
        const id = item.challenge_id;
        acc[id] = (acc[id] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostMissedId = challengeCounts
      ? Object.entries(challengeCounts).sort((a, b) => b[1] - a[1])[0]
      : null;
    const mostMissedChallenge = mostMissedId
      ? mostMissed.data?.find((i) => i.challenge_id === mostMissedId[0])
      : null;

    return {
      total_missed: total.count || 0,
      last_7_days: last7.count || 0,
      last_30_days: last30.count || 0,
      most_missed_challenge: mostMissedChallenge
        ? {
            title_bn: (mostMissedChallenge.challenge as any)?.title_bn,
            count: mostMissedId?.[1],
          }
        : null,
    };
  },

  sync: async (userId: string) => {
    const startTime = Date.now();

    apiLogger.info('Sync started: missed challenges tracking', {
      job: 'missed-challenges',
      userId,
      startTime: new Date().toISOString(),
    });

    try {
      // Get active challenges for user
      const { data: activeProgress } = await supabase
        .from('user_challenge_progress')
        .select('challenge_id')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (!activeProgress || activeProgress.length === 0) {
        apiLogger.info('No active challenges to track');
        return { success: true, message: 'No active challenges' };
      }

      // Get today's date in Bangladesh timezone
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayBd = new Date(yesterday.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
      const yesterdayDate = yesterdayBd.toLocaleDateString('en-CA');

      // Check which challenges were not completed yesterday
      const { data: completedYesterday } = await supabase
        .from('user_challenge_daily_logs')
        .select('challenge_id')
        .eq('user_id', userId)
        .eq('completion_date', yesterdayDate)
        .eq('is_completed', true);

      const completedIds = new Set(completedYesterday?.map((c) => c.challenge_id) || []);
      const missedChallenges = activeProgress.filter((p) => !completedIds.has(p.challenge_id));

      // Insert missed challenges
      if (missedChallenges.length > 0) {
        await supabase.from('user_missed_challenges').insert(
          missedChallenges.map((c) => ({
            user_id: userId,
            challenge_id: c.challenge_id,
            missed_date: yesterdayDate,
            reason: 'not_completed',
            was_active: true,
          }))
        );
      }

      const duration = Date.now() - startTime;
      apiLogger.info('Sync completed successfully', {
        job: 'missed-challenges',
        duration: `${duration}ms`,
        missedCount: missedChallenges.length,
        completedAt: new Date().toISOString(),
      });

      return { success: true, missedCount: missedChallenges.length };
    } catch (error) {
      const duration = Date.now() - startTime;
      apiLogger.error('Sync failed: missed challenges tracking', {
        job: 'missed-challenges',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
        failedAt: new Date().toISOString(),
      });
      throw error;
    }
  },

  getLastSyncTime: async () => {
    const { data } = await supabase
      .from('user_missed_challenges')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return data?.created_at ? new Date(data.created_at).getTime() : null;
  },
};
