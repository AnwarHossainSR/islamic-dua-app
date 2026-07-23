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

  async sendMessage(
    sessionId: string,
    message: string,
    chatMode: 'general' | 'database'
  ): Promise<any> {
    const user = session.getUser();
    if (!user) throw new Error('Unauthorized');

    // Save user message
    await http.post(`/ai/sessions/${sessionId}/messages`, { role: 'user', content: message });

    // Call AI endpoint (external/serverless AI completion)
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message, chatMode, userId: user.id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get AI response');
    }

    const aiResponse = await response.json();

    // Save AI response
    await http.post(`/ai/sessions/${sessionId}/messages`, {
      role: 'assistant',
      content: aiResponse.message,
      metadata: {
        relatedDuas: aiResponse.relatedDuas || [],
        suggestions: aiResponse.suggestions || [],
      },
    });

    return aiResponse;
  },

  async clearAll(): Promise<void> {
    await http.delete('/ai/sessions');
  },
};
