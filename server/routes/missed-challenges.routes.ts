import { requireSelfOrAdmin } from '../authz';
import { all, count, one, run } from '../db';
import { type ApiRequest, type Router, requireUser } from '../http';
import { uuid } from '../util';

export function registerMissedChallengeRoutes(router: Router) {
  router.get('/missed-challenges/user/:userId', async (req: ApiRequest, params) => {
    await requireSelfOrAdmin(req, params.userId);
    const rows = await all<Record<string, unknown>>(
      `SELECT m.*, c.title_bn AS challenge_title_bn, c.icon AS challenge_icon, c.color AS challenge_color
       FROM user_missed_challenges m
       LEFT JOIN challenge_templates c ON c.id = m.challenge_id
       WHERE m.user_id = ? ORDER BY m.missed_date DESC`,
      [params.userId]
    );
    return rows.map((item) => ({
      ...item,
      days_ago: Math.floor(
        (Date.now() - new Date(item.missed_date as string).getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));
  });

  router.get('/missed-challenges/user/:userId/summary', async (req: ApiRequest, params) => {
    await requireSelfOrAdmin(req, params.userId);
    const userId = params.userId;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const total = await count(
      'SELECT count(*) AS c FROM user_missed_challenges WHERE user_id = ?',
      [userId]
    );
    const last7 = await count(
      'SELECT count(*) AS c FROM user_missed_challenges WHERE user_id = ? AND missed_date >= ?',
      [userId, sevenDaysAgo]
    );
    const last30 = await count(
      'SELECT count(*) AS c FROM user_missed_challenges WHERE user_id = ? AND missed_date >= ?',
      [userId, thirtyDaysAgo]
    );
    const mostMissed = await one<{ challenge_id: string; title_bn: string; cnt: number }>(
      `SELECT m.challenge_id, c.title_bn, count(*) AS cnt
       FROM user_missed_challenges m
       LEFT JOIN challenge_templates c ON c.id = m.challenge_id
       WHERE m.user_id = ?
       GROUP BY m.challenge_id ORDER BY cnt DESC LIMIT 1`,
      [userId]
    );
    return {
      total_missed: total,
      last_7_days: last7,
      last_30_days: last30,
      most_missed_challenge: mostMissed
        ? { title_bn: mostMissed.title_bn, count: Number(mostMissed.cnt) }
        : null,
    };
  });

  router.post('/missed-challenges/user/:userId/sync', async (req: ApiRequest, params) => {
    await requireSelfOrAdmin(req, params.userId);
    const userId = params.userId;
    const activeProgress = await all<{ challenge_id: string }>(
      "SELECT challenge_id FROM user_challenge_progress WHERE user_id = ? AND status = 'active'",
      [userId]
    );
    if (activeProgress.length === 0) {
      return { success: true, message: 'No active challenges' };
    }

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayBd = new Date(yesterday.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
    const yesterdayDate = yesterdayBd.toLocaleDateString('en-CA');

    const completedYesterday = await all<{ challenge_id: string }>(
      'SELECT challenge_id FROM user_challenge_daily_logs WHERE user_id = ? AND completion_date = ? AND is_completed = 1',
      [userId, yesterdayDate]
    );
    const completedIds = new Set(completedYesterday.map((c) => c.challenge_id));
    const missed = activeProgress.filter((p) => !completedIds.has(p.challenge_id));

    for (const c of missed) {
      await run(
        `INSERT OR IGNORE INTO user_missed_challenges
          (id, user_id, challenge_id, missed_date, reason, was_active, created_at)
         VALUES (?, ?, ?, ?, 'not_completed', 1, ?)`,
        [uuid(), userId, c.challenge_id, yesterdayDate, Date.now()]
      );
    }
    return { success: true, missedCount: missed.length };
  });

  router.get('/missed-challenges/last-sync', async (req: ApiRequest) => {
    requireUser(req);
    const row = await one<{ created_at: number }>(
      'SELECT created_at FROM user_missed_challenges ORDER BY created_at DESC LIMIT 1'
    );
    return { lastSync: row?.created_at ? Number(row.created_at) : null };
  });
}
