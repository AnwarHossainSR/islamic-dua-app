import { http } from '@/lib/api/http';
import { session } from '@/lib/auth/session';

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  chat_mode: 'general' | 'database';
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: string;
  created_at: string;
}

export const chatApi = {
  async createSession(
    title: string,
    chatMode: 'general' | 'database' = 'database'
  ): Promise<ChatSession> {
    return http.post<ChatSession>('/ai/sessions', { title, chatMode });
  },

  async getSessions(): Promise<ChatSession[]> {
    if (!session.getUser()) return [];
    return http.get<ChatSession[]>('/ai/sessions');
  },

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    return http.get<ChatMessage[]>(`/ai/sessions/${sessionId}/messages`);
  },

  async saveMessage(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
    metadata?: unknown
  ): Promise<ChatMessage> {
    return http.post<ChatMessage>(`/ai/sessions/${sessionId}/messages`, {
      role,
      content,
      metadata,
    });
  },

  async clearAll(): Promise<void> {
    await http.delete('/ai/sessions');
  },
};
