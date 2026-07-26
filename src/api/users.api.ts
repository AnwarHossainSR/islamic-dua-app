import { http } from '@/lib/api/http';

export const usersApi = {
  async getAll() {
    return http.get<any[]>('/users');
  },

  async addAdmin(email: string, role: string, password?: string) {
    return http.post<{
      data: any;
      userCreated: boolean;
      generatedPassword: string | null;
    }>('/users', { email, role, password });
  },

  async update(id: string, updates: { role?: string; is_active?: boolean }) {
    return http.put<any>(`/users/${id}`, updates);
  },

  async remove(id: string) {
    return http.delete<{ success: boolean }>(`/users/${id}`);
  },
};
