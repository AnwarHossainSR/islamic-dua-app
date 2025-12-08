import { supabase } from '@/lib/supabase';

// Helper to get today's date in YYYY-MM-DD format
function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to get date N days ago in YYYY-MM-DD format
function getDaysAgoString(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const dashboardApi = {
  async getUserStats(userId: string) {
    const { data: userActivities } = await supabase
      .from('user_activity_stats')
      .select('total_completed')
      .eq('user_id', userId);

    const totalActivities = userActivities?.length || 0;
    const totalCompletions = userActivities?.reduce((sum, a) => sum + a.total_completed, 0) || 0;

    const { count: activeChallenges } = await supabase
      .from('user_challenge_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active');

    const today = getTodayString();

    const { count: todayCompletions } = await supabase
      .from('user_challenge_daily_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_completed', true)
      .gte('completion_date', today)
      .lte('completion_date', today);

    const weekAgoStr = getDaysAgoString(7);

    const { count: weekCompletions } = await supabase
      .from('user_challenge_daily_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_completed', true)
      .gte('completion_date', weekAgoStr);

    return {
      totalActivities,
      totalCompletions,
      totalActiveUsers: 1,
      activeChallenges: activeChallenges || 0,
      todayCompletions: todayCompletions || 0,
      yesterdayCompletions: 0,
      weekCompletions: weekCompletions || 0,
    };
  },

  async getGlobalStats() {
    const { count: totalActivities } = await supabase
      .from('activity_stats')
      .select('*', { count: 'exact', head: true });

    const { data: activities } = await supabase.from('activity_stats').select('total_count');

    const totalCompletions = activities?.reduce((sum, a) => sum + a.total_count, 0) || 0;

    const { count: totalActiveUsers } = await supabase
      .from('user_activity_stats')
      .select('*', { count: 'exact', head: true });

    const { count: activeChallenges } = await supabase
      .from('challenge_templates')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const today = getTodayString();

    const { count: todayCompletions } = await supabase
      .from('user_challenge_daily_logs')
      .select('*', { count: 'exact', head: true })
      .eq('is_completed', true)
      .gte('completion_date', today)
      .lte('completion_date', today);

    const weekAgoStr = getDaysAgoString(7);

    const { count: weekCompletions } = await supabase
      .from('user_challenge_daily_logs')
      .select('*', { count: 'exact', head: true })
      .eq('is_completed', true)
      .gte('completion_date', weekAgoStr);

    return {
      totalActivities: totalActivities || 0,
      totalCompletions,
      totalActiveUsers: totalActiveUsers || 0,
      activeChallenges: activeChallenges || 0,
      todayCompletions: todayCompletions || 0,
      yesterdayCompletions: 0,
      weekCompletions: weekCompletions || 0,
    };
  },

  async getUserTopActivities(userId: string, limit = 10) {
    const { data } = await supabase
      .from('user_activity_stats')
      .select(
        `
        total_completed,
        activity_stats (
          id,
          name_bn,
          name_ar,
          name_en,
          icon,
          color
        )
      `
      )
      .eq('user_id', userId)
      .order('total_completed', { ascending: false })
      .limit(limit);

    return (
      data?.map((item: any) => ({
        id: item.activity_stats.id,
        name_bn: item.activity_stats.name_bn,
        name_ar: item.activity_stats.name_ar,
        name_en: item.activity_stats.name_en,
        total_count: item.total_completed,
        total_users: 1,
        icon: item.activity_stats.icon,
        color: item.activity_stats.color,
      })) || []
    );
  },

  async getGlobalTopActivities(limit = 10) {
    const { data } = await supabase
      .from('activity_stats')
      .select('id, name_bn, name_ar, name_en, total_count, total_users, icon, color')
      .order('total_count', { ascending: false })
      .limit(limit);

    return data || [];
  },
};
