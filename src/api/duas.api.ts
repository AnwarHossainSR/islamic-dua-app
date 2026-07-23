import { http } from '@/lib/api/http';
import type { Dua, DuaCategory, DuaStats } from '@/lib/types/duas';

export const duasApi = {
  getAll: async (filters?: {
    category?: string;
    search?: string;
    isImportant?: boolean;
    limit?: number;
    offset?: number;
  }) => {
    return http.get<Dua[]>('/duas', {
      query: {
        category: filters?.category,
        search: filters?.search,
        isImportant: filters?.isImportant ? 'true' : undefined,
        limit: filters?.limit,
        offset: filters?.offset,
      },
    });
  },

  getById: async (id: string) => {
    return http.get<Dua>(`/duas/${id}`);
  },

  getCategories: async () => {
    return http.get<DuaCategory[]>('/dua-categories');
  },

  getStats: async (): Promise<DuaStats> => {
    return http.get<DuaStats>('/duas/stats');
  },

  create: async (duaData: Omit<Dua, 'id' | 'created_at' | 'updated_at'>) => {
    return http.post<Dua>('/duas', duaData);
  },

  update: async (
    id: string,
    duaData: Partial<Omit<Dua, 'id' | 'created_at' | 'updated_at' | 'created_by'>>
  ) => {
    return http.put<Dua>(`/duas/${id}`, duaData);
  },

  delete: async (id: string) => {
    await http.delete(`/duas/${id}`);
  },
};
