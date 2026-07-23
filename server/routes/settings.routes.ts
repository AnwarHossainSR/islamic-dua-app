import { requireAdmin } from '../authz';
import { all, count, one, run } from '../db';
import { ApiError, type ApiRequest, type Router } from '../http';
import { coerceBooleansAll, nowIso, safeIdentifier } from '../util';

const BACKUP_TABLES = [
  'permissions',
  'role_permissions',
  'admin_users',
  'app_settings',
  'user_settings',
  'dua_categories',
  'duas',
  'activity_stats',
  'challenge_templates',
  'user_activity_stats',
  'challenge_activity_mapping',
  'user_challenge_progress',
  'user_challenge_daily_logs',
  'user_missed_challenges',
  'notifications',
  'api_logs',
];

export function registerSettingsRoutes(router: Router) {
  // Unauthenticated callers only see public settings; authenticated users see all.
  router.get('/settings', async (req: ApiRequest) => {
    const category = req.query.category;
    const publicOnly = req.user ? '' : ' AND is_public = 1';
    const rows = category
      ? await all(`SELECT * FROM app_settings WHERE category = ?${publicOnly}`, [category])
      : await all(`SELECT * FROM app_settings${req.user ? '' : ' WHERE is_public = 1'}`);
    return coerceBooleansAll(rows, ['is_public']);
  });

  router.put('/settings/:key', async (req: ApiRequest, params) => {
    await requireAdmin(req);
    const { value } = (req.body ?? {}) as { value?: unknown };
    await run('UPDATE app_settings SET value = ?, updated_at = ? WHERE key = ?', [
      JSON.stringify(value),
      nowIso(),
      params.key,
    ]);
    return { success: true };
  });

  router.get('/settings/db-stats', async (req: ApiRequest) => {
    await requireAdmin(req);
    const duasCount = await count('SELECT count(*) AS c FROM duas');
    const challengesCount = await count('SELECT count(*) AS c FROM challenge_templates');
    const activeUsers = await count('SELECT count(*) AS c FROM user_challenge_progress');
    const adminsCount = await count('SELECT count(*) AS c FROM admin_users');
    return {
      totalRecords: duasCount + challengesCount + activeUsers + adminsCount,
      duasCount,
      challengesCount,
      activeUsers,
      adminsCount,
      dbSize: 'N/A',
    };
  });

  router.get('/settings/credentials', async (req: ApiRequest) => {
    await requireAdmin(req);
    return all('SELECT * FROM webauthn_credentials ORDER BY created_at DESC');
  });

  router.delete('/settings/credentials/:credentialId', async (req: ApiRequest, params) => {
    await requireAdmin(req);
    await run('DELETE FROM webauthn_credentials WHERE credential_id = ?', [params.credentialId]);
    return { success: true };
  });

  // Backups: generate a portable SQL dump directly from the DB. Cloud storage
  // (Supabase Storage) is not available; the client downloads the SQL text.
  router.get('/settings/backups', async (req: ApiRequest) => {
    await requireAdmin(req);
    // No external storage backend — kept for UI parity.
    return [];
  });

  router.post('/settings/backups', async (req: ApiRequest) => {
    await requireAdmin(req);
    let sql = '-- Islamic Dua App Database Backup\n';
    sql += `-- Generated on: ${new Date().toISOString()}\n\n`;
    for (const table of BACKUP_TABLES) {
      let rows: Record<string, unknown>[] = [];
      try {
        rows = await all<Record<string, unknown>>(`SELECT * FROM ${safeIdentifier(table)}`);
      } catch {
        continue;
      }
      if (rows.length === 0) continue;
      const columns = Object.keys(rows[0]);
      sql += `\n-- Data for table ${table}\n`;
      sql += `INSERT INTO "${table}" (${columns.map((c) => `"${c}"`).join(', ')}) VALUES\n`;
      sql += `${rows
        .map((row) => {
          const vals = columns
            .map((col) => {
              const val = row[col];
              if (val === null || val === undefined) return 'NULL';
              if (typeof val === 'number') return String(val);
              return `'${String(val).replace(/'/g, "''")}'`;
            })
            .join(', ');
          return `  (${vals})`;
        })
        .join(',\n')};\n`;
    }
    const filename = `islamic-dua-app-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
    return { filename, content: sql };
  });

  router.post('/settings/optimize', async (req: ApiRequest) => {
    await requireAdmin(req);
    return { success: true };
  });

  // Raw table export for the Settings > Data Export feature (whitelisted).
  const EXPORTABLE = new Set(['challenge_templates', 'duas', 'app_settings']);
  router.get('/settings/export/:table', async (req: ApiRequest, params) => {
    await requireAdmin(req);
    if (!EXPORTABLE.has(params.table)) {
      throw new ApiError(400, 'Table is not exportable');
    }
    return all(`SELECT * FROM ${safeIdentifier(params.table)}`);
  });
}
