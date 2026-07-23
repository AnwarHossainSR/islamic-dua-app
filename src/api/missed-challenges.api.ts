import { http } from '@/lib/api/http';

export const missedChallengesApi = {
  getMissedChallenges: async (userId: string) => {
    return http.get<any[]>(`/missed-challenges/user/${userId}`);
  },

  getSummary: async (userId: string) => {
    return http.get<{
      total_missed: number;
      last_7_days: number;
      last_30_days: number;
      most_missed_challenge: { title_bn: string; count: number } | null;
    }>(`/missed-challenges/user/${userId}/summary`);
  },

  sync: async (userId: string) => {
    return http.post<{ success: boolean; missedCount?: number; message?: string }>(
      `/missed-challenges/user/${userId}/sync`
    );
  },

  getLastSyncTime: async () => {
    const { lastSync } = await http.get<{ lastSync: number | null }>(
      '/missed-challenges/last-sync'
    );
    return lastSync;
  },
};
