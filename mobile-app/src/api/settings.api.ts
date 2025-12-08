import { supabase } from '@/lib/supabase';

export const settingsApi = {
  async getAll(category?: string) {
    let query = supabase.from('app_settings').select('*');
    if (category) {
      query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async update(key: string, value: any) {
    const { error } = await supabase
      .from('app_settings')
      .update({ value: JSON.stringify(value) })
      .eq('key', key);
    if (error) throw error;
  },

  async getDbStats() {
    const [duas, challenges, progress] = await Promise.all([
      supabase.from('duas').select('*', { count: 'exact', head: true }),
      supabase.from('challenge_templates').select('*', { count: 'exact', head: true }),
      supabase.from('user_challenge_progress').select('*', { count: 'exact', head: true }),
    ]);

    const totalRecords = (duas.count || 0) + (challenges.count || 0) + (progress.count || 0);

    return {
      totalRecords,
      duasCount: duas.count || 0,
      challengesCount: challenges.count || 0,
      activeUsers: progress.count || 0,
    };
  },
};
