import { http } from '@/lib/api/http';
import type { Challenge, UserChallengeProgress } from '@/lib/types';

export const challengesApi = {
  getAll: async () => {
    const { apiLogger } = await import('@/lib/logger');
    try {
      return await http.get<Challenge[]>('/challenges');
    } catch (error: any) {
      apiLogger.error('Get challenges failed', { error: error.message });
      throw error;
    }
  },

  getById: async (id: string) => {
    return http.get<Challenge>(`/challenges/${id}`);
  },

  checkActiveProgress: async (_userId: string, challengeId: string) => {
    return http.get<{ data: { id: string; status: string } | null; error: null }>(
      `/challenges/${challengeId}/active-progress`
    );
  },

  start: async (_userId: string, challengeId: string) => {
    const { apiLogger } = await import('@/lib/logger');
    try {
      const result = await http.post<{ data: UserChallengeProgress | null; error: unknown }>(
        `/challenges/${challengeId}/start`
      );
      apiLogger.info('Challenge started', { challengeId });
      return result;
    } catch (error: any) {
      apiLogger.error('Start challenge failed', { challengeId, error: error.message });
      throw error;
    }
  },

  getProgress: async (progressId: string) => {
    return http.get(`/challenges/progress/${progressId}`);
  },

  restart: async (progressId: string, challengeId: string) => {
    const { apiLogger } = await import('@/lib/logger');
    try {
      const result = await http.post<{ success: boolean }>(
        `/challenges/progress/${progressId}/restart`,
        { challengeId }
      );
      apiLogger.info('Challenge restarted', { progressId, challengeId });
      return result;
    } catch (error: any) {
      apiLogger.error('Restart challenge failed', {
        progressId,
        challengeId,
        error: error.message,
      });
      throw error;
    }
  },

  create: async (data: any) => {
    const { apiLogger } = await import('@/lib/logger');
    try {
      const result = await http.post<any>('/challenges', data);
      apiLogger.info('Challenge created', { challengeId: result?.id });
      return result;
    } catch (error: any) {
      apiLogger.error('Create challenge failed', { error: error.message });
      throw error;
    }
  },

  update: async (id: string, data: any) => {
    const { apiLogger } = await import('@/lib/logger');
    try {
      const result = await http.put<any>(`/challenges/${id}`, data);
      apiLogger.info('Challenge updated', { challengeId: id });
      return result;
    } catch (error: any) {
      apiLogger.error('Update challenge failed', { id, error: error.message });
      throw error;
    }
  },

  complete: async (
    progressId: string,
    _userId: string,
    challengeId: string,
    dayNumber: number,
    countCompleted: number,
    targetCount: number,
    notes?: string,
    mood?: string
  ) => {
    const { apiLogger } = await import('@/lib/logger');
    try {
      return await http.post<{
        success?: boolean;
        error?: string;
        isCompleted?: boolean;
        isChallengeCompleted?: boolean;
        newStreak?: number;
      }>(`/challenges/progress/${progressId}/complete`, {
        challengeId,
        dayNumber,
        countCompleted,
        targetCount,
        notes,
        mood,
      });
    } catch (error) {
      apiLogger.error('Error completing daily challenge', { error });
      return { error: 'Failed to complete daily challenge' };
    }
  },

  delete: async (challengeId: string) => {
    const { apiLogger } = await import('@/lib/logger');
    try {
      await http.delete(`/challenges/${challengeId}`);
      apiLogger.info('Challenge deleted', { challengeId });
    } catch (error: any) {
      apiLogger.error('Delete challenge failed', { challengeId, error: error.message });
      throw error;
    }
  },
};
