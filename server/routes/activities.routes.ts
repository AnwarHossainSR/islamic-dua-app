import { requireSelfOrAdmin } from '../authz';
import { all, one, run } from '../db';
import { type ApiRequest, type Router, requireUser } from '../http';
import { coerceBooleansAll } from '../util';

export function registerActivityRoutes(router: Router) {
  // Current user's recent daily logs with challenge title/icon.
  router.get('/activities/recent-logs', async (req: ApiRequest) => {
    const user = requireUser(req);
    const limit = Number(req.query.limit) || 10;
    const rows = await all<Record<string, unknown>>(
      `SELECT l.id, l.day_number, l.count_completed, l.completed_at, l.is_completed, l.created_at,
              c.title_bn AS challenge_title_bn, c.icon AS challenge_icon
       FROM user_challenge_daily_logs l
       LEFT JOIN challenge_templates c ON c.id = l.challenge_id
       WHERE l.user_id = ? ORDER BY l.created_at DESC LIMIT ?`,
      [user.id, limit]
    );
    return coerceBooleansAll(rows, ['is_completed']).map((r) => ({
      id: r.id,
      day_number: r.day_number,
      count_completed: r.count_completed,
      completed_at: r.completed_at,
      is_completed: r.is_completed,
      created_at: r.created_at,
      user_progress: {
        challenge: { title_bn: r.challenge_title_bn, icon: r.challenge_icon },
      },
    }));
  });

  // user_activity_stats joined with activity_stats
  router.get('/activities/user/:userId', async (req: ApiRequest, params) => {
    await requireSelfOrAdmin(req, params.userId);
    const rows = await all<Record<string, unknown>>(
      'SELECT * FROM user_activity_stats WHERE user_id = ? ORDER BY total_completed DESC',
      [params.userId]
    );
    for (const r of rows) {
      r.activity = await one('SELECT * FROM activity_stats WHERE id = ?', [
        r.activity_stat_id as string,
      ]);
    }
    return rows;
  });

  router.get('/activities/user/:userId/challenge-stats', async (req: ApiRequest, params) => {
    await requireSelfOrAdmin(req, params.userId);
    const rows = await all<{
      current_streak: number;
      longest_streak: number;
      total_completed_days: number;
      status: string;
    }>(
      `SELECT current_streak, longest_streak, total_completed_days, status
       FROM user_challenge_progress WHERE user_id = ?`,
      [params.userId]
    );
    const totalCompleted = rows.filter((p) => p.status === 'completed').length;
    const totalActive = rows.filter((p) => p.status === 'active').length;
    const longestStreak = Math.max(0, ...rows.map((p) => p.longest_streak || 0));
    const totalDaysCompleted = rows.reduce((sum, p) => sum + (p.total_completed_days || 0), 0);
    return { totalCompleted, totalActive, longestStreak, totalDaysCompleted };
  });

  router.get('/activities/:activityId/top-users', async (req: ApiRequest, params) => {
    requireUser(req);
    const limit = Number(req.query.limit) || 10;
    const rows = await all(
      'SELECT * FROM user_activity_stats WHERE activity_stat_id = ? ORDER BY total_completed DESC LIMIT ?',
      [params.activityId, limit]
    );
    return rows;
  });

  router.get('/activities/:activityId/daily-logs/:userId', async (req: ApiRequest, params) => {
    await requireSelfOrAdmin(req, params.userId);
    const mappings = await all<{ challenge_id: string }>(
      'SELECT challenge_id FROM challenge_activity_mapping WHERE activity_stat_id = ?',
      [params.activityId]
    );
    if (mappings.length === 0) return [];
    const ids = mappings.map((m) => m.challenge_id);
    const placeholders = ids.map(() => '?').join(', ');
    const rows = await all(
      `SELECT * FROM user_challenge_daily_logs
       WHERE user_id = ? AND is_completed = 1 AND challenge_id IN (${placeholders})
       ORDER BY completion_date DESC`,
      [params.userId, ...ids]
    );
    return rows;
  });

  router.get('/activities/:activityId', async (req: ApiRequest, params) => {
    requireUser(req);
    return one('SELECT * FROM activity_stats WHERE id = ?', [params.activityId]);
  });

  // Count is always attributed to the authenticated user (never a body-supplied id).
  router.post('/activities/:activityId/count', async (req: ApiRequest, params) => {
    const user = requireUser(req);
    const { count } = (req.body ?? {}) as { count?: number };
    const c = Number(count) || 0;
    await run('UPDATE activity_stats SET total_count = total_count + ? WHERE id = ?', [
      c,
      params.activityId,
    ]);
    await run(
      'UPDATE user_activity_stats SET total_completed = total_completed + ? WHERE user_id = ? AND activity_stat_id = ?',
      [c, user.id, params.activityId]
    );
    return { success: true };
  });
}
