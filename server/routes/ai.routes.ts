import { all, one, run } from '../db';
import { ApiError, type ApiRequest, type Router, requireUser } from '../http';
import { nowMs, uuid } from '../util';

export function registerAiRoutes(router: Router) {
  router.post('/ai/sessions', async (req: ApiRequest) => {
    const user = requireUser(req);
    const { title, chatMode } = (req.body ?? {}) as {
      title?: string;
      chatMode?: 'general' | 'database';
    };
    const id = uuid();
    const now = nowMs();
    await run(
      `INSERT INTO ai_chat_sessions (id, user_id, title, chat_mode, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, user.id, title ?? 'New Chat', chatMode ?? 'database', now, now]
    );
    return one('SELECT * FROM ai_chat_sessions WHERE id = ?', [id]);
  });

  router.get('/ai/sessions', async (req: ApiRequest) => {
    const user = requireUser(req);
    return all('SELECT * FROM ai_chat_sessions WHERE user_id = ? ORDER BY updated_at DESC', [
      user.id,
    ]);
  });

  router.get('/ai/sessions/:sessionId/messages', async (req: ApiRequest, params) => {
    const user = requireUser(req);
    return all(
      'SELECT * FROM ai_chat_messages WHERE session_id = ? AND user_id = ? ORDER BY created_at ASC',
      [params.sessionId, user.id]
    );
  });

  router.post('/ai/sessions/:sessionId/messages', async (req: ApiRequest, params) => {
    const user = requireUser(req);
    const { role, content, metadata } = (req.body ?? {}) as {
      role?: 'user' | 'assistant';
      content?: string;
      metadata?: unknown;
    };
    if (!role || !content) throw new ApiError(400, 'role and content are required');
    const id = uuid();
    await run(
      `INSERT INTO ai_chat_messages (id, session_id, user_id, role, content, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        params.sessionId,
        user.id,
        role,
        content,
        metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null,
        nowMs(),
      ]
    );
    await run('UPDATE ai_chat_sessions SET updated_at = ? WHERE id = ?', [
      nowMs(),
      params.sessionId,
    ]);
    return one('SELECT * FROM ai_chat_messages WHERE id = ?', [id]);
  });

  router.delete('/ai/sessions', async (req: ApiRequest) => {
    const user = requireUser(req);
    await run('DELETE FROM ai_chat_sessions WHERE user_id = ?', [user.id]);
    return { success: true };
  });
}
