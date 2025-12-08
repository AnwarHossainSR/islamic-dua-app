import { useNavigation, useRoute } from '@react-navigation/native';
import { BookOpen, Calendar, Clock, Play, Star, Target, Trophy, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { challengesApi } from '@/api/challenges.api';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Loader } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

export default function ChallengePreviewScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveChallenge, setHasActiveChallenge] = useState(false);
  const [activeProgressId, setActiveProgressId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const { challengeId } = route.params || {};

  useEffect(() => {
    if (challengeId) loadChallenge();
  }, [challengeId]);

  const loadChallenge = async () => {
    try {
      const data = await challengesApi.getById(challengeId);
      setChallenge(data);

      if (user) {
        const { data: existing } = await challengesApi.checkActiveProgress(user.id, challengeId);
        if (existing) {
          setHasActiveChallenge(true);
          setActiveProgressId(existing.id);
        }
      }
    } catch (error) {
      console.error('Error loading challenge:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load challenge',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = async () => {
    if (!user || !challengeId) return;

    setStarting(true);
    try {
      const result = await challengesApi.start(user.id, challengeId);
      if (result.data) {
        Toast.show({
          type: 'success',
          text1: 'Challenge Started!',
          text2: 'Good luck on your journey.',
        });
        navigation.navigate(ROUTES.CHALLENGE_PROGRESS, {
          progressId: result.data.id,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to start challenge',
      });
    } finally {
      setStarting(false);
    }
  };

  const handleContinue = () => {
    if (activeProgressId) {
      navigation.navigate(ROUTES.CHALLENGE_PROGRESS, {
        progressId: activeProgressId,
      });
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!challenge) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ color: colors.foreground }}>Challenge not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const timeLabel =
    challenge.recommended_time
      ?.replace(/_/g, ' ')
      .replace(/\b\w/g, (l: string) => l.toUpperCase()) || '';
  const prayerLabel =
    (challenge.recommended_prayer?.charAt(0).toUpperCase() || '') +
    (challenge.recommended_prayer?.slice(1) || '');

  const getDifficultyColor = () => {
    switch (challenge.difficulty_level) {
      case 'easy':
        return '#22c55e';
      case 'hard':
        return '#ef4444';
      default:
        return colors.primary;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Challenge Info */}
        <View style={styles.header}>
          <Text style={styles.icon}>{challenge.icon || '📿'}</Text>
          <View style={styles.headerContent}>
            <View style={styles.titleInfo}>
              <Text style={[styles.title, { color: colors.foreground }]}>{challenge.title_bn}</Text>
              {challenge.title_ar && (
                <Text style={[styles.arabicTitle, { color: colors.mutedForeground }]}>
                  {challenge.title_ar}
                </Text>
              )}
            </View>
            <Badge style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() }]}>
              <Text style={styles.badgeText}>
                {challenge.difficulty_level?.toUpperCase() || 'MEDIUM'}
              </Text>
            </Badge>
          </View>
        </View>

        {/* Stats - 4 cards in row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Target color="#22c55e" size={20} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {challenge.daily_target_count}x
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Per Day</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Calendar color="#3b82f6" size={20} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {challenge.total_days}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Days</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Users color="#8b5cf6" size={20} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {challenge.total_participants || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Joined</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Trophy color="#f59e0b" size={20} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {challenge.total_completions || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Done</Text>
          </View>
        </View>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>About This Challenge</CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={[styles.description, { color: colors.foreground }]}>
              {challenge.description_bn}
            </Text>
            {(challenge.recommended_time || challenge.recommended_prayer) && (
              <View style={[styles.recommendations, { backgroundColor: colors.secondary }]}>
                {challenge.recommended_time && (
                  <View style={styles.recommendItem}>
                    <Clock color={colors.mutedForeground} size={16} />
                    <Text style={[styles.recommendText, { color: colors.foreground }]}>
                      {timeLabel}
                    </Text>
                  </View>
                )}
                {challenge.recommended_prayer && (
                  <View style={styles.recommendItem}>
                    <Text style={{ fontSize: 16 }}>🕌</Text>
                    <Text style={[styles.recommendText, { color: colors.foreground }]}>
                      After {prayerLabel} Prayer
                    </Text>
                  </View>
                )}
              </View>
            )}
          </CardContent>
        </Card>

        {/* The Dhikr */}
        <Card>
          <CardHeader>
            <CardTitle>The Dhikr</CardTitle>
          </CardHeader>
          <CardContent style={styles.dhikrContent}>
            {challenge.arabic_text && (
              <View
                style={[
                  styles.arabicBox,
                  { borderColor: '#22c55e40', backgroundColor: '#22c55e10' },
                ]}
              >
                <Text style={[styles.arabicText, { color: colors.foreground }]}>
                  {challenge.arabic_text}
                </Text>
              </View>
            )}
            {challenge.transliteration_bn && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                  Transliteration
                </Text>
                <Text style={[styles.sectionText, { color: colors.foreground }]}>
                  {challenge.transliteration_bn}
                </Text>
              </View>
            )}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                Translation
              </Text>
              <Text style={[styles.sectionText, { color: colors.foreground }]}>
                {challenge.translation_bn}
              </Text>
            </View>
            {challenge.reference && (
              <View style={[styles.referenceBox, { backgroundColor: colors.secondary }]}>
                <BookOpen color={colors.mutedForeground} size={16} />
                <View>
                  <Text style={[styles.referenceLabel, { color: colors.foreground }]}>
                    Reference
                  </Text>
                  <Text style={[styles.referenceText, { color: colors.mutedForeground }]}>
                    {challenge.reference}
                  </Text>
                </View>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Fazilat (Benefits) */}
        {challenge.fazilat_bn && (
          <Card>
            <CardHeader>
              <View style={styles.fazilatHeader}>
                <Star color="#f59e0b" size={20} />
                <CardTitle>Fazilat (Benefits)</CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              <Text style={[styles.description, { color: colors.foreground }]}>
                {challenge.fazilat_bn}
              </Text>
            </CardContent>
          </Card>
        )}

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.steps}>
              {[
                `Start the challenge and read this dhikr ${challenge.daily_target_count} times daily`,
                `Complete for ${challenge.total_days} consecutive days`,
                'Track progress and build streaks',
                'Complete and experience the benefits!',
              ].map((step, index) => (
                <View key={index} style={styles.stepRow}>
                  <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.foreground }]}>{step}</Text>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View
        style={[styles.actionBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}
      >
        <View style={styles.actionBarContent}>
          <View>
            <Text style={[styles.actionTitle, { color: colors.foreground }]}>
              {hasActiveChallenge ? 'Continue Your Challenge' : 'Ready to begin?'}
            </Text>
            <Text style={[styles.actionSubtitle, { color: colors.mutedForeground }]}>
              {challenge.total_days} days • {challenge.daily_target_count}x per day
            </Text>
          </View>
          {hasActiveChallenge ? (
            <Button
              onPress={handleContinue}
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
            >
              <Play color="#fff" size={16} />
              <Text style={styles.actionButtonText}>Continue</Text>
            </Button>
          ) : (
            <Button
              onPress={handleStartChallenge}
              loading={starting}
              style={[styles.actionButton, { backgroundColor: '#22c55e' }]}
            >
              <Play color="#fff" size={16} />
              <Text style={styles.actionButtonText}>Start</Text>
            </Button>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 32,
  },
  titleInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  arabicTitle: {
    fontSize: 14,
    marginTop: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 9,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  recommendations: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  recommendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recommendText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dhikrContent: {
    gap: 16,
  },
  arabicBox: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
  },
  arabicText: {
    fontSize: 24,
    lineHeight: 44,
    textAlign: 'center',
  },
  section: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
  },
  referenceBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  referenceLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  referenceText: {
    fontSize: 13,
    marginTop: 2,
  },
  fazilatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  steps: {
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
