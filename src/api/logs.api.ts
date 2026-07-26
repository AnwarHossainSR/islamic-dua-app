import { http } from '@/lib/api/http';

export const logsApi = {
  getLogs: async (page: number = 1, level: string = 'all', limit: number = 25) => {
    return http.get<{ logs: any[]; total: number }>('/logs', {
      query: { page, level, limit },
    });
  },

  clearAllLogs: async () => {
    await http.delete('/logs');
  },
};
