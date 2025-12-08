import { AlertTriangle, ArrowLeft, Calendar, RefreshCw, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { missedChallengesApi } from "@/api/missed-challenges.api";
import { Loader } from "@/components/ui";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { formatDateTime, formatTimeAgo } from "@/lib/utils";

export default function MissedChallengesPage() {
  const { user } = useAuth();
  const [missedChallenges, setMissedChallenges] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    total_missed: 0,
    last_7_days: 0,
    last_30_days: 0,
    most_missed_challenge: null,
  });
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [challenges, summaryData, syncTime] = await Promise.all([
        missedChallengesApi.getMissedChallenges(user.id),
        missedChallengesApi.getSummary(user.id),
        missedChallengesApi.getLastSyncTime(),
      ]);
      setMissedChallenges(challenges);
      setSummary(summaryData);
      setLastSyncTime(syncTime);
    } catch (error) {
      console.error("Error loading missed challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const result = await missedChallengesApi.sync(user.id);
      toast.success("Sync completed", {
        description: `Found ${result.missedCount || 0} missed challenges`,
      });
      loadData();
    } catch (error) {
      toast.error("Sync failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSyncing(false);
    }
  };

  const groupedByDate = missedChallenges.reduce(
    (acc, challenge) => {
      const date = challenge.missed_date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(challenge);
      return acc;
    },
    {} as Record<string, typeof missedChallenges>
  );

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  if (loading)
    return (
      <div className="p-6 flex justify-center">
        <Loader size="lg" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/challenges">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Missed Challenges</h1>
            <p className="text-muted-foreground">
              Track challenges you missed in the last 3 months
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Last sync: {formatTimeAgo(lastSyncTime)}
            </p>
          </div>
        </div>
        <Button onClick={handleSync} disabled={syncing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Missed</p>
                <p className="text-3xl font-bold text-red-600">{summary.total_missed}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last 7 Days</p>
                <p className="text-3xl font-bold text-orange-600">{summary.last_7_days}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last 30 Days</p>
                <p className="text-3xl font-bold text-yellow-600">{summary.last_30_days}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Most Missed</p>
              <p className="text-lg font-bold truncate">
                {summary.most_missed_challenge?.title_bn || "None"}
              </p>
              {summary.most_missed_challenge && (
                <p className="text-sm text-muted-foreground">
                  {summary.most_missed_challenge.count} times
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {sortedDates.length > 0 ? (
          sortedDates.map((date) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {formatDateTime(date, "date")}
                  <Badge variant="destructive" className="ml-auto">
                    {groupedByDate[date].length} missed
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {groupedByDate[date].map((challenge: any) => (
                    <div
                      key={`${challenge.challenge_id}-${challenge.missed_date}`}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-red-50 dark:bg-red-950/20"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                        style={{
                          backgroundColor: `${challenge.challenge_color || "#ef4444"}20`,
                        }}
                      >
                        {challenge.challenge_icon || "📿"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium wrap-break-word">
                          {challenge.challenge_title_bn}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs shrink-0">
                            {challenge.reason === "not_completed" ? "Not Done" : challenge.reason}
                          </Badge>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {challenge.days_ago} days ago
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="mb-4 h-16 w-16 text-muted-foreground" />
              <p className="mb-2 text-lg font-semibold">No missed challenges!</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Great job! You haven't missed any challenges in the last 3 months.
              </p>
              <Button asChild>
                <Link to="/challenges">Continue Challenges</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
