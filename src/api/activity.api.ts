import { http } from '@/lib/api/http';
import { session } from '@/lib/auth/session';

export const activityApi = {
  getUserRecentLogs: async (limit: number = 10) => {
    const user = session.getUser();
    if (!user) return [];
    return http.get<any[]>('/activities/recent-logs', { query: { limit } });
  },
};
