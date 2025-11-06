import { pgTable, text, integer, boolean, timestamp, uuid, bigint, time, date } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Import Salah schema
export * from './schema/salah'

// Challenge Templates
export const challengeTemplates = pgTable('challenge_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  title_bn: text('title_bn').notNull(),
  title_ar: text('title_ar'),
  title_en: text('title_en'),
  description_bn: text('description_bn'),
  description_ar: text('description_ar'),
  description_en: text('description_en'),
  arabic_text: text('arabic_text').notNull(),
  transliteration_bn: text('transliteration_bn'),
  translation_bn: text('translation_bn').notNull(),
  translation_en: text('translation_en'),
  daily_target_count: integer('daily_target_count').default(21),
  total_days: integer('total_days').default(21),
  recommended_time: text('recommended_time'),
  recommended_prayer: text('recommended_prayer'),
  reference: text('reference'),
  fazilat_bn: text('fazilat_bn'),
  fazilat_ar: text('fazilat_ar'),
  fazilat_en: text('fazilat_en'),
  difficulty_level: text('difficulty_level').default('medium'),
  icon: text('icon'),
  color: text('color'),
  display_order: integer('display_order').default(0),
  is_featured: boolean('is_featured').default(false),
  is_active: boolean('is_active').default(true),
  total_participants: integer('total_participants').default(0),
  total_completions: integer('total_completions').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

// User Challenge Progress
export const userChallengeProgress = pgTable('user_challenge_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  challenge_id: uuid('challenge_id').notNull().references(() => challengeTemplates.id, { onDelete: 'cascade' }),
  current_day: integer('current_day').default(1),
  status: text('status').default('active'),
  current_streak: integer('current_streak').default(0),
  longest_streak: integer('longest_streak').default(0),
  total_completed_days: integer('total_completed_days').default(0),
  missed_days: integer('missed_days').default(0),
  started_at: timestamp('started_at').defaultNow(),
  last_completed_at: timestamp('last_completed_at'),
  completed_at: timestamp('completed_at'),
  paused_at: timestamp('paused_at'),
  daily_reminder_enabled: boolean('daily_reminder_enabled').default(true),
  reminder_time: time('reminder_time'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

// User Challenge Daily Logs
export const userChallengeDailyLogs = pgTable('user_challenge_daily_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_progress_id: uuid('user_progress_id').notNull().references(() => userChallengeProgress.id, { onDelete: 'cascade' }),
  user_id: uuid('user_id').notNull(),
  challenge_id: uuid('challenge_id').notNull().references(() => challengeTemplates.id, { onDelete: 'cascade' }),
  day_number: integer('day_number').notNull(),
  completion_date: date('completion_date').notNull(),
  count_completed: integer('count_completed').notNull(),
  target_count: integer('target_count').notNull(),
  is_completed: boolean('is_completed').default(false),
  started_at: timestamp('started_at'),
  completed_at: timestamp('completed_at'),
  duration_seconds: integer('duration_seconds'),
  notes: text('notes'),
  mood: text('mood'),
  created_at: timestamp('created_at').defaultNow(),
})

// User Challenge Bookmarks
export const userChallengeBookmarks = pgTable('user_challenge_bookmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  challenge_id: uuid('challenge_id').notNull().references(() => challengeTemplates.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow(),
})

// Activity Stats
export const activityStats = pgTable('activity_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  name_bn: text('name_bn').notNull(),
  name_ar: text('name_ar'),
  name_en: text('name_en'),
  unique_slug: text('unique_slug').notNull().unique(),
  total_count: bigint('total_count', { mode: 'number' }).default(0),
  total_users: integer('total_users').default(0),
  arabic_text: text('arabic_text'),
  activity_type: text('activity_type').default('dhikr'),
  icon: text('icon'),
  color: text('color'),
  display_order: integer('display_order').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

// User Activity Stats
export const userActivityStats = pgTable('user_activity_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  activity_stat_id: uuid('activity_stat_id').notNull().references(() => activityStats.id, { onDelete: 'cascade' }),
  total_completed: bigint('total_completed', { mode: 'number' }).default(0),
  current_streak: integer('current_streak').default(0),
  longest_streak: integer('longest_streak').default(0),
  last_completed_at: timestamp('last_completed_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

// Challenge Activity Mapping
export const challengeActivityMapping = pgTable('challenge_activity_mapping', {
  id: uuid('id').primaryKey().defaultRandom(),
  challenge_id: uuid('challenge_id').notNull().references(() => challengeTemplates.id, { onDelete: 'cascade' }),
  activity_stat_id: uuid('activity_stat_id').notNull().references(() => activityStats.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow(),
})

// User Roles
export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().unique(),
  role: text('role').default('user'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

// Permissions
export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow(),
})

// Role Permissions
export const rolePermissions = pgTable('role_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  role_id: uuid('role_id').notNull().references(() => userRoles.id, { onDelete: 'cascade' }),
  permission_id: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow(),
})

// Admin Users
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().unique(),
  email: text('email').notNull(),
  role: text('role').default('editor'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

// Duas
export const duas = pgTable('duas', {
  id: uuid('id').primaryKey().defaultRandom(),
  title_bn: text('title_bn').notNull(),
  title_ar: text('title_ar'),
  title_en: text('title_en'),
  dua_text_ar: text('dua_text_ar').notNull(),
  translation_bn: text('translation_bn'),
  translation_en: text('translation_en'),
  transliteration: text('transliteration'),
  category: text('category').notNull().default('general'),
  source: text('source'),
  reference: text('reference'),
  benefits: text('benefits'),
  is_important: boolean('is_important').default(false),
  is_active: boolean('is_active').default(true),
  tags: text('tags').array(),
  audio_url: text('audio_url'),
  created_by: uuid('created_by'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

// Dua Categories
export const duaCategories = pgTable('dua_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name_bn: text('name_bn').notNull(),
  name_ar: text('name_ar'),
  name_en: text('name_en'),
  description: text('description'),
  icon: text('icon'),
  color: text('color').default('#10b981'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
})

// App Settings
export const appSettings = pgTable('app_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: text('value'),
  category: text('category').notNull(),
  type: text('type').notNull(),
  label: text('label').notNull(),
  description: text('description'),
  is_public: boolean('is_public').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

// User Settings
export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  key: text('key').notNull(),
  value: text('value'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

// Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  icon: text('icon').default('🔔'),
  action_url: text('action_url'),
  is_read: boolean('is_read').default(false),
  expires_at: timestamp('expires_at'),
  metadata: text('metadata'),
  created_at: timestamp('created_at').defaultNow(),
})

// API Logs
export const apiLogs = pgTable('api_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  level: text('level').notNull(),
  message: text('message').notNull(),
  meta: text('meta'),
  timestamp: timestamp('timestamp').defaultNow(),
})

// User Preferences
export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().unique(),
  language: text('language').default('bn'),
  theme: text('theme').default('light'),
  font_size: text('font_size').default('medium'),
  show_transliteration: boolean('show_transliteration').default(true),
  show_translation: boolean('show_translation').default(true),
  auto_play_audio: boolean('auto_play_audio').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

// Challenge Achievements
export const challengeAchievements = pgTable('challenge_achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  title_bn: text('title_bn').notNull(),
  title_ar: text('title_ar'),
  title_en: text('title_en'),
  description_bn: text('description_bn'),
  description_ar: text('description_ar'),
  description_en: text('description_en'),
  icon: text('icon'),
  badge_color: text('badge_color'),
  requirement_type: text('requirement_type').notNull(),
  requirement_value: integer('requirement_value').notNull(),
  display_order: integer('display_order').default(0),
  created_at: timestamp('created_at').defaultNow(),
})

// User Achievements
export const userAchievements = pgTable('user_achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  achievement_id: uuid('achievement_id').notNull().references(() => challengeAchievements.id, { onDelete: 'cascade' }),
  earned_at: timestamp('earned_at').defaultNow(),
})

// Relations
export const challengeTemplatesRelations = relations(challengeTemplates, ({ many }) => ({
  userProgress: many(userChallengeProgress),
  dailyLogs: many(userChallengeDailyLogs),
  bookmarks: many(userChallengeBookmarks),
}))

export const userChallengeProgressRelations = relations(userChallengeProgress, ({ one, many }) => ({
  challenge: one(challengeTemplates, {
    fields: [userChallengeProgress.challenge_id],
    references: [challengeTemplates.id],
  }),
  dailyLogs: many(userChallengeDailyLogs),
}))

export const userChallengeDailyLogsRelations = relations(userChallengeDailyLogs, ({ one }) => ({
  userProgress: one(userChallengeProgress, {
    fields: [userChallengeDailyLogs.user_progress_id],
    references: [userChallengeProgress.id],
  }),
  challenge: one(challengeTemplates, {
    fields: [userChallengeDailyLogs.challenge_id],
    references: [challengeTemplates.id],
  }),
}))

export const activityStatsRelations = relations(activityStats, ({ many }) => ({
  userStats: many(userActivityStats),
  challengeMappings: many(challengeActivityMapping),
}))

export const userActivityStatsRelations = relations(userActivityStats, ({ one }) => ({
  activity: one(activityStats, {
    fields: [userActivityStats.activity_stat_id],
    references: [activityStats.id],
  }),
}))

export const adminUsersRelations = relations(adminUsers, ({ one }) => ({
  userRole: one(userRoles, {
    fields: [adminUsers.user_id],
    references: [userRoles.user_id],
  }),
}))