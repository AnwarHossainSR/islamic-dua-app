import { supabase } from '@/lib/supabase/client';

export const adminApi = {
  getUsers: async () => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  updateUserRole: async (userId: string, role: string) => {
    const { error } = await supabase.from('user_roles').upsert({ user_id: userId, role });

    if (error) throw error;
  },

  getLogs: async () => {
    const { data, error } = await supabase
      .from('api_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data;
  },

  getPermissions: async () => {
    const { data, error } = await supabase.from('permissions').select('*');

    if (error) throw error;
    return data;
  },
};
