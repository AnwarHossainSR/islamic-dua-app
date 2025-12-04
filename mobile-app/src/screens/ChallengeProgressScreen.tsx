import { challengesApi } from "@/api/challenges.api";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Loader,
  Progress,
} from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useRoute } from "@react-navigation/native";
import { Check, Flame, Target, Trophy, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

export default function ChallengeProgressScreen() {
  const route = useRoute<any>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const { progressId } = route.params || {};

  useEffect(() => {
    if (progressId) loadProgress();
  }, [progressId]);

  const loadProgress = async () => {
    try {
      const data = await challengesApi.getProgress(progressId);
      setProgress(data);
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

  const handleComplete = async () => {
    if (!user || !progress) return;
    setCompleting(true);
    try {
      const result = await challengesApi.complete(
        progressId,
        user.id,
        progress.challenge_id,
        progress.current_day,
        progress.challenge.daily_target_count,
        progress.challenge.daily_target_count
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

  const challenge = progress.challenge;
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

          {/* Stats */}
          <View style={styles.statsGrid}>
            <View
              style={[styles.statBox, { backgroundColor: colors.secondary }]}
            >
              <Flame color="#f97316" size={24} />
              <Text style={[styles.statNumber, { color: colors.foreground }]}>
                {progress.current_streak}
              </Text>
              <Text
                style={[styles.statLabel, { color: colors.mutedForeground }]}
              >
                Current Streak
              </Text>
            </View>
            <View
              style={[styles.statBox, { backgroundColor: colors.secondary }]}
            >
              <Trophy color="#eab308" size={24} />
              <Text style={[styles.statNumber, { color: colors.foreground }]}>
                {progress.longest_streak || 0}
              </Text>
              <Text
                style={[styles.statLabel, { color: colors.mutedForeground }]}
              >
                Longest Streak
              </Text>
            </View>
            <View
              style={[styles.statBox, { backgroundColor: colors.secondary }]}
            >
              <Check color="#22c55e" size={24} />
              <Text style={[styles.statNumber, { color: colors.foreground }]}>
                {progress.total_completed_days}
              </Text>
              <Text
                style={[styles.statLabel, { color: colors.mutedForeground }]}
              >
                Days Done
              </Text>
            </View>
            <View
              style={[styles.statBox, { backgroundColor: colors.secondary }]}
            >
              <X color="#ef4444" size={24} />
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

      {/* Today's Challenge */}
      {progress.status === "active" && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Challenge</CardTitle>
            <CardDescription>
              Complete {challenge.daily_target_count} times today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {challenge.arabic_text && (
              <View
                style={[
                  styles.arabicContainer,
                  { backgroundColor: colors.secondary },
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

            <Button
              onPress={handleComplete}
              loading={completing}
              style={styles.completeButton}
            >
              <Check color={colors.primaryForeground} size={20} />
              <Text
                style={{
                  color: colors.primaryForeground,
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                Mark Complete for Today
              </Text>
            </Button>
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
          </CardContent>
        </Card>
      )}
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statBox: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
  },
  arabicContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  arabicMain: {
    fontSize: 24,
    lineHeight: 40,
    textAlign: "center",
    fontFamily: "System",
  },
  translation: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 20,
  },
  completeButton: {
    flexDirection: "row",
    gap: 8,
    height: 50,
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
