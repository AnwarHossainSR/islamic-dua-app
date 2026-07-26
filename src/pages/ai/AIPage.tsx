import { useEffect, useState } from 'react';
import { chatApi } from '@/api/ai/chat.api';
import { ImprovedIslamicChat } from '@/components/ai/ImprovedIslamicChat';
import { ENV } from '@/config/env';
import { session } from '@/lib/auth/session';

interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  chat_mode: 'general' | 'database';
  created_at: string;
  updated_at: string;
}

export default function AIPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const hasOpenAIKey = !!ENV.OPENAI_API_KEY;

  useEffect(() => {
    if (hasOpenAIKey) {
      loadSessions();
    } else {
      setLoading(false);
    }
  }, [hasOpenAIKey]);

  const loadSessions = async () => {
    try {
      if (!session.getUser()) {
        setLoading(false);
        return;
      }

      const data = await chatApi.getSessions();
      setSessions(data || []);
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-full">
      <ImprovedIslamicChat initialSessions={sessions} hasOpenAIKey={hasOpenAIKey} />
    </div>
  );
}
