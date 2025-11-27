import { challengesApi } from "@/api/challenges.api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import type { Challenge } from "@/types";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Star,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function ChallengePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveChallenge, setHasActiveChallenge] = useState(false);
  const [activeProgressId, setActiveProgressId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadChallenge = async () => {
      try {
        const data = await challengesApi.getById(id);
        setChallenge(data as any);

        // Check if user has active challenge
        if (user) {
          const { data: existing } = await challengesApi.checkActiveProgress(
            user.id,
            id
          );
          if (existing) {
            setHasActiveChallenge(true);
            setActiveProgressId(existing.id);
          }
        }
      } catch (error) {
        console.error("Error loading challenge:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChallenge();
  }, [id, user]);

  const handleStartChallenge = async () => {
    if (!user || !id) {
      navigate(`/login?redirect=/challenges/${id}/preview`);
      return;
    }

    setStarting(true);
    try {
      const result = await challengesApi.start(user.id, id);
      if (result.data) {
        navigate(`/challenges/progress/${result.data.id}`);
      }
    } catch (error) {
      console.error("Error starting challenge:", error);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Challenge not found
      </div>
    );
  }

  const timeLabel =
    challenge.recommended_time
      ?.replace(/_/g, " ")
      .replace(/\b\w/g, (l: string) => l.toUpperCase()) || "";
  const prayerLabel =
    (challenge.recommended_prayer?.charAt(0).toUpperCase() || "") +
    (challenge.recommended_prayer?.slice(1) || "");

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-6 pb-32">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-4xl">{challenge.icon || "📿"}</span>
              <div>
                <h1 className="text-3xl font-bold">{challenge.title_bn}</h1>
                {challenge.title_ar && (
                  <p className="arabic-text text-lg text-muted-foreground">
                    {challenge.title_ar}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                challenge.difficulty_level === "easy"
                  ? "secondary"
                  : challenge.difficulty_level === "hard"
                  ? "destructive"
                  : "default"
              }
              className="text-base"
            >
              {challenge.difficulty_level}
            </Badge>
          </div>
        </div>

        {/* Challenge Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Target className="mb-2 h-6 w-6 text-emerald-500" />
                <p className="text-2xl font-bold">
                  {challenge.daily_target_count}x
                </p>
                <p className="text-xs text-muted-foreground">Per Day</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Calendar className="mb-2 h-6 w-6 text-blue-500" />
                <p className="text-2xl font-bold">{challenge.total_days}</p>
                <p className="text-xs text-muted-foreground">Days</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Users className="mb-2 h-6 w-6 text-purple-500" />
                <p className="text-2xl font-bold">
                  {challenge.total_participants || 0}
                </p>
                <p className="text-xs text-muted-foreground">Participants</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Trophy className="mb-2 h-6 w-6 text-amber-500" />
                <p className="text-2xl font-bold">
                  {challenge.total_completions || 0}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>About This Challenge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="leading-relaxed">{challenge.description_bn}</p>

            {(challenge.recommended_time || challenge.recommended_prayer) && (
              <div className="flex flex-wrap gap-4 rounded-lg border bg-muted/50 p-4">
                {challenge.recommended_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{timeLabel}</span>
                  </div>
                )}
                {challenge.recommended_prayer && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">🕌</span>
                    <span className="text-sm font-medium">
                      After {prayerLabel} Prayer
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dhikr Content */}
        <Card>
          <CardHeader>
            <CardTitle>The Dhikr</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950">
              <p className="arabic-text text-center text-3xl leading-loose">
                {challenge.arabic_text}
              </p>
            </div>

            {challenge.transliteration_bn && (
              <div>
                <h3 className="mb-2 font-semibold text-muted-foreground">
                  Transliteration
                </h3>
                <p className="text-lg leading-relaxed">
                  {challenge.transliteration_bn}
                </p>
              </div>
            )}

            <div>
              <h3 className="mb-2 font-semibold text-muted-foreground">
                Translation
              </h3>
              <p className="text-lg leading-relaxed">
                {challenge.translation_bn}
              </p>
            </div>

            {challenge.reference && (
              <div className="flex items-start gap-2 rounded-lg bg-muted p-4">
                <BookOpen className="mt-1 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Reference</p>
                  <p className="text-sm text-muted-foreground">
                    {challenge.reference}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fazilat (Benefits) */}
        {challenge.fazilat_bn && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Fazilat (Benefits)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed">{challenge.fazilat_bn}</p>
            </CardContent>
          </Card>
        )}

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                  1
                </span>
                <span>
                  Start the challenge and commit to reading this dhikr{" "}
                  <strong>{challenge.daily_target_count} times</strong> every
                  day
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                  2
                </span>
                <span>
                  Complete your daily goal for{" "}
                  <strong>{challenge.total_days} consecutive days</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                  3
                </span>
                <span>
                  Track your progress, build streaks, and earn achievements
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                  4
                </span>
                <span>Complete the challenge and experience the benefits!</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto max-w-4xl p-4">
          {user ? (
            <Card className="border-2">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold">
                    {hasActiveChallenge
                      ? "Continue Your Challenge"
                      : "Ready to begin?"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {challenge.total_days} days • {challenge.daily_target_count}
                    x per day
                  </p>
                </div>
                {hasActiveChallenge ? (
                  <Button size="lg" asChild>
                    <Link to={`/challenges/progress/${activeProgressId}`}>
                      Continue Challenge
                    </Link>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleStartChallenge}
                    disabled={starting}
                  >
                    {starting ? "Starting..." : "Start Challenge"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-blue-500">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold">Login to Start Challenge</p>
                  <p className="text-sm text-muted-foreground">
                    Track your progress and earn achievements
                  </p>
                </div>
                <Button size="lg" asChild>
                  <Link to={`/login?redirect=/challenges/${id}/preview`}>
                    Login
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
