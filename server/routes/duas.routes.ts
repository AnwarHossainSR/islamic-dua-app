import { all, one, run } from '../db';
import { ApiError, type ApiRequest, type RouteParams, type Router, requireUser } from '../http';
import { coerceBooleans, coerceBooleansAll, fromBool, nowMs, uuid } from '../util';

const DUA_BOOLS = ['is_important', 'is_active'];
const CAT_BOOLS = ['is_active'];

// Duas store `tags` as a JSON string; the client expects a string[].
function parseDua<T extends Record<string, unknown>>(row: T | null): T | null {
  if (!row) return row;
  const out = coerceBooleans(row, DUA_BOOLS) as Record<string, unknown>;
  if (typeof out.tags === 'string') {
    try {
      out.tags = JSON.parse(out.tags as string);
    } catch {
      out.tags = [];
    }
  }
  return out as T;
}

export function registerDuaRoutes(router: Router) {
  router.get('/duas/stats', async () => {
    const rows = await all<{ category: string; is_important: number }>(
      'SELECT category, is_important FROM duas WHERE is_active = 1'
    );
    const total = rows.length;
    const important = rows.filter((d) => d.is_important === 1).length;
    const byCategory = rows.reduce((acc: Record<string, number>, dua) => {
      acc[dua.category] = (acc[dua.category] || 0) + 1;
      return acc;
    }, {});
    return { total, important, byCategory };
  });

  router.get('/duas', async (req: ApiRequest) => {
    const { category, search, isImportant, limit, offset } = req.query;
    const where: string[] = ['is_active = 1'];
    const args: (string | number)[] = [];

    if (category && category !== 'all') {
      where.push('category = ?');
      args.push(category);
    }
    if (search) {
      where.push('(title_bn LIKE ? OR title_en LIKE ? OR dua_text_ar LIKE ?)');
      const like = `%${search}%`;
      args.push(like, like, like);
    }
    if (isImportant === 'true') {
      where.push('is_important = 1');
    }

    let sql = `SELECT * FROM duas WHERE ${where.join(' AND ')} ORDER BY created_at DESC`;
    if (limit) {
      sql += ' LIMIT ?';
      args.push(Number(limit));
      if (offset) {
        sql += ' OFFSET ?';
        args.push(Number(offset));
      }
    }
    const rows = await all(sql, args);
    return rows.map((r) => parseDua(r));
  });

  router.get('/duas/:id', async (_req, params: RouteParams) => {
    const row = await one('SELECT * FROM duas WHERE id = ? AND is_active = 1', [params.id]);
    if (!row) throw new ApiError(404, 'Dua not found');
    return parseDua(row);
  });

  router.get('/dua-categories', async () => {
    const rows = await all('SELECT * FROM dua_categories WHERE is_active = 1 ORDER BY name_bn');
    return coerceBooleansAll(rows, CAT_BOOLS);
  });

  router.post('/duas', async (req: ApiRequest) => {
    const user = requireUser(req);
    const d = (req.body ?? {}) as Record<string, unknown>;
    const id = uuid();
    const now = nowMs();
    await run(
      `INSERT INTO duas (id, title_bn, title_ar, title_en, dua_text_ar, translation_bn,
        translation_en, transliteration, category, source, reference, benefits,
        is_important, is_active, tags, audio_url, created_by, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id,
        String(d.title_bn ?? ''),
        (d.title_ar as string) ?? null,
        (d.title_en as string) ?? null,
        String(d.dua_text_ar ?? ''),
        (d.translation_bn as string) ?? null,
        (d.translation_en as string) ?? null,
        (d.transliteration as string) ?? null,
        String(d.category ?? 'general'),
        (d.source as string) ?? null,
        (d.reference as string) ?? null,
        (d.benefits as string) ?? null,
        fromBool(d.is_important),
        d.is_active === undefined ? 1 : fromBool(d.is_active),
        d.tags ? JSON.stringify(d.tags) : null,
        (d.audio_url as string) ?? null,
        user.id,
        now,
        now,
      ]
    );
    return parseDua(await one('SELECT * FROM duas WHERE id = ?', [id]));
  });

  router.put('/duas/:id', async (req: ApiRequest, params: RouteParams) => {
    requireUser(req);
    const d = (req.body ?? {}) as Record<string, unknown>;
    const allowed = [
      'title_bn',
      'title_ar',
      'title_en',
      'dua_text_ar',
      'translation_bn',
      'translation_en',
      'transliteration',
      'category',
      'source',
      'reference',
      'benefits',
      'is_important',
      'is_active',
      'tags',
      'audio_url',
    ];
    const sets: string[] = [];
    const args: (string | number | null)[] = [];
    for (const key of allowed) {
      if (key in d) {
        sets.push(`${key} = ?`);
        if (key === 'tags') args.push(d[key] ? JSON.stringify(d[key]) : null);
        else if (key === 'is_important' || key === 'is_active') args.push(fromBool(d[key]));
        else args.push((d[key] as string) ?? null);
      }
    }
    sets.push('updated_at = ?');
    args.push(nowMs());
    args.push(params.id);
    await run(`UPDATE duas SET ${sets.join(', ')} WHERE id = ?`, args);
    return parseDua(await one('SELECT * FROM duas WHERE id = ?', [params.id]));
  });

  router.delete('/duas/:id', async (req: ApiRequest, params: RouteParams) => {
    requireUser(req);
    await run('UPDATE duas SET is_active = 0, updated_at = ? WHERE id = ?', [nowMs(), params.id]);
    return { success: true };
  });
}
