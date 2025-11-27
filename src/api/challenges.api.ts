import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabase } from "@/lib/supabase/client";
import type { Challenge, UserChallengeProgress } from "@/lib/types";
const { apiLogger } = await import("@/lib/logger");

export const challengesApi = {
  getAll: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("challenge_templates")
        .select(
          `
        *,
        user_challenge_progress!left(
          id,
          status,
          completed_at,
          total_completed_days,
          current_day,
          last_completed_at,
          user_id
        )
      `
        )
        .eq("is_active", true)
        .eq("user_challenge_progress.user_id", user.id)
        .order("display_order");

      if (error) throw error;

      return data.map((challenge) => {
        const progress = challenge.user_challenge_progress?.[0];
        const completionPercentage =
          progress?.total_completed_days && challenge.total_days
            ? Math.min(
                Math.round(
                  (progress.total_completed_days / challenge.total_days) * 100
                ),
                100
              )
            : 0;

        return {
          ...challenge,
          user_status: progress?.status || "not_started",
          progress_id: progress?.id,
          completed_at: progress?.completed_at,
          total_completed_days: progress?.total_completed_days || 0,
          current_day: progress?.current_day || 1,
          last_completed_at: progress?.last_completed_at,
          completion_percentage: completionPercentage,
        };
      }) as Challenge[];
    } catch (error: any) {
      apiLogger.error("Get challenges failed", { error: error.message });
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("challenge_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Challenge;
    } catch (error: any) {
      apiLogger.error("Get challenge by ID failed", {
        id,
        error: error.message,
      });
      throw error;
    }
  },

  checkActiveProgress: async (userId: string, challengeId: string) => {
    return supabase
      .from("user_challenge_progress")
      .select("id, status")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .in("status", ["active", "paused"])
      .maybeSingle();
  },

  start: async (userId: string, challengeId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_challenge_progress")
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          current_day: 1,
          status: "active",
          current_streak: 0,
        })
        .select()
        .single();

      if (error) {
        apiLogger.error("Start challenge failed", {
          userId,
          challengeId,
          error: error.message,
        });
        return { data: null, error };
      }

      await supabase.rpc("increment_challenge_participants", {
        challenge_id: challengeId,
      });
      apiLogger.info("Challenge started", { userId, challengeId });

      return { data: data as UserChallengeProgress, error: null };
    } catch (error: any) {
      apiLogger.error("Start challenge exception", {
        userId,
        challengeId,
        error: error.message,
      });
      throw error;
    }
  },

  getProgress: async (progressId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_challenge_progress")
        .select(
          `
          *,
          challenge:challenge_templates(*),
          daily_logs:user_challenge_daily_logs(*)
        `
        )
        .eq("id", progressId)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      apiLogger.error("Get progress failed", {
        progressId,
        error: error.message,
      });
      throw error;
    }
  },

  restart: async (progressId: string, challengeId: string) => {
    try {
      const { error } = await supabase
        .from("user_challenge_progress")
        .update({
          current_day: 1,
          status: "active",
          current_streak: 0,
          longest_streak: 0,
          total_completed_days: 0,
          missed_days: 0,
          completed_at: null,
          paused_at: null,
          last_completed_at: null,
        })
        .eq("id", progressId);

      if (error) throw error;

      // Clear existing daily logs
      await supabaseAdmin
        .from("user_challenge_daily_logs")
        .delete()
        .eq("user_progress_id", progressId);
      // Increment completions
      const { data: challenge } = await supabase
        .from("challenge_templates")
        .select("total_completions")
        .eq("id", challengeId)
        .single();

      if (challenge) {
        await supabase
          .from("challenge_templates")
          .update({ total_completions: (challenge.total_completions || 0) + 1 })
          .eq("id", challengeId);
      }
      apiLogger.info("Challenge restarted", {
        progressId,
        challengeId,
        challenge,
      });

      return { success: true };
    } catch (error: any) {
      apiLogger.error("Restart challenge failed", {
        progressId,
        challengeId,
        error: error.message,
      });
      throw error;
    }
  },

  create: async (data: any) => {
    try {
      const { data: result, error } = await supabase
        .from("challenge_templates")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      apiLogger.info("Challenge created", { challengeId: result.id });
      return result;
    } catch (error: any) {
      apiLogger.error("Create challenge failed", { error: error.message });
      throw error;
    }
  },

  update: async (id: string, data: any) => {
    try {
      const { data: result, error } = await supabase
        .from("challenge_templates")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      apiLogger.info("Challenge updated", { challengeId: id });
      return result;
    } catch (error: any) {
      apiLogger.error("Update challenge failed", { id, error: error.message });
      throw error;
    }
  },

  complete: async (
    progressId: string,
    userId: string,
    challengeId: string,
    dayNumber: number,
    countCompleted: number,
    targetCount: number,
    notes?: string,
    mood?: string
  ) => {
    try {
      const isCompleted = countCompleted >= targetCount;
      const now = new Date();
      const bdTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" })
      );
      const completionDate = bdTime.toLocaleDateString("en-CA");

      // Check if log exists
      const { data: existingLog } = await supabase
        .from("user_challenge_daily_logs")
        .select("id")
        .eq("user_progress_id", progressId)
        .eq("day_number", dayNumber)
        .single();

      console.log("DEBUG - Existing log found:", !!existingLog);
      console.log("DEBUG - Progress ID:", progressId);
      console.log("DEBUG - Day Number:", dayNumber);

      if (existingLog) {
        console.log("DEBUG - Updating existing log");
        // Update existing
        await supabase
          .from("user_challenge_daily_logs")
          .update({
            count_completed: countCompleted,
            target_count: targetCount,
            is_completed: isCompleted,
            completed_at: isCompleted ? Date.now() : null,
            notes,
            mood,
          })
          .eq("id", existingLog.id);
      } else {
        console.log("DEBUG - Creating new log");
        // Insert new
        await supabase.from("user_challenge_daily_logs").insert({
          user_progress_id: progressId,
          user_id: userId,
          challenge_id: challengeId,
          day_number: dayNumber,
          completion_date: completionDate,
          count_completed: countCompleted,
          target_count: targetCount,
          is_completed: isCompleted,
          completed_at: isCompleted ? Date.now() : null,
          notes,
          mood,
        });
      }

      // Get current progress
      const { data: progress } = await supabase
        .from("user_challenge_progress")
        .select("*, challenge:challenge_templates(*)")
        .eq("id", progressId)
        .single();

      if (!progress) {
        return { error: "Progress not found" };
      }

      // Calculate updates
      const newStreak = isCompleted ? (progress.current_streak || 0) + 1 : 0;
      const newLongestStreak = Math.max(
        progress.longest_streak || 0,
        newStreak
      );
      const newTotalCompleted =
        (progress.total_completed_days || 0) + (isCompleted ? 1 : 0);
      const newMissedDays = (progress.missed_days || 0) + (isCompleted ? 0 : 1);
      const newCurrentDay = dayNumber + 1;
      const isChallengeCompleted =
        newCurrentDay > (progress.challenge.total_days || 21) &&
        newTotalCompleted >= (progress.challenge.total_days || 21);

      const updateData: any = {
        current_day: newCurrentDay,
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        total_completed_days: newTotalCompleted,
        missed_days: newMissedDays,
      };

      if (isCompleted) {
        updateData.last_completed_at = Date.now();
      }

      if (isChallengeCompleted) {
        updateData.status = "completed";
        updateData.completed_at = Date.now();
      }

      // Update progress
      await supabase
        .from("user_challenge_progress")
        .update(updateData)
        .eq("id", progressId);

      // Increment challenge completions
      await supabase.rpc("increment_completions", {
        challenge_id: challengeId,
      });

      // Log challenge completion with challenge title
      if (isCompleted) {
        apiLogger.info("Challenge completed", {
          userId,
          challengeId,
          challengeTitle: progress.challenge?.title_bn,
          dayNumber,
          countCompleted,
          targetCount,
          newStreak,
          isChallengeCompleted,
          completedAt: new Date().toISOString(),
        });
      }

      return { success: true, isCompleted, isChallengeCompleted, newStreak };
    } catch (error) {
      apiLogger.error("Error completing daily challenge", { error });
      return { error: "Failed to complete daily challenge" };
    }
  },

  delete: async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from("challenge_templates")
        .delete()
        .eq("id", challengeId);
      if (error) throw error;
      apiLogger.info("Challenge deleted", { challengeId });
    } catch (error: any) {
      apiLogger.error("Delete challenge failed", {
        challengeId,
        error: error.message,
      });
      throw error;
    }
  },
};
