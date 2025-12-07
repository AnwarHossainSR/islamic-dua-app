import { challengesApi } from "@/api/challenges.api";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ConfirmationModal,
  Loader,
  Progress,
} from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Check,
  Flame,
  RefreshCcw,
  Target,
  Trophy,
  X,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function ChallengeProgressScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [count, setCount] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  const { progressId } = route.params || {};

  useEffect(() => {
    if (progressId) loadProgress();
  }, [progressId]);

  const loadProgress = async () => {
    try {
      const data = await challengesApi.getProgress(progressId);
      setProgress(data);

      // Check if today is already completed
      const today = new Date().toISOString().split("T")[0];
      const todayLog = data?.daily_logs?.find(
        (log: any) =>
          log.completion_date === today && log.day_number === data?.current_day
      );
      if (todayLog?.count_completed) {
        setCount(todayLog.count_completed);
      }
    } catch (error) {
      console.error("Error loading progress:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load progress",
      });
    } finally {
      setLoading(false);
    }
  };

  const challenge = progress?.challenge;
  const target = challenge?.daily_target_count || 0;
  const today = new Date().toISOString().split("T")[0];
  const todayLog = progress?.daily_logs?.find(
    (log: any) =>
      log.completion_date === today && log.day_number === progress?.current_day
  );
  const isAlreadyCompleted = todayLog?.is_completed;

  const dailyProgress = useMemo(
    () => (target > 0 ? (count / target) * 100 : 0),
    [count, target]
  );
  const remaining = useMemo(() => Math.max(0, target - count), [target, count]);

  const handleIncrement = () => {
    if (count < target && !isAlreadyCompleted) {
      const newCount = count + 1;
      setCount(newCount);
      Vibration.vibrate(50);
    }
  };

  const handleReset = () => {
    setCount(0);
    setShowResetConfirm(false);
  };

  const handleComplete = async () => {
    if (!user || !progress) return;

    // If count is less than target, show confirmation
    if (count < target && !showCompleteConfirm) {
      setShowCompleteConfirm(true);
      return;
    }

    setShowCompleteConfirm(false);
    setCompleting(true);
    try {
      const result = await challengesApi.complete(
        progressId,
        user.id,
        progress.challenge_id,
        progress.current_day,
        count,
        target
      );

      if (result.success) {
        Toast.show({
          type: "success",
          text1: result.isChallengeCompleted
            ? "🎉 Challenge Completed!"
            : "Day Completed!",
          text2: result.isChallengeCompleted
            ? "Congratulations on completing the challenge!"
            : `Current streak: ${result.newStreak} days`,
        });
        loadProgress();
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to complete",
      });
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!progress) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={{ color: colors.foreground }}>Progress not found</Text>
      </View>
    );
  }

  const completionPercent = Math.round(
    (progress.total_completed_days / challenge.total_days) * 100
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Challenge Info */}
      <Card>
        <CardHeader>
          <View style={styles.headerRow}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Target color={colors.primary} size={24} />
            </View>
            <View style={styles.headerInfo}>
              <CardTitle>{challenge.title_bn}</CardTitle>
              {challenge.title_ar && (
                <Text
                  style={[styles.arabicText, { color: colors.mutedForeground }]}
                >
                  {challenge.title_ar}
                </Text>
              )}
            </View>
          </View>
        </CardHeader>
        <CardContent>
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text
                style={[styles.progressLabel, { color: colors.foreground }]}
              >
                Day {progress.current_day} of {challenge.total_days}
              </Text>
              <Text style={[styles.progressPercent, { color: colors.primary }]}>
                {completionPercent}%
              </Text>
            </View>
            <Progress value={completionPercent} height={12} />
          </View>

          {/* Stats - 4 in a row */}
          <View style={styles.statsRow}>
            <View
              style={[styles.statBox, { backgroundColor: colors.secondary }]}
            >
              <Flame color="#f97316" size={20} />
              <Text style={[styles.statNumber, { color: colors.foreground }]}>
                {progress.current_streak}
              </Text>
              <Text
                style={[styles.statLabel, { color: colors.mutedForeground }]}
              >
                Streak
              </Text>
            </View>
            <View
              style={[styles.statBox, { backgroundColor: colors.secondary }]}
            >
              <Trophy color="#eab308" size={20} />
              <Text style={[styles.statNumber, { color: colors.foreground }]}>
                {progress.longest_streak || 0}
              </Text>
              <Text
                style={[styles.statLabel, { color: colors.mutedForeground }]}
              >
                Best
              </Text>
            </View>
            <View
              style={[styles.statBox, { backgroundColor: colors.secondary }]}
            >
              <Check color="#22c55e" size={20} />
              <Text style={[styles.statNumber, { color: colors.foreground }]}>
                {progress.total_completed_days}
              </Text>
              <Text
                style={[styles.statLabel, { color: colors.mutedForeground }]}
              >
                Done
              </Text>
            </View>
            <View
              style={[styles.statBox, { backgroundColor: colors.secondary }]}
            >
              <X color="#ef4444" size={20} />
              <Text style={[styles.statNumber, { color: colors.foreground }]}>
                {progress.missed_days || 0}
              </Text>
              <Text
                style={[styles.statLabel, { color: colors.mutedForeground }]}
              >
                Missed
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Today's Challenge with Counter */}
      {progress.status === "active" && !isAlreadyCompleted && (
        <Card style={{ borderWidth: 2, borderColor: "#22c55e" }}>
          <CardHeader>
            <View style={styles.todayHeader}>
              <CardTitle>Today's Count</CardTitle>
              <Badge
                style={[
                  styles.countBadge,
                  {
                    backgroundColor:
                      count >= target ? "#22c55e" : colors.secondary,
                  },
                ]}
              >
                <Text
                  style={{
                    color: count >= target ? "#fff" : colors.foreground,
                    fontWeight: "600",
                  }}
                >
                  {count} / {target}
                </Text>
              </Badge>
            </View>
            <CardDescription>Complete {target} times today</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Daily Progress Bar */}
            <View style={styles.dailyProgressContainer}>
              <View
                style={[
                  styles.dailyProgressBar,
                  { backgroundColor: "#22c55e20" },
                ]}
              >
                <View
                  style={[
                    styles.dailyProgressFill,
                    {
                      backgroundColor: "#22c55e",
                      width: `${Math.min(dailyProgress, 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.remainingText,
                  { color: colors.mutedForeground },
                ]}
              >
                {remaining > 0
                  ? `${remaining} more to go!`
                  : "Target reached! 🎉"}
              </Text>
            </View>

            {/* Large Counter Display */}
            <View style={styles.counterDisplay}>
              <Text style={[styles.counterNumber, { color: "#22c55e" }]}>
                {count}
              </Text>
            </View>

            {/* Arabic Text */}
            {challenge.arabic_text && (
              <View
                style={[
                  styles.arabicContainer,
                  { backgroundColor: "#22c55e10", borderColor: "#22c55e40" },
                ]}
              >
                <Text style={[styles.arabicMain, { color: colors.foreground }]}>
                  {challenge.arabic_text}
                </Text>
              </View>
            )}
            {challenge.translation_bn && (
              <Text
                style={[styles.translation, { color: colors.mutedForeground }]}
              >
                {challenge.translation_bn}
              </Text>
            )}

            {/* Tap to Count Button */}
            <Pressable
              onPress={handleIncrement}
              disabled={count >= target}
              style={({ pressed }) => [
                styles.tapButton,
                {
                  backgroundColor:
                    count >= target ? colors.secondary : "#22c55e",
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              {count >= target ? (
                <>
                  <Check color={colors.foreground} size={28} />
                  <Text
                    style={[styles.tapButtonText, { color: colors.foreground }]}
                  >
                    Target Reached!
                  </Text>
                </>
              ) : (
                <>
                  <Target color="#fff" size={28} />
                  <Text style={styles.tapButtonText}>Tap to Count</Text>
                </>
              )}
            </Pressable>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                variant="outline"
                onPress={() => setShowResetConfirm(true)}
                disabled={count === 0}
                style={styles.actionButton}
              >
                <RefreshCcw color={colors.foreground} size={16} />
                <Text style={{ color: colors.foreground }}>Reset</Text>
              </Button>
              <Button
                onPress={handleComplete}
                loading={completing}
                disabled={completing}
                style={[styles.actionButton, { backgroundColor: "#22c55e" }]}
              >
                <Check color="#fff" size={16} />
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Complete
                </Text>
              </Button>
            </View>
          </CardContent>
        </Card>
      )}

      {/* Already Completed Today */}
      {isAlreadyCompleted && (
        <Card
          style={{
            borderWidth: 2,
            borderColor: "#22c55e",
            backgroundColor: "#22c55e10",
          }}
        >
          <CardContent style={styles.completedTodayCard}>
            <Check color="#22c55e" size={48} />
            <Text
              style={[styles.completedTodayTitle, { color: colors.foreground }]}
            >
              Day {progress.current_day} Completed!
            </Text>
            <Text
              style={[
                styles.completedTodayText,
                { color: colors.mutedForeground },
              ]}
            >
              You completed {todayLog?.count_completed || target} repetitions
              today
            </Text>
            <Badge style={{ backgroundColor: colors.secondary }}>
              <Text style={{ color: colors.foreground }}>
                Come back tomorrow for Day {progress.current_day + 1}
              </Text>
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Completed Status */}
      {progress.status === "completed" && (
        <Card>
          <CardContent style={styles.completedCard}>
            <Trophy color="#eab308" size={48} />
            <Text style={[styles.completedTitle, { color: colors.foreground }]}>
              Challenge Completed! 🎉
            </Text>
            <Text
              style={[styles.completedText, { color: colors.mutedForeground }]}
            >
              Congratulations on completing this challenge!
            </Text>
            <Button
              onPress={() => navigation.navigate(ROUTES.CHALLENGES)}
              style={{ marginTop: 16 }}
            >
              <Text style={{ color: colors.primaryForeground }}>
                Back to Challenges
              </Text>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        visible={showResetConfirm}
        title="Reset Counter?"
        description="Are you sure you want to reset the counter? This action cannot be undone."
        confirmText="Reset"
        confirmVariant="destructive"
        icon="warning"
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
      />

      {/* Complete Confirmation Modal (when not at target) */}
      <ConfirmationModal
        visible={showCompleteConfirm}
        title="Target Not Reached"
        description={`You haven't reached the target count of ${target} yet. Do you want to complete anyway?`}
        confirmText="Complete Anyway"
        confirmVariant="default"
        icon="warning"
        onCancel={() => setShowCompleteConfirm(false)}
        onConfirm={handleComplete}
        isLoading={completing}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
  },
  arabicText: {
    fontSize: 14,
    marginTop: 4,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  progressPercent: {
    fontSize: 15,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statBox: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
  },
  todayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dailyProgressContainer: {
    marginBottom: 16,
  },
  dailyProgressBar: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  dailyProgressFill: {
    height: "100%",
    borderRadius: 5,
  },
  remainingText: {
    textAlign: "center",
    fontSize: 13,
    marginTop: 8,
  },
  counterDisplay: {
    alignItems: "center",
    marginVertical: 16,
  },
  counterNumber: {
    fontSize: 80,
    fontWeight: "700",
  },
  arabicContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
  },
  arabicMain: {
    fontSize: 24,
    lineHeight: 40,
    textAlign: "center",
  },
  translation: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 20,
  },
  tapButton: {
    height: 80,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  tapButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  completedTodayCard: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  completedTodayTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  completedTodayText: {
    fontSize: 14,
    textAlign: "center",
  },
  completedCard: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  completedText: {
    fontSize: 14,
    textAlign: "center",
  },
});
