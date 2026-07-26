import { http } from '@/lib/api/http';

interface DashboardStats {
  totalActivities: number;
  totalCompletions: number;
  totalActiveUsers: number;
  activeChallenges: number;
  todayCompletions: number;
  yesterdayCompletions: number;
  weekCompletions: number;
}

export const dashboardApi = {
  async getUserStats(userId: string) {
    return http.get<DashboardStats>(`/dashboard/user/${userId}/stats`);
  },

  async getGlobalStats() {
    return http.get<DashboardStats>('/dashboard/global/stats');
  },

  async getUserTopActivities(userId: string, limit = 10) {
    return http.get<any[]>(`/dashboard/user/${userId}/top-activities`, { query: { limit } });
  },

  async getGlobalTopActivities(limit = 10) {
    return http.get<any[]>('/dashboard/global/top-activities', { query: { limit } });
  },
};
