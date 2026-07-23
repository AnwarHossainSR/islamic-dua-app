import { all, one, run } from '../db';
import { ApiError, type ApiRequest, type RouteParams, type Router, requireUser } from '../http';
import { coerceBooleans, coerceBooleansAll, nowMs, uuid } from '../util';

const CHALLENGE_BOOLS = ['is_active', 'is_featured'];
const PROGRESS_BOOLS = ['daily_reminder_enabled'];
const LOG_BOOLS = ['is_completed'];

export function registerChallengeRoutes(router: Router) {
  // List all active challenges merged with the current user's progress.
  router.get('/challenges', async (req: ApiRequest) => {
    const user = requireUser(req);
    const challenges = await all<Record<string, unknown>>(
      'SELECT * FROM challenge_templates WHERE is_active = 1 ORDER BY display_order'
    );
    const progresses = await all<Record<string, unknown>>(
      'SELECT * FROM user_challenge_progress WHERE user_id = ?',
      [user.id]
    );
    const byChallenge = new Map<string, Record<string, unknown>>();
    for (const p of progresses) byChallenge.set(String(p.challenge_id), p);

    return challenges.map((challenge) => {
      const c = coerceBooleans(challenge, CHALLENGE_BOOLS) as Record<string, unknown>;
      const progress = byChallenge.get(String(c.id));
      const totalDays = Number(c.total_days) || 0;
      const completedDays = Number(progress?.total_completed_days) || 0;
      const completionPercentage =
        completedDays && totalDays
          ? Math.min(Math.round((completedDays / totalDays) * 100), 100)
          : 0;
      return {
        ...c,
        user_status: progress?.status || 'not_started',
        progress_id: progress?.id,
        completed_at: progress?.completed_at,
        total_completed_days: progress?.total_completed_days || 0,
        current_day: progress?.current_day || 1,
        last_completed_at: progress?.last_completed_at,
        completion_percentage: completionPercentage,
      };
    });
  });

  router.get('/challenges/:id', async (_req, params: RouteParams) => {
    const row = await one('SELECT * FROM challenge_templates WHERE id = ?', [params.id]);
    if (!row) throw new ApiError(404, 'Challenge not found');
    return coerceBooleans(row, CHALLENGE_BOOLS);
  });

  // checkActiveProgress -> { id, status } | null for current user + challenge
  router.get('/challenges/:challengeId/active-progress', async (req: ApiRequest, params) => {
    const user = requireUser(req);
    const row = await one(
      `SELECT id, status FROM user_challenge_progress
       WHERE user_id = ? AND challenge_id = ? AND status IN ('active', 'paused') LIMIT 1`,
      [user.id, params.challengeId]
    );
    return { data: row, error: null };
  });

  router.post('/challenges/:challengeId/start', async (req: ApiRequest, params) => {
    const user = requireUser(req);
    const id = uuid();
    await run(
      `INSERT INTO user_challenge_progress
        (id, user_id, challenge_id, current_day, status, current_streak, started_at, created_at, updated_at)
       VALUES (?, ?, ?, 1, 'active', 0, ?, ?, ?)`,
      [id, user.id, params.challengeId, nowISO(), nowISO(), nowISO()]
    );
    await run(
      'UPDATE challenge_templates SET total_participants = total_participants + 1 WHERE id = ?',
      [params.challengeId]
    );
    const data = await one('SELECT * FROM user_challenge_progress WHERE id = ?', [id]);
    return { data: coerceBooleans(data, PROGRESS_BOOLS), error: null };
  });

  router.get('/challenges/progress/:progressId', async (_req, params) => {
    const progress = await one<Record<string, unknown>>(
      'SELECT * FROM user_challenge_progress WHERE id = ?',
      [params.progressId]
    );
    if (!progress) throw new ApiError(404, 'Progress not found');
    const challenge = await one('SELECT * FROM challenge_templates WHERE id = ?', [
      progress.challenge_id as string,
    ]);
    const dailyLogs = await all(
      'SELECT * FROM user_challenge_daily_logs WHERE user_progress_id = ?',
      [params.progressId]
    );
    return {
      ...coerceBooleans(progress, PROGRESS_BOOLS),
      challenge: coerceBooleans(challenge, CHALLENGE_BOOLS),
      daily_logs: coerceBooleansAll(dailyLogs, LOG_BOOLS),
    };
  });

  router.post('/challenges/progress/:progressId/restart', async (req: ApiRequest, params) => {
    requireUser(req);
    const { challengeId } = (req.body ?? {}) as { challengeId?: string };
    await run(
      `UPDATE user_challenge_progress SET
        current_day = 1, status = 'active', current_streak = 0, longest_streak = 0,
        total_completed_days = 0, missed_days = 0, completed_at = NULL, paused_at = NULL,
        last_completed_at = NULL, updated_at = ? WHERE id = ?`,
      [nowISO(), params.progressId]
    );
    await run('DELETE FROM user_challenge_daily_logs WHERE user_progress_id = ?', [
      params.progressId,
    ]);
    if (challengeId) {
      await run(
        'UPDATE challenge_templates SET total_completions = total_completions + 1 WHERE id = ?',
        [challengeId]
      );
    }
    return { success: true };
  });

  router.post('/challenges', async (req: ApiRequest) => {
    requireUser(req);
    const d = (req.body ?? {}) as Record<string, unknown>;
    const id = uuid();
    const cols = [
      'title_bn',
      'title_ar',
      'title_en',
      'description_bn',
      'description_ar',
      'description_en',
      'arabic_text',
      'transliteration_bn',
      'translation_bn',
      'translation_en',
      'daily_target_count',
      'total_days',
      'recommended_time',
      'recommended_prayer',
      'reference',
      'fazilat_bn',
      'fazilat_ar',
      'fazilat_en',
      'difficulty_level',
      'icon',
      'color',
      'display_order',
      'is_active',
      'is_featured',
    ];
    const present = cols.filter((c) => c in d);
    const placeholders = ['id', ...present, 'created_at', 'updated_at'].map(() => '?').join(', ');
    const values = [
      id,
      ...present.map((c) =>
        c === 'is_active' || c === 'is_featured' ? (d[c] ? 1 : 0) : ((d[c] as string) ?? null)
      ),
      nowISO(),
      nowISO(),
    ];
    await run(
      `INSERT INTO challenge_templates (${['id', ...present, 'created_at', 'updated_at'].join(', ')}) VALUES (${placeholders})`,
      values as (string | number | null)[]
    );
    return coerceBooleans(
      await one('SELECT * FROM challenge_templates WHERE id = ?', [id]),
      CHALLENGE_BOOLS
    );
  });

  router.put('/challenges/:id', async (req: ApiRequest, params) => {
    requireUser(req);
    const d = (req.body ?? {}) as Record<string, unknown>;
    const cols = [
      'title_bn',
      'title_ar',
      'title_en',
      'description_bn',
      'description_ar',
      'description_en',
      'arabic_text',
      'transliteration_bn',
      'translation_bn',
      'translation_en',
      'daily_target_count',
      'total_days',
      'recommended_time',
      'recommended_prayer',
      'reference',
      'fazilat_bn',
      'fazilat_ar',
      'fazilat_en',
      'difficulty_level',
      'icon',
      'color',
      'display_order',
      'is_active',
      'is_featured',
    ];
    const sets: string[] = [];
    const args: (string | number | null)[] = [];
    for (const c of cols) {
      if (c in d) {
        sets.push(`${c} = ?`);
        args.push(
          c === 'is_active' || c === 'is_featured' ? (d[c] ? 1 : 0) : ((d[c] as string) ?? null)
        );
      }
    }
    sets.push('updated_at = ?');
    args.push(nowISO(), params.id);
    await run(`UPDATE challenge_templates SET ${sets.join(', ')} WHERE id = ?`, args);
    return coerceBooleans(
      await one('SELECT * FROM challenge_templates WHERE id = ?', [params.id]),
      CHALLENGE_BOOLS
    );
  });

  router.delete('/challenges/:id', async (req: ApiRequest, params) => {
    requireUser(req);
    await run('DELETE FROM challenge_templates WHERE id = ?', [params.id]);
    return { success: true };
  });

  // Complete (or update) a daily log and recompute progress.
  router.post('/challenges/progress/:progressId/complete', async (req: ApiRequest, params) => {
    const user = requireUser(req);
    const b = (req.body ?? {}) as {
      challengeId?: string;
      dayNumber?: number;
      countCompleted?: number;
      targetCount?: number;
      notes?: string;
      mood?: string;
    };
    const progressId = params.progressId;
    const dayNumber = Number(b.dayNumber);
    const countCompleted = Number(b.countCompleted);
    const targetCount = Number(b.targetCount);
    const isCompleted = countCompleted >= targetCount;

    const now = new Date();
    const bdTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
    const completionDate = bdTime.toLocaleDateString('en-CA');

    const existingLog = await one<{ id: string }>(
      'SELECT id FROM user_challenge_daily_logs WHERE user_progress_id = ? AND day_number = ?',
      [progressId, dayNumber]
    );

    if (existingLog) {
      await run(
        `UPDATE user_challenge_daily_logs SET
          count_completed = ?, target_count = ?, is_completed = ?, completed_at = ?, notes = ?, mood = ?
         WHERE id = ?`,
        [
          countCompleted,
          targetCount,
          isCompleted ? 1 : 0,
          isCompleted ? nowMs() : null,
          b.notes ?? null,
          b.mood ?? null,
          existingLog.id,
        ]
      );
    } else {
      await run(
        `INSERT INTO user_challenge_daily_logs
          (id, user_progress_id, user_id, challenge_id, day_number, completion_date,
           count_completed, target_count, is_completed, completed_at, notes, mood, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          uuid(),
          progressId,
          user.id,
          b.challengeId ?? null,
          dayNumber,
          completionDate,
          countCompleted,
          targetCount,
          isCompleted ? 1 : 0,
          isCompleted ? nowMs() : null,
          b.notes ?? null,
          b.mood ?? null,
          nowMs(),
        ]
      );
    }

    const progress = await one<Record<string, unknown>>(
      'SELECT * FROM user_challenge_progress WHERE id = ?',
      [progressId]
    );
    if (!progress) return { error: 'Progress not found' };
    const challenge = await one<{ total_days: number }>(
      'SELECT total_days FROM challenge_templates WHERE id = ?',
      [progress.challenge_id as string]
    );

    const newStreak = isCompleted ? Number(progress.current_streak || 0) + 1 : 0;
    const newLongestStreak = Math.max(Number(progress.longest_streak || 0), newStreak);
    const newTotalCompleted = Number(progress.total_completed_days || 0) + (isCompleted ? 1 : 0);
    const newMissedDays = Number(progress.missed_days || 0) + (isCompleted ? 0 : 1);
    const newCurrentDay = dayNumber + 1;
    const totalDays = Number(challenge?.total_days || 21);
    const isChallengeCompleted = newCurrentDay > totalDays && newTotalCompleted >= totalDays;

    const sets = [
      'current_day = ?',
      'current_streak = ?',
      'longest_streak = ?',
      'total_completed_days = ?',
      'missed_days = ?',
    ];
    const args: (string | number | null)[] = [
      newCurrentDay,
      newStreak,
      newLongestStreak,
      newTotalCompleted,
      newMissedDays,
    ];
    if (isCompleted) {
      sets.push('last_completed_at = ?');
      args.push(nowMs());
    }
    if (isChallengeCompleted) {
      sets.push("status = 'completed'", 'completed_at = ?');
      args.push(nowMs());
    }
    sets.push('updated_at = ?');
    args.push(nowISO(), progressId);
    await run(`UPDATE user_challenge_progress SET ${sets.join(', ')} WHERE id = ?`, args);

    if (b.challengeId) {
      await run(
        'UPDATE challenge_templates SET total_completions = total_completions + 1 WHERE id = ?',
        [b.challengeId]
      );
    }

    return { success: true, isCompleted, isChallengeCompleted, newStreak };
  });
}

function nowISO(): string {
  return new Date().toISOString();
}
