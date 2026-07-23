import { http } from '@/lib/api/http';

export const adminApi = {
  getUsers: async () => {
    return http.get<any[]>('/admin/users');
  },

  updateUserRole: async (userId: string, role: string) => {
    await http.put(`/admin/users/${userId}/role`, { role });
  },

  getLogs: async () => {
    return http.get<any[]>('/admin/logs');
  },

  getPermissions: async () => {
    return http.get<any[]>('/admin/permissions');
  },
};
