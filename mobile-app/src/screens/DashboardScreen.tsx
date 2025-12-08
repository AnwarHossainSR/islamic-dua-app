import { useNavigation } from '@react-navigation/native';
import { Activity, Flame, Target, TrendingUp, Trophy, User, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dashboardApi } from '@/api/dashboard.api';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Loader,
} from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { formatNumber } from '@/lib/utils';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [showGlobalStats, setShowGlobalStats] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [topActivities, setTopActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) loadData(false);
  }, [user]);

  const loadData = async (showGlobal: boolean, isRefresh = false) => {
    if (!user) return;
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const [statsData, activitiesData] = await Promise.all([
        showGlobal ? dashboardApi.getGlobalStats() : dashboardApi.getUserStats(user.id),
        showGlobal
          ? dashboardApi.getGlobalTopActivities(5)
          : dashboardApi.getUserTopActivities(user.id, 5),
      ]);
      setStats(statsData);
      setTopActivities(activitiesData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggle = (showGlobal: boolean) => {
    setShowGlobalStats(showGlobal);
    loadData(showGlobal);
  };

  if (!stats && loading) {
    return <Loader fullScreen />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(showGlobalStats, true)}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={[styles.title, { color: colors.foreground }]}>Your Dashboard</Text>
            {/* Toggle */}
            <View style={styles.toggleContainer}>
              <User color={colors.mutedForeground} size={16} />
              <Pressable
                style={[
                  styles.switchTrack,
                  {
                    backgroundColor: showGlobalStats ? colors.primary : colors.muted,
                  },
                ]}
                onPress={() => handleToggle(!showGlobalStats)}
              >
                <View
                  style={[
                    styles.switchThumb,
                    {
                      backgroundColor: colors.background,
                      transform: [{ translateX: showGlobalStats ? 18 : 2 }],
                    },
                  ]}
                />
              </Pressable>
              <Users color={colors.mutedForeground} size={16} />
            </View>
          </View>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {showGlobalStats ? 'Global statistics' : 'Track your spiritual journey'}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <CardHeader style={styles.statHeader}>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  {showGlobalStats ? 'Total Activities' : 'Your Activities'}
                </Text>
                <Activity color={colors.mutedForeground} size={16} />
              </View>
            </CardHeader>
            <CardContent>
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {stats?.totalActivities || 0}
              </Text>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardHeader style={styles.statHeader}>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  {showGlobalStats ? 'Total Completions' : 'Your Completions'}
                </Text>
                <Trophy color={colors.mutedForeground} size={16} />
              </View>
            </CardHeader>
            <CardContent>
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {formatNumber(stats?.totalCompletions || 0)}
              </Text>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardHeader style={styles.statHeader}>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  {showGlobalStats ? 'Active Users' : 'Streak Days'}
                </Text>
                <Flame color={colors.mutedForeground} size={16} />
              </View>
            </CardHeader>
            <CardContent>
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {stats?.totalActiveUsers || 0}
              </Text>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardHeader style={styles.statHeader}>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  {showGlobalStats ? 'Active Challenges' : 'Your Challenges'}
                </Text>
                <Target color={colors.mutedForeground} size={16} />
              </View>
            </CardHeader>
            <CardContent>
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {stats?.activeChallenges || 0}
              </Text>
            </CardContent>
          </Card>
        </View>

        {/* Top Activities */}
        <Card>
          <CardHeader>
            <View style={styles.cardHeaderRow}>
              <View>
                <CardTitle>{showGlobalStats ? 'Top Activities' : 'Your Top Activities'}</CardTitle>
                <CardDescription>
                  {showGlobalStats ? 'Most completed dhikr and prayers' : 'Your most practiced'}
                </CardDescription>
              </View>
              <Button
                variant="outline"
                size="sm"
                onPress={() => navigation.navigate(ROUTES.ACTIVITIES)}
              >
                View All
              </Button>
            </View>
          </CardHeader>
          <CardContent>
            {topActivities.map((activity: any, index: number) => (
              <View
                key={activity.id}
                style={[
                  styles.activityRow,
                  index < topActivities.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.activityLeft}>
                  <Badge variant="outline">#{index + 1}</Badge>
                  <View style={styles.activityInfo}>
                    <Text
                      style={[styles.activityName, { color: colors.foreground }]}
                      numberOfLines={1}
                    >
                      {activity.name_bn}
                    </Text>
                    <Text
                      style={[styles.activitySubtitle, { color: colors.mutedForeground }]}
                      numberOfLines={1}
                    >
                      {activity.name_ar || activity.name_en}
                    </Text>
                  </View>
                </View>
                <View style={styles.activityRight}>
                  <Text style={[styles.activityCount, { color: colors.foreground }]}>
                    {formatNumber(activity.total_count)}
                  </Text>
                  <Badge variant="secondary">
                    <Users color={colors.foreground} size={12} />
                    <Text
                      style={{
                        color: colors.foreground,
                        fontSize: 11,
                        marginLeft: 4,
                      }}
                    >
                      {activity.total_users}
                    </Text>
                  </Badge>
                </View>
              </View>
            ))}

            {topActivities.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No activity data yet. Start challenges to see statistics.
              </Text>
            )}
          </CardContent>
        </Card>

        {/* Today's Progress and This Week */}
        <View style={styles.progressGrid}>
          <Card style={styles.progressCard}>
            <CardHeader>
              <View style={styles.progressHeader}>
                <Flame color="#f97316" size={20} />
                <CardTitle style={styles.progressTitle}>
                  {showGlobalStats ? "Today's Activity" : "Today's Progress"}
                </CardTitle>
              </View>
              <CardDescription>
                {showGlobalStats ? 'Completions in the last 24 hours' : 'Your completions today'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Text style={[styles.progressValue, { color: colors.foreground }]}>
                {formatNumber(stats?.todayCompletions || 0)}
              </Text>
              {stats?.todayCompletions > (stats?.yesterdayCompletions || 0) ? (
                <View style={styles.trendRow}>
                  <TrendingUp color="#10b981" size={14} />
                  <Text style={[styles.trendText, { color: '#10b981' }]}>
                    {(
                      ((stats.todayCompletions - (stats.yesterdayCompletions || 0)) /
                        Math.max(stats.yesterdayCompletions || 1, 1)) *
                      100
                    ).toFixed(0)}
                    % increase from yesterday
                  </Text>
                </View>
              ) : (
                <Text style={[styles.progressSubtext, { color: colors.mutedForeground }]}>
                  Keep up the good work!
                </Text>
              )}
            </CardContent>
          </Card>

          <Card style={styles.progressCard}>
            <CardHeader>
              <View style={styles.progressHeader}>
                <Trophy color="#f59e0b" size={20} />
                <CardTitle style={styles.progressTitle}>This Week</CardTitle>
              </View>
              <CardDescription>
                {showGlobalStats ? 'Completions in the last 7 days' : 'Your weekly progress'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Text style={[styles.progressValue, { color: colors.foreground }]}>
                {formatNumber(stats?.weekCompletions || 0)}
              </Text>
              <Text style={[styles.progressSubtext, { color: colors.mutedForeground }]}>
                Average {Math.round((stats?.weekCompletions || 0) / 7)} per day
              </Text>
            </CardContent>
          </Card>
        </View>

        {/* Quick Actions */}
        <Card style={styles.quickActions}>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your spiritual journey</CardDescription>
          </CardHeader>
          <CardContent>
            <View style={styles.actionsGrid}>
              <Button
                onPress={() => navigation.navigate(ROUTES.CHALLENGES)}
                style={styles.actionBtn}
              >
                <View style={styles.actionContent}>
                  <Target color={colors.primaryForeground} size={24} />
                  <Text style={[styles.actionText, { color: colors.primaryForeground }]}>
                    Join Challenges
                  </Text>
                </View>
              </Button>
              <Button
                variant="outline"
                onPress={() => navigation.navigate(ROUTES.ACTIVITIES)}
                style={styles.actionBtn}
              >
                <View style={styles.actionContent}>
                  <Activity color={colors.foreground} size={24} />
                  <Text style={[styles.actionText, { color: colors.foreground }]}>
                    View Activities
                  </Text>
                </View>
              </Button>
              <Button
                variant="outline"
                onPress={() => navigation.navigate(ROUTES.DUAS)}
                style={styles.actionBtn}
              >
                <View style={styles.actionContent}>
                  <TrendingUp color={colors.foreground} size={24} />
                  <Text style={[styles.actionText, { color: colors.foreground }]}>Browse Duas</Text>
                </View>
              </Button>
            </View>
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
    gap: 20,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  toggle: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 8,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  switchTrack: {
    width: 40,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
  },
  statHeader: {
    paddingBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '500',
  },
  activitySubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  activityRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  activityCount: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 24,
    fontSize: 14,
  },
  quickActions: {
    marginTop: 4,
  },
  actionsGrid: {
    gap: 12,
  },
  actionBtn: {
    height: 60,
  },
  actionContent: {
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressGrid: {
    gap: 12,
  },
  progressCard: {
    flex: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  progressTitle: {
    fontSize: 16,
  },
  progressValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  progressSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
  },
});
