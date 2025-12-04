import { challengesApi } from "@/api/challenges.api";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Loader,
  Progress,
} from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useNavigation } from "@react-navigation/native";
import { CheckCircle, Play, Target } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function ChallengesScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await challengesApi.getAll();
      setChallenges(data);
    } catch (error) {
      console.error("Error loading challenges:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load challenges",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStartChallenge = async (challengeId: string) => {
    if (!user) return;
    try {
      const { error } = await challengesApi.start(user.id, challengeId);
      if (error) throw error;
      Toast.show({
        type: "success",
        text1: "Challenge Started!",
        text2: "Good luck on your journey.",
      });
      loadChallenges();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to start challenge",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return colors.primary;
      case "completed":
        return "#22c55e";
      case "paused":
        return "#f59e0b";
      default:
        return colors.mutedForeground;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "completed":
        return "Completed";
      case "paused":
        return "Paused";
      default:
        return "Not Started";
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadChallenges(true)}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Challenges
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Join spiritual challenges to strengthen your practice
          </Text>
        </View>

        <View style={styles.challengesList}>
          {challenges.map((challenge) => (
            <Card key={challenge.id} style={styles.challengeCard}>
              <CardHeader>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardTitleRow}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: colors.primary + "20" },
                      ]}
                    >
                      <Target color={colors.primary} size={20} />
                    </View>
                    <View style={styles.titleContainer}>
                      <CardTitle>{challenge.title_bn}</CardTitle>
                      {challenge.title_ar && (
                        <Text
                          style={[
                            styles.arabicTitle,
                            { color: colors.mutedForeground },
                          ]}
                        >
                          {challenge.title_ar}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Badge
                    variant={
                      challenge.user_status === "active"
                        ? "default"
                        : "secondary"
                    }
                    style={{
                      backgroundColor:
                        getStatusColor(challenge.user_status) + "20",
                    }}
                    textStyle={{ color: getStatusColor(challenge.user_status) }}
                  >
                    {getStatusLabel(challenge.user_status)}
                  </Badge>
                </View>
              </CardHeader>

              <CardContent>
                {challenge.description_bn && (
                  <Text
                    style={[
                      styles.description,
                      { color: colors.mutedForeground },
                    ]}
                    numberOfLines={2}
                  >
                    {challenge.description_bn}
                  </Text>
                )}

                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text
                      style={[styles.statValue, { color: colors.foreground }]}
                    >
                      {challenge.daily_target_count}
                    </Text>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      Daily
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Text
                      style={[styles.statValue, { color: colors.foreground }]}
                    >
                      {challenge.total_days}
                    </Text>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      Days
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Text
                      style={[styles.statValue, { color: colors.foreground }]}
                    >
                      {challenge.total_participants || 0}
                    </Text>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      Joined
                    </Text>
                  </View>
                </View>

                {challenge.user_status !== "not_started" && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                      <Text
                        style={[
                          styles.progressLabel,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        Day {challenge.current_day} of {challenge.total_days}
                      </Text>
                      <Text
                        style={[
                          styles.progressPercent,
                          { color: colors.primary },
                        ]}
                      >
                        {challenge.completion_percentage}%
                      </Text>
                    </View>
                    <Progress value={challenge.completion_percentage} />
                  </View>
                )}

                <View style={styles.actionRow}>
                  {challenge.user_status === "not_started" ? (
                    <Button
                      onPress={() => handleStartChallenge(challenge.id)}
                      style={styles.actionButton}
                    >
                      <Play color={colors.primaryForeground} size={16} />
                      <Text
                        style={{
                          color: colors.primaryForeground,
                          fontWeight: "500",
                        }}
                      >
                        Start Challenge
                      </Text>
                    </Button>
                  ) : challenge.user_status === "active" ? (
                    <Button
                      onPress={() =>
                        navigation.navigate(ROUTES.CHALLENGE_PROGRESS, {
                          progressId: challenge.progress_id,
                        })
                      }
                      style={styles.actionButton}
                    >
                      <Target color={colors.primaryForeground} size={16} />
                      <Text
                        style={{
                          color: colors.primaryForeground,
                          fontWeight: "500",
                        }}
                      >
                        Continue
                      </Text>
                    </Button>
                  ) : challenge.user_status === "completed" ? (
                    <Button
                      variant="outline"
                      onPress={() =>
                        navigation.navigate(ROUTES.CHALLENGE_PROGRESS, {
                          progressId: challenge.progress_id,
                        })
                      }
                      style={styles.actionButton}
                    >
                      <CheckCircle color={colors.foreground} size={16} />
                      <Text
                        style={{ color: colors.foreground, fontWeight: "500" }}
                      >
                        View Progress
                      </Text>
                    </Button>
                  ) : null}
                </View>
              </CardContent>
            </Card>
          ))}

          {challenges.length === 0 && (
            <View style={styles.emptyState}>
              <Target color={colors.mutedForeground} size={48} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                No Challenges Available
              </Text>
              <Text
                style={[styles.emptyText, { color: colors.mutedForeground }]}
              >
                Check back later for new spiritual challenges.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  challengesList: {
    gap: 16,
  },
  challengeCard: {},
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
  },
  arabicTitle: {
    fontSize: 14,
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    marginBottom: 12,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: "600",
  },
  actionRow: {
    marginTop: 4,
  },
  actionButton: {
    flexDirection: "row",
    gap: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
});
