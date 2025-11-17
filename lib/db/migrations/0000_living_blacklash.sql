CREATE TABLE "activity_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_bn" text NOT NULL,
	"name_ar" text,
	"name_en" text,
	"unique_slug" text NOT NULL,
	"total_count" bigint DEFAULT 0,
	"total_users" integer DEFAULT 0,
	"arabic_text" text,
	"activity_type" text DEFAULT 'dhikr',
	"icon" text,
	"color" text,
	"display_order" integer DEFAULT 0,
	"created_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
	"updated_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
	CONSTRAINT "activity_stats_unique_slug_unique" UNIQUE("unique_slug")
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'editor',
	"is_active" boolean DEFAULT true,
	"created_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
	"updated_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
	CONSTRAINT "admin_users_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "ai_chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"metadata" text,
	"created_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);
--> statement-breakpoint
CREATE TABLE "ai_chat_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"chat_mode" text DEFAULT 'general' NOT NULL,
	"created_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
	"updated_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);
--> statement-breakpoint
CREATE TABLE "api_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level" text NOT NULL,
	"message" text NOT NULL,
	"meta" text,
	"timestamp" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);
--> statement-breakpoint
CREATE TABLE "app_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" text,
	"category" text NOT NULL,
	"type" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false,
	"created_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
	"updated_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
	CONSTRAINT "app_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "challenge_activity_mapping" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_id" uuid NOT NULL,
	"activity_stat_id" uuid NOT NULL,
	"created_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);
--> statement-breakpoint
CREATE TABLE "challenge_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_bn" text NOT NULL,
	"title_ar" text,
	"title_en" text,
	"description_bn" text,
	"description_ar" text,
	"description_en" text,
	"arabic_text" text NOT NULL,
	"transliteration_bn" text,
	"translation_bn" text NOT NULL,
	"translation_en" text,
	"daily_target_count" integer DEFAULT 21,
	"total_days" integer DEFAULT 21,
	"recommended_time" text,
	"recommended_prayer" text,
	"reference" text,
	"fazilat_bn" text,
	"fazilat_ar" text,
	"fazilat_en" text,
	"difficulty_level" text DEFAULT 'medium',
	"icon" text,
	"color" text,
	"display_order" integer DEFAULT 0,
	"is_featured" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"total_participants" integer DEFAULT 0,
	"total_completions" integer DEFAULT 0,
	"created_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
	"updated_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);
--> statement-breakpoint
CREATE TABLE "dua_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_bn" text NOT NULL,
	"name_ar" text,
	"name_en" text,
	"description" text,
	"icon" text,
	"color" text DEFAULT '#10b981',
	"is_active" boolean DEFAULT true,
	"created_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);
--> statement-breakpoint
CREATE TABLE "duas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_bn" text NOT NULL,
	"title_ar" text,
	"title_en" text,
	"dua_text_ar" text NOT NULL,
	"translation_bn" text,
	"translation_en" text,
	"transliteration" text,
	"category" text DEFAULT 'general' NOT NULL,
	"source" text,
	"reference" text,
	"benefits" text,
	"is_important" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"tags" text[],
	"audio_url" text,
	"created_by" uuid,
	"created_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
	"updated_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"icon" text DEFAULT '🔔',
	"action_url" text,
	"is_read" boolean DEFAULT false,
	"expires_at" bigint,
	"metadata" text,
	"created_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
	CONSTRAINT "permissions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);
--> statement-breakpoint
CREATE TABLE "user_activity_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"activity_stat_id" uuid NOT NULL,
	"total_completed" bigint DEFAULT 0,
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"last_completed_at" bigint,
	"created_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
	"updated_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);
--> statement-breakpoint
CREATE TABLE "user_challenge_bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"challenge_id" uuid NOT NULL,
	"created_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);
--> statement-breakpoint
CREATE TABLE "user_challenge_daily_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_progress_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"challenge_id" uuid NOT NULL,
	"day_number" integer NOT NULL,
	"completion_date" date NOT NULL,
	"count_completed" integer NOT NULL,
	"target_count" integer NOT NULL,
	"is_completed" boolean DEFAULT false,
	"started_at" bigint,
	"completed_at" bigint,
	"duration_seconds" integer,
	"notes" text,
	"mood" text,
	"created_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);
--> statement-breakpoint
CREATE TABLE "user_challenge_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"challenge_id" uuid NOT NULL,
	"current_day" integer DEFAULT 1,
	"status" text DEFAULT 'active',
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"total_completed_days" integer DEFAULT 0,
	"missed_days" integer DEFAULT 0,
	"started_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
	"last_completed_at" bigint,
	"completed_at" bigint,
	"paused_at" bigint,
	"daily_reminder_enabled" boolean DEFAULT true,
	"reminder_time" time,
	"created_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
	"updated_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);
--> statement-breakpoint
CREATE TABLE "user_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"user_email" text NOT NULL,
	"action" text NOT NULL,
	"details" text,
	"created_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);
--> statement-breakpoint
CREATE TABLE "user_missed_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"challenge_id" uuid NOT NULL,
	"missed_date" date NOT NULL,
	"reason" text DEFAULT 'not_completed',
	"was_active" boolean DEFAULT true,
	"created_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"language" text DEFAULT 'bn',
	"theme" text DEFAULT 'light',
	"font_size" text DEFAULT 'medium',
	"show_transliteration" boolean DEFAULT true,
	"show_translation" boolean DEFAULT true,
	"auto_play_audio" boolean DEFAULT false,
	"created_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
	"updated_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'user',
	"created_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
	"updated_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
	CONSTRAINT "user_roles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"key" text NOT NULL,
	"value" text,
	"created_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
	"updated_at" bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);
--> statement-breakpoint
ALTER TABLE "ai_chat_messages" ADD CONSTRAINT "ai_chat_messages_session_id_ai_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ai_chat_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_activity_mapping" ADD CONSTRAINT "challenge_activity_mapping_challenge_id_challenge_templates_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_activity_mapping" ADD CONSTRAINT "challenge_activity_mapping_activity_stat_id_activity_stats_id_fk" FOREIGN KEY ("activity_stat_id") REFERENCES "public"."activity_stats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_user_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."user_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity_stats" ADD CONSTRAINT "user_activity_stats_activity_stat_id_activity_stats_id_fk" FOREIGN KEY ("activity_stat_id") REFERENCES "public"."activity_stats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_challenge_bookmarks" ADD CONSTRAINT "user_challenge_bookmarks_challenge_id_challenge_templates_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_challenge_daily_logs" ADD CONSTRAINT "user_challenge_daily_logs_user_progress_id_user_challenge_progress_id_fk" FOREIGN KEY ("user_progress_id") REFERENCES "public"."user_challenge_progress"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_challenge_daily_logs" ADD CONSTRAINT "user_challenge_daily_logs_challenge_id_challenge_templates_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_challenge_progress" ADD CONSTRAINT "user_challenge_progress_challenge_id_challenge_templates_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_missed_challenges" ADD CONSTRAINT "user_missed_challenges_challenge_id_challenge_templates_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge_templates"("id") ON DELETE cascade ON UPDATE no action;