import { supabase } from "@/lib/supabase/client";

export const activityApi = {
  getUserRecentLogs: async (limit: number = 10) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("user_challenge_daily_logs")
      .select(`
        id,
        day_number,
        count_completed,
        completed_at,
        is_completed,
        created_at,
        user_progress:user_challenge_progress!inner(
          challenge:challenge_templates(
            title_bn,
            icon
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};
