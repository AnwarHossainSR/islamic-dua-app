import { http } from '@/lib/api/http';

export const permissionsApi = {
  async getAll() {
    return http.get<any[]>('/permissions');
  },

  async getAllRolesWithPermissions() {
    return http.get<{ role: string; permissions: any[] }[]>('/permissions/roles');
  },

  async getUserPermissions(userId: string) {
    return http.get<any>(`/permissions/user/${userId}`);
  },

  async addPermissionToRole(role: string, permissionId: string) {
    return http.post<{ success: boolean }>(`/permissions/roles/${role}`, { permissionId });
  },

  async removePermissionFromRole(role: string, permissionId: string) {
    return http.delete<{ success: boolean }>(`/permissions/roles/${role}/${permissionId}`);
  },

  async create(permission: {
    name: string;
    description?: string;
    resource?: string;
    action?: string;
  }) {
    return http.post<any>('/permissions', permission);
  },

  async update(
    id: string,
    updates: { name?: string; description?: string; resource?: string; action?: string }
  ) {
    return http.put<any>(`/permissions/${id}`, updates);
  },

  async delete(id: string) {
    return http.delete<{ success: boolean }>(`/permissions/${id}`);
  },
};
