import { http } from '@/lib/api/http';

export const activitiesApi = {
  getUserActivities: async (userId: string) => {
    return http.get<any[]>(`/activities/user/${userId}`);
  },

  getActivityById: async (activityId: string) => {
    return http.get<any>(`/activities/${activityId}`);
  },

  getTopUsers: async (activityId: string, limit: number = 10) => {
    return http.get<any[]>(`/activities/${activityId}/top-users`, { query: { limit } });
  },

  getUserDailyLogs: async (activityId: string, userId: string) => {
    return http.get<any[]>(`/activities/${activityId}/daily-logs/${userId}`);
  },

  getUserChallengeStats: async (userId: string) => {
    return http.get<{
      totalCompleted: number;
      totalActive: number;
      longestStreak: number;
      totalDaysCompleted: number;
    }>(`/activities/user/${userId}/challenge-stats`);
  },

  addActivityCount: async (activityId: string, userId: string, count: number) => {
    await http.post(`/activities/${activityId}/count`, { userId, count });
  },
};
