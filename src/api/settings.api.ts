import { http } from '@/lib/api/http';

export const settingsApi = {
  async getAll(category?: string) {
    return http.get<any[]>('/settings', { query: { category } });
  },

  async update(key: string, value: any) {
    await http.put(`/settings/${encodeURIComponent(key)}`, { value });
  },

  async getDbStats() {
    return http.get<{
      totalRecords: number;
      duasCount: number;
      challengesCount: number;
      activeUsers: number;
      adminsCount: number;
      dbSize: string;
    }>('/settings/db-stats');
  },

  async getBackups() {
    // Cloud storage is not used in the SQLite/Turso setup; backups are
    // generated on demand and downloaded locally.
    return http.get<any[]>('/settings/backups');
  },

  async createBackup(_storeInSupabase: boolean) {
    // Always generates a portable SQL dump the caller downloads as a Blob.
    const { content } = await http.post<{ filename: string; content: string }>('/settings/backups');
    return new Blob([content], { type: 'application/sql' });
  },

  async downloadBackup(_filename: string) {
    const { content } = await http.post<{ filename: string; content: string }>('/settings/backups');
    return new Blob([content], { type: 'application/sql' });
  },

  async deleteBackup(_filename: string) {
    return { success: true };
  },

  async optimizeDatabase() {
    return http.post<{ success: boolean }>('/settings/optimize');
  },

  async getCredentials() {
    return http.get<any[]>('/settings/credentials');
  },

  async deleteCredential(credentialId: string) {
    return http.delete<{ success: boolean }>(`/settings/credentials/${credentialId}`);
  },
};
