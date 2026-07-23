import { requireAdmin } from '../authz';
import { all, count, run } from '../db';
import type { ApiRequest, Router } from '../http';
import { uuid } from '../util';

export function registerLogRoutes(router: Router) {
  router.get('/logs', async (req: ApiRequest) => {
    await requireAdmin(req);
    const page = Number(req.query.page) || 1;
    const level = req.query.level || 'all';
    const limit = Number(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    const where = level !== 'all' ? 'WHERE level = ?' : '';
    const whereArgs = level !== 'all' ? [level] : [];

    const total = await count(`SELECT count(*) AS c FROM api_logs ${where}`, whereArgs);
    const logs = await all(
      `SELECT * FROM api_logs ${where} ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
      [...whereArgs, limit, offset]
    );
    return { logs, total };
  });

  // Client-side logger posts entries here (replaces direct supabase insert).
  router.post('/logs', async (req: ApiRequest) => {
    const { level, message, meta, timestamp } = (req.body ?? {}) as {
      level?: string;
      message?: string;
      meta?: unknown;
      timestamp?: number;
    };
    if (!level || !message) return { success: false };
    await run('INSERT INTO api_logs (id, level, message, meta, timestamp) VALUES (?, ?, ?, ?, ?)', [
      uuid(),
      level,
      message,
      meta ? (typeof meta === 'string' ? meta : JSON.stringify(meta)) : null,
      timestamp ?? Date.now(),
    ]);
    return { success: true };
  });

  router.delete('/logs', async (req: ApiRequest) => {
    await requireAdmin(req);
    await run('DELETE FROM api_logs');
    return { success: true };
  });
}
