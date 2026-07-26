import { all, one } from '../db';
import { ApiError, type ApiRequest, type Router, requireUser } from '../http';

/**
 * Server-side execution of the AI database-chat "MCP" tools. All queries are
 * scoped to the authenticated user. The client sends { name, args }.
 */
export function registerMcpRoutes(router: Router) {
  router.post('/mcp/execute', async (req: ApiRequest) => {
    const user = requireUser(req);
    const { name, args = {} } = (req.body ?? {}) as {
      name?: string;
      args?: Record<string, unknown>;
    };
    switch (name) {
      case 'query_user_challenges':
        return queryUserChallenges(user.id, args);
      case 'get_user_challenges':
        return queryUserChallenges(user.id, { status: 'active' });
      case 'query_duas':
        return queryDuas(args);
      case 'search_duas':
        return queryDuas({ searchText: args.query as string });
      case 'get_challenge_statistics':
        return getChallengeStatistics(user.id, args);
      case 'get_streak_analysis':
        return getStreakAnalysis(user.id);
      default:
        throw new ApiError(400, `Unknown MCP function: ${name}`);
    }
  });
}

async function queryUserChallenges(userId: string, args: Record<string, unknown>) {
  const where = ['p.user_id = ?'];
  const params: (string | number)[] = [userId];
  if (args.status) {
    where.push('p.status = ?');
    params.push(String(args.status));
  }
  if (args.minStreak) {
    where.push('p.current_streak >= ?');
    params.push(Number(args.minStreak));
  }
  const rows = await all<Record<string, unknown>>(
    `SELECT p.id, p.status, p.current_day, p.current_streak, p.longest_streak,
            p.total_completed_days, p.missed_days, p.started_at, p.last_completed_at,
            c.title_bn, c.title_en, c.total_days, c.reference, c.difficulty_level
     FROM user_challenge_progress p
     LEFT JOIN challenge_templates c ON c.id = p.challenge_id
     WHERE ${where.join(' AND ')}
     ORDER BY p.last_completed_at DESC`,
    params
  );
  return rows.map((item) => ({
    id: item.id,
    challengeTitle: item.title_bn,
    challengeTitleEn: item.title_en,
    status: item.status,
    currentDay: item.current_day,
    totalDays: item.total_days,
    progressPercentage: item.total_days
      ? Math.round((Number(item.current_day) / Number(item.total_days)) * 100)
      : 0,
    currentStreak: item.current_streak,
    longestStreak: item.longest_streak,
    completedDays: item.total_completed_days,
    missedDays: item.missed_days,
    startedAt: item.started_at,
    lastCompletedAt: item.last_completed_at,
  }));
}

async function queryDuas(args: Record<string, unknown>) {
  const where = ['is_active = 1'];
  const params: (string | number)[] = [];
  if (args.category) {
    where.push('category = ?');
    params.push(String(args.category));
  }
  if (args.isImportant !== undefined) {
    where.push('is_important = ?');
    params.push(args.isImportant ? 1 : 0);
  }
  if (args.searchText) {
    where.push('(title_bn LIKE ? OR title_en LIKE ? OR translation_bn LIKE ?)');
    const like = `%${args.searchText}%`;
    params.push(like, like, like);
  }
  const limit = Number(args.limit) || 10;
  const rows = await all<Record<string, unknown>>(
    `SELECT * FROM duas WHERE ${where.join(' AND ')} LIMIT ?`,
    [...params, limit]
  );
  return rows.map((dua) => ({
    id: dua.id,
    titleBn: dua.title_bn,
    titleEn: dua.title_en,
    duaTextAr: dua.dua_text_ar,
    translationBn: dua.translation_bn,
    translationEn: dua.translation_en,
    category: dua.category,
    benefits: dua.benefits,
    isImportant: dua.is_important === 1,
  }));
}

async function getChallengeStatistics(userId: string, args: Record<string, unknown>) {
  if (args.challengeId) {
    const data = await one<Record<string, unknown>>(
      `SELECT p.current_day, p.total_completed_days, p.missed_days, p.current_streak,
              p.longest_streak, p.status, c.title_bn, c.total_days, c.reference
       FROM user_challenge_progress p
       LEFT JOIN challenge_templates c ON c.id = p.challenge_id
       WHERE p.user_id = ? AND p.challenge_id = ?`,
      [userId, String(args.challengeId)]
    );
    if (!data) throw new ApiError(404, 'Challenge progress not found');
    const currentDay = Number(data.current_day);
    return {
      challengeTitle: data.title_bn,
      reference: data.reference,
      currentDay: data.current_day,
      totalDays: data.total_days,
      completedDays: data.total_completed_days,
      missedDays: data.missed_days,
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      completionRate:
        currentDay > 0 ? Math.round((Number(data.total_completed_days) / currentDay) * 100) : 0,
      status: data.status,
    };
  }

  const allProgress = await all<Record<string, unknown>>(
    'SELECT * FROM user_challenge_progress WHERE user_id = ?',
    [userId]
  );
  const totalChallenges = allProgress.length;
  const activeChallenges = allProgress.filter((p) => p.status === 'active').length;
  const completedChallenges = allProgress.filter((p) => p.status === 'completed').length;
  const totalCompletedDays = allProgress.reduce(
    (sum, p) => sum + Number(p.total_completed_days || 0),
    0
  );
  const averageStreak =
    allProgress.reduce((sum, p) => sum + Number(p.current_streak || 0), 0) / totalChallenges || 0;
  const bestStreak = Math.max(0, ...allProgress.map((p) => Number(p.longest_streak || 0)));

  return {
    totalChallenges,
    activeChallenges,
    completedChallenges,
    totalCompletedDays,
    averageStreak: Math.round(averageStreak * 10) / 10,
    bestStreak,
  };
}

async function getStreakAnalysis(userId: string) {
  const rows = await all<Record<string, unknown>>(
    `SELECT p.current_streak, p.longest_streak, p.status, c.title_bn
     FROM user_challenge_progress p
     LEFT JOIN challenge_templates c ON c.id = p.challenge_id
     WHERE p.user_id = ? ORDER BY p.current_streak DESC`,
    [userId]
  );
  const challenges = rows.map((item) => ({
    title: item.title_bn,
    currentStreak: Number(item.current_streak),
    longestStreak: Number(item.longest_streak),
    status: item.status,
  }));
  const activeStreaks = challenges.filter((c) => c.status === 'active');
  const bestPerformer = challenges[0];
  const needsAttention = challenges.filter((c) => c.currentStreak < 3 && c.status === 'active');
  return {
    totalChallenges: challenges.length,
    activeStreaks: activeStreaks.length,
    bestPerformer: bestPerformer
      ? { title: bestPerformer.title, streak: bestPerformer.currentStreak }
      : null,
    needsAttention: needsAttention.map((c) => ({ title: c.title, streak: c.currentStreak })),
    allStreaks: challenges,
  };
}
