import { challengesApi } from "@/api/challenges.api";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Loader,
  Pagination,
  Progress,
} from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useNavigation } from "@react-navigation/native";
import {
  Check,
  CheckCircle,
  Clock,
  Play,
  Search,
  Target,
  TrendingUp,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

function isCurrentDay(timestamp: number | string | null): boolean {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function formatLastCompleted(timestamp: number | string | null): string {
  if (!timestamp) return "Not started";
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return `Today at ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

export default function ChallengesScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [completionFilter, setCompletionFilter] = useState("pending"); // all, pending, completed
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadChallenges();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, completionFilter]);

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

  // Calculate stats
  const stats = useMemo(() => {
    const total = challenges.length;
    const todayCompleted = challenges.filter((c) =>
      isCurrentDay(c.last_completed_at)
    ).length;
    const todayRemaining = total - todayCompleted;
    const todayPercentage =
      total > 0 ? Math.round((todayCompleted / total) * 100) : 0;
    return { total, todayCompleted, todayRemaining, todayPercentage };
  }, [challenges]);

  // Filter challenges
  const filteredChallenges = useMemo(() => {
    let filtered = [...challenges];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.title_bn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.title_ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description_bn?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Completion filter
    if (completionFilter === "completed") {
      filtered = filtered.filter((c) => isCurrentDay(c.last_completed_at));
    } else if (completionFilter === "pending") {
      filtered = filtered.filter((c) => !isCurrentDay(c.last_completed_at));
    }

    return filtered;
  }, [challenges, searchQuery, completionFilter]);

  // Paginated challenges
  const paginatedChallenges = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredChallenges.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredChallenges, currentPage, itemsPerPage]);

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Challenges
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Join spiritual challenges to strengthen your practice
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <CardContent style={styles.statCardContent}>
              <View style={styles.statRow}>
                <View>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    Total
                  </Text>
                  <Text
                    style={[styles.statValue, { color: colors.foreground }]}
                  >
                    {stats.total}
                  </Text>
                </View>
                <Target color="#10b981" size={24} />
              </View>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent style={styles.statCardContent}>
              <View style={styles.statRow}>
                <View>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    Done Today
                  </Text>
                  <Text
                    style={[styles.statValue, { color: colors.foreground }]}
                  >
                    {stats.todayCompleted}
                  </Text>
                </View>
                <Check color="#10b981" size={24} />
              </View>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent style={styles.statCardContent}>
              <View style={styles.statRow}>
                <View>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    Remaining
                  </Text>
                  <Text
                    style={[styles.statValue, { color: colors.foreground }]}
                  >
                    {stats.todayRemaining}
                  </Text>
                </View>
                <Clock color="#f59e0b" size={24} />
              </View>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent style={styles.statCardContent}>
              <View style={styles.statRow}>
                <View>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    Progress
                  </Text>
                  <Text
                    style={[styles.statValue, { color: colors.foreground }]}
                  >
                    {stats.todayPercentage}%
                  </Text>
                </View>
                <TrendingUp color="#8b5cf6" size={24} />
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.secondary },
          ]}
        >
          <Search color={colors.mutedForeground} size={18} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search challenges..."
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <Pressable
            style={[
              styles.filterTab,
              completionFilter === "all" && {
                backgroundColor: colors.primary,
              },
              completionFilter !== "all" && {
                backgroundColor: colors.secondary,
              },
            ]}
            onPress={() => setCompletionFilter("all")}
          >
            <Text
              style={[
                styles.filterTabText,
                {
                  color:
                    completionFilter === "all"
                      ? colors.primaryForeground
                      : colors.foreground,
                },
              ]}
            >
              All ({challenges.length})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterTab,
              completionFilter === "pending" && {
                backgroundColor: colors.primary,
              },
              completionFilter !== "pending" && {
                backgroundColor: colors.secondary,
              },
            ]}
            onPress={() => setCompletionFilter("pending")}
          >
            <Text
              style={[
                styles.filterTabText,
                {
                  color:
                    completionFilter === "pending"
                      ? colors.primaryForeground
                      : colors.foreground,
                },
              ]}
            >
              Pending ({stats.todayRemaining})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterTab,
              completionFilter === "completed" && {
                backgroundColor: colors.primary,
              },
              completionFilter !== "completed" && {
                backgroundColor: colors.secondary,
              },
            ]}
            onPress={() => setCompletionFilter("completed")}
          >
            <Text
              style={[
                styles.filterTabText,
                {
                  color:
                    completionFilter === "completed"
                      ? colors.primaryForeground
                      : colors.foreground,
                },
              ]}
            >
              Done ({stats.todayCompleted})
            </Text>
          </Pressable>
        </View>

        {/* Results Count */}
        <Text style={[styles.resultsCount, { color: colors.mutedForeground }]}>
          {filteredChallenges.length} challenges found
        </Text>

        {/* Challenges List */}
        <View style={styles.challengesList}>
          {paginatedChallenges.map((challenge) => (
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
                      <Text style={styles.challengeIcon}>
                        {challenge.icon || "📿"}
                      </Text>
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
                  <View style={styles.badgeColumn}>
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
                      textStyle={{
                        color: getStatusColor(challenge.user_status),
                      }}
                    >
                      {getStatusLabel(challenge.user_status)}
                    </Badge>
                    {challenge.last_completed_at && (
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: isCurrentDay(
                            challenge.last_completed_at
                          )
                            ? "#22c55e20"
                            : colors.secondary,
                        }}
                        textStyle={{
                          color: isCurrentDay(challenge.last_completed_at)
                            ? "#22c55e"
                            : colors.mutedForeground,
                        }}
                      >
                        {formatLastCompleted(challenge.last_completed_at)}
                      </Badge>
                    )}
                  </View>
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

                <View style={styles.challengeStatsRow}>
                  <View style={styles.challengeStat}>
                    <Text
                      style={[
                        styles.challengeStatValue,
                        { color: colors.foreground },
                      ]}
                    >
                      {challenge.daily_target_count}
                    </Text>
                    <Text
                      style={[
                        styles.challengeStatLabel,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      Daily
                    </Text>
                  </View>
                  <View style={styles.challengeStat}>
                    <Text
                      style={[
                        styles.challengeStatValue,
                        { color: colors.foreground },
                      ]}
                    >
                      {challenge.total_days}
                    </Text>
                    <Text
                      style={[
                        styles.challengeStatLabel,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      Days
                    </Text>
                  </View>
                  <View style={styles.challengeStat}>
                    <Text
                      style={[
                        styles.challengeStatValue,
                        { color: colors.foreground },
                      ]}
                    >
                      {challenge.total_participants || 0}
                    </Text>
                    <Text
                      style={[
                        styles.challengeStatLabel,
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

          {filteredChallenges.length === 0 && (
            <View style={styles.emptyState}>
              <Target color={colors.mutedForeground} size={48} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                No Challenges Found
              </Text>
              <Text
                style={[styles.emptyText, { color: colors.mutedForeground }]}
              >
                {searchQuery
                  ? "Try a different search term"
                  : "Check back later for new challenges"}
              </Text>
            </View>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredChallenges.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            showInfo={true}
          />
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
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: "48%",
    flexGrow: 1,
  },
  statCardContent: {
    paddingVertical: 12,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  filterTabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: "600",
  },
  resultsCount: {
    fontSize: 13,
    marginBottom: 12,
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
  challengeIcon: {
    fontSize: 20,
  },
  titleContainer: {
    flex: 1,
  },
  badgeColumn: {
    gap: 4,
    alignItems: "flex-end",
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
  challengeStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    marginBottom: 12,
  },
  challengeStat: {
    alignItems: "center",
  },
  challengeStatValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  challengeStatLabel: {
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
