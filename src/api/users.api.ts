import { supabaseAdmin } from '@/lib/supabase/admin';
import { supabase } from '@/lib/supabase/client';

export const usersApi = {
  async getAll() {
    const { data: adminUsers } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (!adminUsers) return [];

    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();

    return adminUsers.map((adminUser) => {
      const authUser = authData?.users.find((u) => u.id === adminUser.user_id);
      return {
        ...adminUser,
        email: authUser?.email || 'Unknown',
      };
    });
  },

  async addAdmin(email: string, role: string, password?: string) {
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    let user = users?.users.find((u) => u.email === email);
    let generatedPassword = null;
    let userCreated = false;

    if (!user) {
      generatedPassword = password || `${Math.random().toString(36).slice(-8)}A1!`;
      const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: generatedPassword,
        email_confirm: true,
      });

      if (error) throw error;
      user = newUser.user;
      userCreated = true;
    }

    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingAdmin) {
      throw new Error('User is already an admin');
    }

    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        user_id: user.id,
        email: user.email || email,
        role,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      data,
      userCreated,
      generatedPassword: userCreated ? generatedPassword : null,
    };
  },

  async update(id: string, updates: { role?: string; is_active?: boolean }) {
    const { data, error } = await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async remove(id: string) {
    const { error } = await supabase.from('admin_users').delete().eq('id', id);

    if (error) throw error;
    return { success: true };
  },
};
