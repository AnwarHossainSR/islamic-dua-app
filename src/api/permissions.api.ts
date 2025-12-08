import { supabaseAdmin } from '@/lib/supabase/admin';
import { supabase } from '@/lib/supabase/client';

export const permissionsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('resource', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getAllRolesWithPermissions() {
    const roles = ['user', 'editor', 'admin', 'super_admin'];
    const rolesData = await Promise.all(
      roles.map(async (role) => {
        const { data } = await supabase
          .from('role_permissions')
          .select('permission:permissions(*)')
          .eq('role', role);

        return {
          role,
          permissions: data?.map((rp: any) => rp.permission).filter(Boolean) || [],
        };
      })
    );

    return rolesData;
  },

  async getUserPermissions(userId: string) {
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!adminUser) return null;

    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = authUsers.users.find((u) => u.id === userId);

    const { data: rolePermissions } = await supabase
      .from('role_permissions')
      .select('permission:permissions(*)')
      .eq('role', adminUser.role);

    const { data: allPermissions } = await supabase
      .from('permissions')
      .select('*')
      .order('resource', { ascending: true });

    const permissions = rolePermissions?.map((rp: any) => rp.permission).filter(Boolean) || [];

    return {
      ...adminUser,
      email: authUser?.email || 'Unknown',
      permissions,
      allPermissions: allPermissions || [],
    };
  },

  async addPermissionToRole(role: string, permissionId: string) {
    const { error } = await supabase
      .from('role_permissions')
      .insert({ role, permission_id: permissionId });

    if (error) throw error;
    return { success: true };
  },

  async removePermissionFromRole(role: string, permissionId: string) {
    const { error } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role', role)
      .eq('permission_id', permissionId);

    if (error) throw error;
    return { success: true };
  },

  async create(permission: {
    name: string;
    description?: string;
    resource?: string;
    action?: string;
  }) {
    const { data, error } = await supabase.from('permissions').insert(permission).select().single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: { name?: string; description?: string; resource?: string; action?: string }
  ) {
    const { data, error } = await supabase
      .from('permissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('permissions').delete().eq('id', id);

    if (error) throw error;
    return { success: true };
  },
};
