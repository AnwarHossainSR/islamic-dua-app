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
    ['challenges.manage', 'Manage challenges', 'challenges', 'manage'],
    ['users.manage', 'Manage users', 'users', 'manage'],
    ['settings.manage', 'Manage settings', 'settings', 'manage'],
  ];
  for (const [name, description, resource, action] of permissions) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO permissions (id, name, description, resource, action, created_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [randomUUID(), name, description, resource, action, now],
    });
  }

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
