import { requireSelfOrAdmin } from '../authz';
import { all, count, one } from '../db';
import { type ApiRequest, type Router, requireUser } from '../http';

function bdToday(): string {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }))
    .toISOString()
    .split('T')[0];
}

function bdWeekAgo(): string {
  const now = new Date();
  const bdNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
  const weekAgo = new Date(bdNow.getTime());
  weekAgo.setDate(weekAgo.getDate() - 7);
  return weekAgo.toISOString().split('T')[0];
}

export function registerDashboardRoutes(router: Router) {
  router.get('/dashboard/user/:userId/stats', async (req: ApiRequest, params) => {
    await requireSelfOrAdmin(req, params.userId);
    const userId = params.userId;
    const userActivities = await all<{ total_completed: number }>(
      'SELECT total_completed FROM user_activity_stats WHERE user_id = ?',
      [userId]
    );
    const totalActivities = userActivities.length;
    const totalCompletions = userActivities.reduce(
      (sum, a) => sum + Number(a.total_completed || 0),
      0
    );
    const activeChallenges = await count(
      "SELECT count(*) AS c FROM user_challenge_progress WHERE user_id = ? AND status = 'active'",
      [userId]
    );
    const today = bdToday();
    const todayCompletions = await count(
      'SELECT count(*) AS c FROM user_challenge_daily_logs WHERE user_id = ? AND is_completed = 1 AND completion_date = ?',
      [userId, today]
    );
    const weekCompletions = await count(
      'SELECT count(*) AS c FROM user_challenge_daily_logs WHERE user_id = ? AND is_completed = 1 AND completion_date >= ?',
      [userId, bdWeekAgo()]
    );
    return {
      totalActivities,
      totalCompletions,
      totalActiveUsers: 1,
      activeChallenges,
      todayCompletions,
      yesterdayCompletions: 0,
      weekCompletions,
    };
  });

  router.get('/dashboard/global/stats', async (req: ApiRequest) => {
    requireUser(req);
    const totalActivities = await count('SELECT count(*) AS c FROM activity_stats');
    const activities = await all<{ total_count: number }>('SELECT total_count FROM activity_stats');
    const totalCompletions = activities.reduce((sum, a) => sum + Number(a.total_count || 0), 0);
    const totalActiveUsers = await count('SELECT count(*) AS c FROM user_activity_stats');
    const activeChallenges = await count(
      'SELECT count(*) AS c FROM challenge_templates WHERE is_active = 1'
    );
    const todayCompletions = await count(
      'SELECT count(*) AS c FROM user_challenge_daily_logs WHERE is_completed = 1 AND completion_date = ?',
      [bdToday()]
    );
    const weekCompletions = await count(
      'SELECT count(*) AS c FROM user_challenge_daily_logs WHERE is_completed = 1 AND completion_date >= ?',
      [bdWeekAgo()]
    );
    return {
      totalActivities,
      totalCompletions,
      totalActiveUsers,
      activeChallenges,
      todayCompletions,
      yesterdayCompletions: 0,
      weekCompletions,
    };
  });

  router.get('/dashboard/user/:userId/top-activities', async (req: ApiRequest, params) => {
    await requireSelfOrAdmin(req, params.userId);
    const limit = Number(req.query.limit) || 10;
    const rows = await all<Record<string, unknown>>(
      `SELECT uas.total_completed, a.id, a.name_bn, a.name_ar, a.name_en, a.icon, a.color
       FROM user_activity_stats uas
       JOIN activity_stats a ON a.id = uas.activity_stat_id
       WHERE uas.user_id = ?
       ORDER BY uas.total_completed DESC LIMIT ?`,
      [params.userId, limit]
    );
    return rows.map((item) => ({
      id: item.id,
      name_bn: item.name_bn,
      name_ar: item.name_ar,
      name_en: item.name_en,
      total_count: item.total_completed,
      total_users: 1,
      icon: item.icon,
      color: item.color,
    }));
  });

  router.get('/dashboard/global/top-activities', async (req: ApiRequest) => {
    requireUser(req);
    const limit = Number(req.query.limit) || 10;
    return all(
      'SELECT id, name_bn, name_ar, name_en, total_count, total_users, icon, color FROM activity_stats ORDER BY total_count DESC LIMIT ?',
      [limit]
    );
  });
}
