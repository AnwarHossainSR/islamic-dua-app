import { pgTable, text, integer, boolean, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Enums
export const difficultyLevelEnum = pgEnum('difficulty_level', ['easy', 'medium', 'hard'])
export const challengeStatusEnum = pgEnum('challenge_status', ['not_started', 'active', 'paused', 'completed'])
export const userRoleEnum = pgEnum('user_role', ['user', 'editor', 'admin', 'super_admin'])

// Challenge Templates
export const challengeTemplates = pgTable('challenge_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  titleBn: text('title_bn').notNull(),
  titleAr: text('title_ar'),
  titleEn: text('title_en'),
  descriptionBn: text('description_bn'),
  descriptionAr: text('description_ar'),
  descriptionEn: text('description_en'),
  arabicText: text('arabic_text'),
  transliterationBn: text('transliteration_bn'),
  translationBn: text('translation_bn'),
  translationEn: text('translation_en'),
  dailyTargetCount: integer('daily_target_count').default(21),
  totalDays: integer('total_days').default(21),
  recommendedTime: text('recommended_time'),
  recommendedPrayer: text('recommended_prayer'),
  reference: text('reference'),
  fazilatBn: text('fazilat_bn'),
  fazilatAr: text('fazilat_ar'),
  fazilatEn: text('fazilat_en'),
  difficultyLevel: difficultyLevelEnum('difficulty_level').default('medium'),
  icon: text('icon'),
  color: text('color'),
  displayOrder: integer('display_order').default(0),
  isFeatured: boolean('is_featured').default(false),
  isActive: boolean('is_active').default(true),
  totalParticipants: integer('total_participants').default(0),
  totalCompletions: integer('total_completions').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// User Challenge Progress
export const userChallengeProgress = pgTable('user_challenge_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  challengeId: uuid('challenge_id').notNull().references(() => challengeTemplates.id, { onDelete: 'cascade' }),
  status: challengeStatusEnum('status').default('not_started'),
  currentDay: integer('current_day').default(1),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  totalCompletedDays: integer('total_completed_days').default(0),
  missedDays: integer('missed_days').default(0),
  completionCount: integer('completion_count').default(0),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  pausedAt: timestamp('paused_at'),
  lastCompletedAt: timestamp('last_completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// User Challenge Daily Logs
export const userChallengeDailyLogs = pgTable('user_challenge_daily_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userProgressId: uuid('user_progress_id').notNull().references(() => userChallengeProgress.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  challengeId: uuid('challenge_id').notNull().references(() => challengeTemplates.id, { onDelete: 'cascade' }),
  dayNumber: integer('day_number').notNull(),
  completionDate: text('completion_date').notNull(),
  countCompleted: integer('count_completed').notNull(),
  targetCount: integer('target_count').notNull(),
  isCompleted: boolean('is_completed').default(false),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  durationSeconds: integer('duration_seconds'),
  notes: text('notes'),
  mood: text('mood'),
  createdAt: timestamp('created_at').defaultNow(),
})

// User Challenge Bookmarks
export const userChallengeBookmarks = pgTable('user_challenge_bookmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  challengeId: uuid('challenge_id').notNull().references(() => challengeTemplates.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
})

// User Roles
export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),
  role: userRoleEnum('role').default('user'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Permissions
export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Role Permissions
export const rolePermissions = pgTable('role_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  roleId: uuid('role_id').notNull().references(() => userRoles.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
})

// Admin Users
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),
  email: text('email').notNull(),
  role: userRoleEnum('role').default('user'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Activity Stats
export const activityStats = pgTable('activity_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  nameBn: text('name_bn').notNull(),
  nameAr: text('name_ar'),
  nameEn: text('name_en'),
  uniqueSlug: text('unique_slug').notNull().unique(),
  totalCount: integer('total_count').default(0),
  totalUsers: integer('total_users').default(0),
  arabicText: text('arabic_text'),
  activityType: text('activity_type').default('dhikr'),
  icon: text('icon'),
  color: text('color'),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// User Activity Stats
export const userActivityStats = pgTable('user_activity_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  activityStatId: uuid('activity_stat_id').notNull().references(() => activityStats.id, { onDelete: 'cascade' }),
  totalCompleted: integer('total_completed').default(0),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastCompletedAt: timestamp('last_completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Duas
export const duas = pgTable('duas', {
  id: uuid('id').primaryKey().defaultRandom(),
  titleBn: text('title_bn').notNull(),
  titleAr: text('title_ar'),
  titleEn: text('title_en'),
  duaTextAr: text('dua_text_ar').notNull(),
  translationBn: text('translation_bn'),
  translationEn: text('translation_en'),
  transliteration: text('transliteration'),
  category: text('category').notNull(),
  source: text('source'),
  reference: text('reference'),
  benefits: text('benefits'),
  isImportant: boolean('is_important').default(false),
  isActive: boolean('is_active').default(true),
  tags: text('tags'),
  audioUrl: text('audio_url'),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Dua Categories
export const duaCategories = pgTable('dua_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  nameBn: text('name_bn').notNull(),
  nameAr: text('name_ar'),
  nameEn: text('name_en'),
  description: text('description'),
  icon: text('icon'),
  color: text('color').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
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
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// User Settings
export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  key: text('key').notNull(),
  value: text('value'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  icon: text('icon').default('🔔'),
  actionUrl: text('action_url'),
  isRead: boolean('is_read').default(false),
  expiresAt: timestamp('expires_at'),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
})

// API Logs
export const apiLogs = pgTable('api_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  level: text('level').notNull(),
  message: text('message').notNull(),
  meta: text('meta'),
  timestamp: timestamp('timestamp').defaultNow(),
})

// Relations
export const challengeTemplatesRelations = relations(challengeTemplates, ({ many }) => ({
  userProgress: many(userChallengeProgress),
  dailyLogs: many(userChallengeDailyLogs),
  bookmarks: many(userChallengeBookmarks),
}))

export const userChallengeProgressRelations = relations(userChallengeProgress, ({ one, many }) => ({
  challenge: one(challengeTemplates, {
    fields: [userChallengeProgress.challengeId],
    references: [challengeTemplates.id],
  }),
  dailyLogs: many(userChallengeDailyLogs),
}))

export const userChallengeDailyLogsRelations = relations(userChallengeDailyLogs, ({ one }) => ({
  userProgress: one(userChallengeProgress, {
    fields: [userChallengeDailyLogs.userProgressId],
    references: [userChallengeProgress.id],
  }),
  challenge: one(challengeTemplates, {
    fields: [userChallengeDailyLogs.challengeId],
    references: [challengeTemplates.id],
  }),
}))

export const userChallengeBookmarksRelations = relations(userChallengeBookmarks, ({ one }) => ({
  challenge: one(challengeTemplates, {
    fields: [userChallengeBookmarks.challengeId],
    references: [challengeTemplates.id],
  }),
}))

export const userRolesRelations = relations(userRoles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}))

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}))

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(userRoles, {
    fields: [rolePermissions.roleId],
    references: [userRoles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}))

export const adminUsersRelations = relations(adminUsers, ({ one }) => ({
  userRole: one(userRoles, {
    fields: [adminUsers.userId],
    references: [userRoles.userId],
  }),
}))

export const activityStatsRelations = relations(activityStats, ({ many }) => ({
  userStats: many(userActivityStats),
}))

export const userActivityStatsRelations = relations(userActivityStats, ({ one }) => ({
  activity: one(activityStats, {
    fields: [userActivityStats.activityStatId],
    references: [activityStats.id],
  }),
}))

export const appSettingsRelations = relations(appSettings, ({ many }) => ({}))

export const userSettingsRelations = relations(userSettings, ({ many }) => ({}))