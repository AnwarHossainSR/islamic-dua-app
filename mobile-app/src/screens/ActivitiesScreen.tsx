import { activitiesApi } from "@/api/activities.api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Loader,
} from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { formatNumber } from "@/lib/utils";
import { useNavigation } from "@react-navigation/native";
import { Activity, Flame, Trophy } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ActivitiesScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async (isRefresh = false) => {
    if (!user) return;
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const [activitiesData, statsData] = await Promise.all([
        activitiesApi.getUserActivities(user.id),
        activitiesApi.getUserChallengeStats(user.id),
      ]);
      setActivities(activitiesData || []);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
            onRefresh={() => loadData(true)}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Activities
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Your spiritual activities and progress
          </Text>
        </View>

        {/* Stats Overview */}
        {stats && (
          <View style={styles.statsRow}>
            <Card style={styles.miniStat}>
              <View style={styles.miniStatContent}>
                <Trophy color="#eab308" size={20} />
                <Text
                  style={[styles.miniStatValue, { color: colors.foreground }]}
                >
                  {stats.totalCompleted}
                </Text>
                <Text
                  style={[
                    styles.miniStatLabel,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Completed
                </Text>
              </View>
            </Card>
            <Card style={styles.miniStat}>
              <View style={styles.miniStatContent}>
                <Activity color={colors.primary} size={20} />
                <Text
                  style={[styles.miniStatValue, { color: colors.foreground }]}
                >
                  {stats.totalActive}
                </Text>
                <Text
                  style={[
                    styles.miniStatLabel,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Active
                </Text>
              </View>
            </Card>
            <Card style={styles.miniStat}>
              <View style={styles.miniStatContent}>
                <Flame color="#f97316" size={20} />
                <Text
                  style={[styles.miniStatValue, { color: colors.foreground }]}
                >
                  {stats.longestStreak}
                </Text>
                <Text
                  style={[
                    styles.miniStatLabel,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Best Streak
                </Text>
              </View>
            </Card>
          </View>
        )}

        {/* Activities List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.map((item: any, index: number) => (
              <Pressable
                key={item.id}
                onPress={() =>
                  navigation.navigate(ROUTES.ACTIVITY_DETAIL, {
                    activityId: item.activity?.id,
                  })
                }
                style={[
                  styles.activityRow,
                  index < activities.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.activityLeft}>
                  <View
                    style={[
                      styles.activityIcon,
                      { backgroundColor: colors.primary + "20" },
                    ]}
                  >
                    <Activity color={colors.primary} size={18} />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text
                      style={[
                        styles.activityName,
                        { color: colors.foreground },
                      ]}
                      numberOfLines={1}
                    >
                      {item.activity?.name_bn}
                    </Text>
                    <Text
                      style={[
                        styles.activityArabic,
                        { color: colors.mutedForeground },
                      ]}
                      numberOfLines={1}
                    >
                      {item.activity?.name_ar}
                    </Text>
                  </View>
                </View>
                <View style={styles.activityRight}>
                  <Text
                    style={[styles.activityCount, { color: colors.foreground }]}
                  >
                    {formatNumber(item.total_completed)}
                  </Text>
                  <View style={styles.streakRow}>
                    <Flame color="#f97316" size={12} />
                    <Text
                      style={[
                        styles.streakText,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {item.current_streak}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}

            {activities.length === 0 && (
              <View style={styles.emptyState}>
                <Activity color={colors.mutedForeground} size={48} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  No Activities Yet
                </Text>
                <Text
                  style={[styles.emptyText, { color: colors.mutedForeground }]}
                >
                  Start a challenge to begin tracking your activities.
                </Text>
              </View>
            )}
          </CardContent>
        </Card>
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
    gap: 16,
  },
  header: {
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  miniStat: {
    flex: 1,
  },
  miniStatContent: {
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  miniStatValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  miniStatLabel: {
    fontSize: 11,
    textAlign: "center",
  },
  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 14,
    fontWeight: "500",
  },
  activityArabic: {
    fontSize: 12,
    marginTop: 2,
  },
  activityRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  activityCount: {
    fontSize: 18,
    fontWeight: "700",
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
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
