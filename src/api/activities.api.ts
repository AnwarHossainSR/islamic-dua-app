import { supabase } from '@/lib/supabase/client';

export const activitiesApi = {
  getUserActivities: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_activity_stats')
      .select(
        `
        *,
        activity:activity_stats(*)
      `
      )
      .eq('user_id', userId)
      .order('total_completed', { ascending: false });

    if (error) throw error;
    return data;
  },

  getActivityById: async (activityId: string) => {
    const { data, error } = await supabase
      .from('activity_stats')
      .select('*')
      .eq('id', activityId)
      .single();

    if (error) throw error;
    return data;
  },

  getTopUsers: async (activityId: string, limit: number = 10) => {
    const { data, error } = await supabase
      .from('user_activity_stats')
      .select('*')
      .eq('activity_stat_id', activityId)
      .order('total_completed', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  getUserDailyLogs: async (activityId: string, userId: string) => {
    const { data: mappings } = await supabase
      .from('challenge_activity_mapping')
      .select('challenge_id')
      .eq('activity_stat_id', activityId);

    if (!mappings || mappings.length === 0) return [];

    const challengeIds = mappings.map((m) => m.challenge_id);

    const { data, error } = await supabase
      .from('user_challenge_daily_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', true)
      .in('challenge_id', challengeIds)
      .order('completion_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  getUserChallengeStats: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_challenge_progress')
      .select('current_streak, longest_streak, total_completed_days, status')
      .eq('user_id', userId);

    if (error) throw error;

    const totalCompleted = data?.filter((p: any) => p.status === 'completed').length || 0;
    const totalActive = data?.filter((p: any) => p.status === 'active').length || 0;
    const longestStreak = Math.max(...(data?.map((p) => p.longest_streak || 0) || [0]));
    const totalDaysCompleted =
      data?.reduce((sum, p) => sum + (p.total_completed_days || 0), 0) || 0;

    return {
      totalCompleted,
      totalActive,
      longestStreak,
      totalDaysCompleted,
    };
  },

  addActivityCount: async (activityId: string, userId: string, count: number) => {
    // Update activity stats total_count
    const { data: activity } = await supabase
      .from('activity_stats')
      .select('total_count')
      .eq('id', activityId)
      .single();

    if (activity) {
      await supabase
        .from('activity_stats')
        .update({ total_count: (activity.total_count || 0) + count })
        .eq('id', activityId);
    }

    // Update user activity stats
    const { data: userStats } = await supabase
      .from('user_activity_stats')
      .select('total_completed')
      .eq('user_id', userId)
      .eq('activity_stat_id', activityId)
      .single();

    if (userStats) {
      await supabase
        .from('user_activity_stats')
        .update({ total_completed: (userStats.total_completed || 0) + count })
        .eq('user_id', userId)
        .eq('activity_stat_id', activityId);
    }
  },
};
