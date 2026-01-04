import { ArrowLeft, Calendar, Flame, Plus, RotateCcw, Trophy, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { activitiesApi } from '@/api/activities.api';
import { Loader } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { formatNumber } from '@/lib/utils';

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activity, setActivity] = useState<any>(null);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [userDailyLogs, setUserDailyLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputCount, setInputCount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    if (!id || !user) return;
    try {
      const [activityData, topUsersData, logsData] = await Promise.all([
        activitiesApi.getActivityById(id),
        activitiesApi.getTopUsers(id, 10),
        activitiesApi.getUserDailyLogs(id, user.id),
      ]);
      setActivity(activityData);
      setTopUsers(topUsersData);
      setUserDailyLogs(logsData);
    } catch (error) {
      console.error('Error loading activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCount = useCallback(async () => {
    if (!inputCount || !user || !activity) return;

    const count = parseInt(inputCount, 10);
    if (Number.isNaN(count) || count <= 0) {
      toast.error('Please enter a valid count');
      return;
    }

    setIsSubmitting(true);
    try {
      await activitiesApi.addActivityCount(activity.id, user.id, count);
      toast.success(`Added ${count} completions!`);
      setInputCount('');

      // Update the activity state immediately for better UX
      setActivity((prev: any) => ({
        ...prev,
        total_count: (prev.total_count || 0) + count,
      }));

      // Also refresh data from server
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add count');
    } finally {
      setIsSubmitting(false);
    }
  }, [inputCount, user, activity, loadData]);

  useEffect(() => {
    if (id && user) loadData();
  }, [id, user]);

  if (loading)
    return (
      <div className="p-6 flex justify-center">
        <Loader size="lg" />
      </div>
    );
  if (!activity) return <div className="p-6">Activity not found</div>;

  const avgPerUser =
    activity.total_users > 0 ? Math.round(activity.total_count / activity.total_users) : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/activities">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{activity.name_bn}</h1>
          <p className="text-muted-foreground">{activity.name_en || activity.name_ar}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Trophy className="mb-2 h-8 w-8 text-amber-500" />
              <p className="text-3xl font-bold">{formatNumber(activity.total_count)}</p>
              <p className="text-xs text-muted-foreground">Total Completions</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Users className="mb-2 h-8 w-8 text-blue-500" />
              <p className="text-3xl font-bold">{activity.total_users}</p>
              <p className="text-xs text-muted-foreground">Unique Users</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <RotateCcw className="mb-2 h-8 w-8 text-emerald-500" />
              <p className="text-3xl font-bold">{formatNumber(avgPerUser)}</p>
              <p className="text-xs text-muted-foreground">Avg per User</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Calendar className="mb-2 h-8 w-8 text-purple-500" />
              <p className="text-3xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Linked Challenges</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg text-3xl"
              style={{ backgroundColor: `${activity.color || '#10b981'}20` }}
            >
              {activity.icon || '📿'}
            </div>
            <div>
              <Badge variant="secondary" className="mb-2">
                {activity.activity_type || 'dhikr'}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Slug: <code className="bg-muted px-2 py-1 rounded">{activity.unique_slug}</code>
              </p>
            </div>
          </div>

          {activity.arabic_text && activity.arabic_text !== 'none' && (
            <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950">
              <p className="arabic-text text-center text-3xl leading-loose">
                {activity.arabic_text}
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium mb-1">Bangla</p>
              <p className="text-sm text-muted-foreground">{activity.name_bn}</p>
            </div>
            {activity.name_ar && (
              <div>
                <p className="text-sm font-medium mb-1">Arabic</p>
                <p className="arabic-text text-sm text-muted-foreground">{activity.name_ar}</p>
              </div>
            )}
            {activity.name_en && (
              <div>
                <p className="text-sm font-medium mb-1">English</p>
                <p className="text-sm text-muted-foreground">{activity.name_en}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-500" />
            Add Count
          </CardTitle>
          <CardDescription>Increment your completion count for this activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              type="number"
              placeholder="Enter count"
              value={inputCount}
              onChange={(e) => setInputCount(e.target.value)}
              min="1"
              className="flex-1"
            />
            <Button
              onClick={handleSubmitCount}
              disabled={!inputCount || isSubmitting}
              className="shrink-0"
            >
              {isSubmitting ? 'Adding...' : 'Add Count'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {userDailyLogs && userDailyLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Daily Completion Details</CardTitle>
            <CardDescription>Your personal completion history for this activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userDailyLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border p-4 bg-emerald-50/50 dark:bg-emerald-950/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                      <Trophy className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Day {log.day_number}</h4>
                        {log.mood && (
                          <Badge variant="outline" className="text-xs">
                            {log.mood === 'great' && '😊 Great'}
                            {log.mood === 'good' && '🙂 Good'}
                            {log.mood === 'okay' && '😐 Okay'}
                            {log.mood === 'difficult' && '😓 Difficult'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Completed: {log.count_completed}/{log.target_count}
                        </span>
                        <span>{new Date(log.completion_date).toLocaleDateString()}</span>
                      </div>
                      {log.notes && (
                        <p className="mt-1 text-sm text-muted-foreground italic">
                          &quot;{log.notes}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">{log.count_completed}</div>
                    <div className="text-xs text-muted-foreground">count</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Top Contributors
          </CardTitle>
          <CardDescription>Users with the most completions</CardDescription>
        </CardHeader>
        <CardContent>
          {topUsers.length > 0 ? (
            <div className="space-y-3">
              {topUsers.map((user: any, index: number) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={index < 3 ? 'default' : 'outline'}
                      className="h-8 w-8 flex items-center justify-center rounded-full text-sm font-bold shrink-0"
                    >
                      #{index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">User {user.user_id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">
                        {formatNumber(user.total_completed)}
                      </p>
                      <p className="text-xs text-muted-foreground">completions</p>
                    </div>
                    {user.longest_streak > 0 && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Flame className="h-4 w-4 text-orange-500" />
                          <span className="text-lg font-bold text-orange-600">
                            {user.longest_streak}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">streak</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              No users have completed this activity yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
