import { useRoute } from '@react-navigation/native';
import { Activity, Trophy, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { activitiesApi } from '@/api/activities.api';
import { Card, CardContent, CardHeader, CardTitle, Loader } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { formatNumber } from '@/lib/utils';

export default function ActivityDetailScreen() {
  const route = useRoute<any>();
  const { colors } = useTheme();
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { activityId } = route.params || {};

  useEffect(() => {
    if (activityId) loadActivity();
  }, [activityId]);

  const loadActivity = async () => {
    try {
      const data = await activitiesApi.getActivityById(activityId);
      setActivity(data);
    } catch (error) {
      console.error('Error loading activity:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!activity) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Activity not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card>
        <CardHeader>
          <View style={styles.headerRow}>
            <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
              <Activity color={colors.primary} size={28} />
            </View>
            <View style={styles.headerInfo}>
              <CardTitle>{activity.name_bn}</CardTitle>
              {activity.name_ar && (
                <Text style={[styles.arabicName, { color: colors.mutedForeground }]}>
                  {activity.name_ar}
                </Text>
              )}
              {activity.name_en && (
                <Text style={[styles.englishName, { color: colors.mutedForeground }]}>
                  {activity.name_en}
                </Text>
              )}
            </View>
          </View>
        </CardHeader>
        <CardContent>
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: colors.secondary }]}>
              <Trophy color="#eab308" size={24} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {formatNumber(activity.total_count || 0)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                Total Completions
              </Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.secondary }]}>
              <Users color={colors.primary} size={24} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {formatNumber(activity.total_users || 0)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                Participants
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  arabicName: {
    fontSize: 16,
    marginTop: 4,
  },
  englishName: {
    fontSize: 14,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});
