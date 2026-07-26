#!/usr/bin/env node
/**
 * Create the SQLite/libSQL schema and seed baseline data.
 *
 * Usage:
 *   node scripts/db-setup.mjs                # local file ./data/local.db
 *   DATABASE_URL=file:./data/local.db node scripts/db-setup.mjs
 *   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... node scripts/db-setup.mjs
 */
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function resolveConfig() {
  if (process.env.TURSO_DATABASE_URL) {
    return {
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    };
  }
  const url = process.env.DATABASE_URL || 'file:./data/local.db';
  if (url.startsWith('file:')) {
    // Ensure the directory exists for the local SQLite file.
    const filePath = url.replace(/^file:/, '');
    mkdirSync(dirname(join(root, filePath)), { recursive: true });
  }
  return { url };
}

/** Split a SQL file into executable statements, stripping `--` comment lines. */
function splitStatements(sql) {
  return sql
    .split(';')
    .map((chunk) =>
      chunk
        .split('\n')
        .filter((line) => !line.trim().startsWith('--'))
        .join('\n')
        .trim()
    )
    .filter((s) => s.length > 0);
}

const config = resolveConfig();
const db = createClient(config);

async function applySchema() {
  const sql = readFileSync(join(root, 'server', 'schema.sql'), 'utf8');
  const statements = splitStatements(sql);
  for (const stmt of statements) {
    await db.execute(stmt);
  }
  console.log(`✓ Schema applied (${statements.length} statements) -> ${config.url}`);
}

async function seed() {
  const now = new Date().toISOString();

  // Default dua categories
  const categories = [
    { name_bn: 'সাধারণ', name_en: 'General', slug: 'general', color: '#10b981', icon: '📿' },
    {
      name_bn: 'সকাল-সন্ধ্যা',
      name_en: 'Morning & Evening',
      slug: 'morning-evening',
      color: '#f59e0b',
      icon: '🌅',
    },
    { name_bn: 'নামাজ', name_en: 'Prayer', slug: 'prayer', color: '#3b82f6', icon: '🕌' },
  ];
  for (const c of categories) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO dua_categories (id, name_bn, name_en, description, icon, color, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
      args: [randomUUID(), c.name_bn, c.name_en, null, c.icon, c.color, now],
    });
  }

  // Baseline permissions
  const permissions = [
    ['duas.read', 'View duas', 'duas', 'read'],
    ['duas.write', 'Create/edit duas', 'duas', 'write'],
    ['duas.delete', 'Delete duas', 'duas', 'delete'],
    ['challenges.read', 'View challenges', 'challenges', 'read'],
    ['challenges.manage', 'Manage challenges', 'challenges', 'manage'],
    ['users.read', 'View users', 'users', 'read'],
    ['users.manage', 'Manage users', 'users', 'manage'],
    ['settings.manage', 'Manage settings', 'settings', 'manage'],
    ['logs.read', 'View logs', 'logs', 'read'],
  ];
  const permIds = {};
  for (const [name, description, resource, action] of permissions) {
    const id = randomUUID();
    await db.execute({
      sql: `INSERT OR IGNORE INTO permissions (id, name, description, resource, action, created_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [id, name, description, resource, action, now],
    });
    // Resolve the actual id (row may have pre-existed).
    const row = await db.execute({
      sql: 'SELECT id FROM permissions WHERE name = ?',
      args: [name],
    });
    permIds[name] = row.rows[0].id;
  }

  // Role → permission assignments (roles stored as text).
  const rolePerms = {
    super_admin: permissions.map((p) => p[0]),
    admin: [
      'duas.read',
      'duas.write',
      'duas.delete',
      'challenges.read',
      'challenges.manage',
      'users.read',
      'settings.manage',
      'logs.read',
    ],
    editor: ['duas.read', 'duas.write', 'challenges.read', 'challenges.manage'],
    user: ['duas.read', 'challenges.read'],
  };
  for (const [role, names] of Object.entries(rolePerms)) {
    for (const name of names) {
      await db.execute({
        sql: `INSERT OR IGNORE INTO role_permissions (id, role, permission_id, created_at)
              VALUES (?, ?, ?, ?)`,
        args: [randomUUID(), role, permIds[name], now],
      });
    }
  }

  // App settings grouped by the categories the Settings page renders.
  const appSettings = [
    // general
    [
      'app_name',
      'Islamic Dua App',
      'general',
      'string',
      'Application Name',
      'Displayed app title',
      1,
    ],
    ['items_per_page', '20', 'general', 'number', 'Items Per Page', 'Default pagination size', 1],
    [
      'maintenance_mode',
      'false',
      'general',
      'boolean',
      'Maintenance Mode',
      'Temporarily disable the app',
      0,
    ],
    // localization
    ['default_language', '"bn"', 'localization', 'string', 'Default Language', 'bn or en', 1],
    ['timezone', '"Asia/Dhaka"', 'localization', 'string', 'Timezone', 'IANA timezone', 1],
    // security
    [
      'session_timeout_days',
      '30',
      'security',
      'number',
      'Session Timeout (days)',
      'JWT session lifetime',
      0,
    ],
    ['allow_signups', 'true', 'security', 'boolean', 'Allow Sign-ups', 'Let new users register', 0],
    // appearance
    [
      'default_theme',
      '"system"',
      'appearance',
      'string',
      'Default Theme',
      'light, dark or system',
      1,
    ],
    [
      'accent_color',
      '"#10b981"',
      'appearance',
      'string',
      'Accent Color',
      'Primary accent color',
      1,
    ],
  ];
  for (const [key, value, category, type, label, description, isPublic] of appSettings) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO app_settings (id, key, value, category, type, label, description, is_public, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [randomUUID(), key, value, category, type, label, description, isPublic, now, now],
    });
  }

  // A few activity_stats so the Activities/Dashboard pages have content.
  const activities = [
    ['ইস্তেগফার', 'Istighfar', 'istighfar', 'أَسْتَغْفِرُ اللَّهَ', '📿', '#10b981'],
    ['দরুদ শরীফ', 'Durood Sharif', 'durood', 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّد', '🕌', '#3b82f6'],
    ['তাসবীহ', 'Tasbih', 'tasbih', 'سُبْحَانَ اللَّهِ', '✨', '#f59e0b'],
  ];
  for (const [nameBn, nameEn, slug, arabic, icon, color] of activities) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO activity_stats (id, name_bn, name_en, unique_slug, arabic_text, activity_type, icon, color, total_count, total_users, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'dhikr', ?, ?, 0, 0, ?, ?)`,
      args: [randomUUID(), nameBn, nameEn, slug, arabic, icon, color, now, now],
    });
  }

  // Sample duas so the Duas page is not empty on first run.
  const nowMs = Date.now();
  const sampleDuas = [
    [
      'সকালের দোয়া',
      'Morning Dua',
      'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ',
      'আমরা সকালে উপনীত হলাম',
      'morning-evening',
      1,
    ],
    ['খাবারের পূর্বে দোয়া', 'Dua Before Eating', 'بِسْمِ اللَّهِ', 'আল্লাহর নামে', 'general', 0],
    ['ঘুমানোর দোয়া', 'Dua Before Sleep', 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', 'হে আল্লাহ, আপনার নামে', 'general', 1],
  ];
  for (const [titleBn, titleEn, ar, transBn, category, important] of sampleDuas) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO duas (id, title_bn, title_en, dua_text_ar, translation_bn, category, is_important, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      args: [randomUUID(), titleBn, titleEn, ar, transBn, category, important, nowMs, nowMs],
    });
  }

  // A sample challenge so the Challenges page is not empty.
  await db.execute({
    sql: `INSERT OR IGNORE INTO challenge_templates
            (id, title_bn, title_en, arabic_text, translation_bn, daily_target_count, total_days,
             difficulty_level, icon, color, display_order, is_active, is_featured, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'easy', ?, ?, 1, 1, 1, ?, ?)`,
    args: [
      randomUUID(),
      '২১ দিন ইস্তেগফার চ্যালেঞ্জ',
      '21 Days Istighfar Challenge',
      'أَسْتَغْفِرُ اللَّهَ',
      'আমি আল্লাহর কাছে ক্ষমা চাই',
      100,
      21,
      '📿',
      '#10b981',
      now,
      now,
    ],
  });

  // Optional demo admin user (only when ADMIN_EMAIL + ADMIN_PASSWORD provided)
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const existing = await db.execute({
      sql: 'SELECT id FROM auth_users WHERE email = ?',
      args: [adminEmail],
    });
    if (existing.rows.length === 0) {
      const id = randomUUID();
      const hash = await bcrypt.hash(adminPassword, 10);
      await db.execute({
        sql: `INSERT INTO auth_users (id, email, password_hash, email_confirmed, created_at, updated_at)
              VALUES (?, ?, ?, 1, ?, ?)`,
        args: [id, adminEmail, hash, now, now],
      });
      await db.execute({
        sql: `INSERT INTO admin_users (id, user_id, email, role, is_active, created_at, updated_at)
              VALUES (?, ?, ?, 'super_admin', 1, ?, ?)`,
        args: [randomUUID(), id, adminEmail, now, now],
      });
      console.log(`✓ Seeded super_admin user: ${adminEmail}`);
    } else {
      console.log(`• Admin user ${adminEmail} already exists, skipping`);
    }
  }

  console.log('✓ Seed complete');
}

await applySchema();
await seed();
