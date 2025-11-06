import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const salahPrayers = pgTable('salah_prayers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name_bn: text('name_bn').notNull(),
  name_ar: text('name_ar'),
  name_en: text('name_en'),
  prayer_time: text('prayer_time').notNull(),
  description_bn: text('description_bn'),
  description_ar: text('description_ar'),
  description_en: text('description_en'),
  icon: text('icon').default('🕌'),
  color: text('color').default('#10b981'),
  is_active: boolean('is_active').default(true),
  sort_order: integer('sort_order').default(0),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const salahAmols = pgTable('salah_amols', {
  id: uuid('id').primaryKey().defaultRandom(),
  salah_prayer_id: uuid('salah_prayer_id').references(() => salahPrayers.id, { onDelete: 'cascade' }),
  name_bn: text('name_bn').notNull(),
  name_en: text('name_en'),
  description_bn: text('description_bn'),
  description_en: text('description_en'),
  reward_points: integer('reward_points').default(1),
  is_required: boolean('is_required').default(false),
  sort_order: integer('sort_order').default(0),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const userSalahProgress = pgTable('user_salah_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  salah_prayer_id: uuid('salah_prayer_id').references(() => salahPrayers.id, { onDelete: 'cascade' }),
  completed_date: text('completed_date'),
  completed_amols: jsonb('completed_amols').$type<string[]>().default([]),
  total_amols: integer('total_amols').default(0),
  completion_percentage: integer('completion_percentage').default(0),
  notes: text('notes'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const userSalahStats = pgTable('user_salah_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().unique(),
  total_prayers_completed: integer('total_prayers_completed').default(0),
  total_amols_completed: integer('total_amols_completed').default(0),
  current_streak: integer('current_streak').default(0),
  longest_streak: integer('longest_streak').default(0),
  last_completed_at: timestamp('last_completed_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})