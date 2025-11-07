import { boolean, date, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const salahAmols = pgTable('salah_amols', {
  id: uuid('id').primaryKey().defaultRandom(),
  name_bn: text('name_bn').notNull(),
  name_en: text('name_en'),
  description_bn: text('description_bn'),
  description_en: text('description_en'),
  arabic_text: text('arabic_text'),
  transliteration: text('transliteration'),
  translation_bn: text('translation_bn'),
  translation_en: text('translation_en'),
  repetition_count: integer('repetition_count').default(1),
  salah_type: text('salah_type').notNull(),
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
  amol_id: uuid('amol_id').references(() => salahAmols.id, { onDelete: 'cascade' }),
  completed_date: date('completed_date').defaultNow(),
  notes: text('notes'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})