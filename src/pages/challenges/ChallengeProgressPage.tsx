import { challengesApi } from "@/api/challenges.api";
import { ChallengeCalendar } from "@/components/ChallengeCalendar";
import { Loader } from "@/components/ui";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useConfirm } from "@/components/ui/Confirm";
import { Input } from "@/components/ui/Input";
import { Progress } from "@/components/ui/Progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/hooks/useAuth";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils/cn";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  Edit3,
  Flame,
  Maximize2,
  Minimize2,
  RotateCcw,
  Target,
  Trophy,
} from "lucide-react";
import { Activity, useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function ChallengeProgressPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { confirm, ConfirmDialog } = useConfirm();
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notes, setNotes] = useState("");
  const [mood, setMood] = useState("");
  const [inputMode, setInputMode] = useState(false);
  const [inputValue, setInputValue] = useState("0");

  useEffect(() => {
    if (!id || !user) return;

    const loadProgress = async () => {
      try {
        const data = await challengesApi.getProgress(id);
        setProgress(data);
      } catch (error) {
        console.error("Error loading progress:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [id, user]);

  const challenge = progress?.challenge;
  const target = challenge?.daily_target_count || 0;
  const today = new Date().toISOString().split("T")[0];
  const todayLog = progress?.daily_logs?.find(
    (log: any) =>
      log.completion_date === today && log.day_number === progress?.current_day
  );
  const isAlreadyCompleted = todayLog?.is_completed;
  console.log("Today Log progress:", progress);
  // Generate unique localStorage key for this challenge and day
  const storageKey = useMemo(
    () => `challenge_${progress?.id}_day_${progress?.current_day}_count`,
    [progress?.id, progress?.current_day]
  );

  // Use custom localStorage hook with hydration fix
  const [count, setCount, removeCount, isHydrated] = useLocalStorage(
    storageKey,
    isAlreadyCompleted ? todayLog?.count_completed || 0 : 0
  );

  console.log("storageKey", storageKey, "count", count);

  const { debouncedCallback: saveToLocalStorage, cancel: cancelSave } =
    useDebounce(
      (value: number) => {
        setCount(value);
      },
      10000,
      []
    );

  const dailyProgress = useMemo(() => (count / target) * 100, [count, target]);
  const remaining = useMemo(() => Math.max(0, target - count), [target, count]);
  const overallProgress = useMemo(
    () => ((progress?.current_day - 1) / (challenge?.total_days || 1)) * 100,
    [progress?.current_day, challenge?.total_days]
  );

  const vibrate = useCallback(() => {
    if ("vibrate" in navigator) {
      navigator.vibrate(200);
    }
  }, []);

  const handleIncrement = useCallback(() => {
    if (count < target && !isAlreadyCompleted) {
      const newCount = count + 1;
      setCount(newCount);
      vibrate();
      saveToLocalStorage(newCount);
    }
  }, [
    count,
    target,
    vibrate,
    isAlreadyCompleted,
    setCount,
    saveToLocalStorage,
  ]);

  const toggleInputMode = useCallback(() => {
    setInputMode(!inputMode);
    setInputValue(count.toString());
  }, [inputMode, count]);

  const handleInputSubmit = useCallback(() => {
    const value = parseInt(inputValue);
    if (!isNaN(value) && value >= 0 && value <= target && !isAlreadyCompleted) {
      setCount(value);
      saveToLocalStorage(value);
      setInputValue("");
      setInputMode(false);
    }
  }, [inputValue, target, isAlreadyCompleted, setCount, saveToLocalStorage]);

  const handleReset = useCallback(async () => {
    const confirmed = await confirm({
      title: "Reset Counter?",
      description:
        "Are you sure you want to reset the counter? This action cannot be undone.",
      confirmText: "Reset",
      confirmVariant: "destructive",
      icon: "warning",
    });
    if (confirmed) {
      setCount(0);
      cancelSave();
    }
  }, [setCount, confirm, cancelSave]);

  const handleComplete = useCallback(async () => {
    if (count < target) {
      const confirmed = await confirm({
        title: "Target Not Reached",
        description: `You haven't reached the target count of ${target} yet. Do you want to complete anyway?`,
        confirmText: "Complete Anyway",
        confirmVariant: "default",
        icon: "warning",
      });
      if (!confirmed) return;
    }

    setIsCompleting(true);
    try {
      await challengesApi.complete(
        id!,
        user!.id,
        challenge.id,
        progress.current_day,
        count,
        target,
        notes,
        mood
      );

      const updatedProgress = await challengesApi.getProgress(id!);
      setProgress(updatedProgress);
      removeCount();
      cancelSave();

      setShowSuccessModal(true);
      toast.success(`Day ${progress.current_day} completed!`);
    } catch (error: any) {
      console.error("Error completing challenge:", error);
      const { toast } = await import("sonner");
      toast.error(error.message || "Failed to save progress");
    } finally {
      setIsCompleting(false);
    }
  }, [
    count,
    target,
    id,
    user,
    challenge,
    progress,
    notes,
    mood,
    removeCount,
    cancelSave,
  ]);

  useEffect(() => {
    if (isAlreadyCompleted) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if (e.code === "Space" && !isInputField) {
        e.preventDefault();
        handleIncrement();
      }
      if (e.code === "KeyF" && e.ctrlKey) {
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleIncrement, isAlreadyCompleted]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isFullscreen]);

  if (loading || !progress || !isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (!progress || !challenge) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Progress not found
      </div>
    );
  }

  const fullscreenContent = isFullscreen && !isAlreadyCompleted && (
    <div className="fixed inset-0 z-9999 overflow-y-auto bg-linear-to-br from-emerald-500/20 via-emerald-500/10 to-white/95 backdrop-blur-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{challenge.icon || "📿"}</span>
          <div>
            <h1 className="text-lg font-bold">{challenge.title_bn}</h1>
            <p className="text-sm text-muted-foreground">
              Day {progress.current_day}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => setIsFullscreen(false)}
        >
          <Minimize2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex min-h-[calc(100vh-80px)] flex-col">
        <div className="flex-1 space-y-6 px-4 pb-6">
          <div className="rounded-xl border-2 border-emerald-500/25 bg-emerald-500/5 p-6 text-center">
            <p className="arabic-text text-3xl leading-loose md:text-4xl">
              {challenge.arabic_text}
            </p>
          </div>
          {challenge.transliteration_bn && (
            <div className="rounded-lg bg-muted/90 p-4 text-center border">
              <p className="text-lg font-medium text-muted-foreground md:text-xl">
                {challenge.transliteration_bn}
              </p>
            </div>
          )}
          <div className="rounded-lg bg-background/95 p-4 text-center shadow-sm border">
            <p className="text-lg leading-relaxed md:text-xl">
              {challenge.translation_bn}
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-background/98 backdrop-blur-md border-t shadow-lg p-4">
          <div className="mx-auto max-w-md space-y-4">
            <div className="text-center">
              <Badge
                variant={count >= target ? "default" : "secondary"}
                className={cn(
                  "mb-2 text-lg",
                  count >= target && "bg-emerald-500"
                )}
              >
                {count} / {target}
              </Badge>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-emerald-500/20">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(dailyProgress, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {remaining > 0
                  ? `${remaining} more to go!`
                  : "Target reached! 🎉"}
              </p>
            </div>
            <div className="text-center">
              <div className="text-8xl font-bold tabular-nums md:text-9xl text-emerald-500">
                {count}
              </div>
            </div>
            <Button
              type="button"
              size="lg"
              className="h-20 w-full text-xl font-bold bg-emerald-500 hover:bg-emerald-600"
              onClick={handleIncrement}
              disabled={count >= target}
            >
              {count >= target ? (
                <>
                  <Check className="mr-2 h-6 w-6" />
                  Target Reached!
                </>
              ) : (
                <>
                  <Target className="mr-2 h-6 w-6" />
                  Tap to Count
                </>
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Tap button or press Space • Ctrl+F to exit fullscreen
            </p>
            {count >= target && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsFullscreen(false)}
                  className="flex-1"
                >
                  <Minimize2 className="mr-2 h-4 w-4" />
                  Exit Fullscreen
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={isCompleting}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                >
                  <Check className="mr-2 h-4 w-4" />
                  {isCompleting ? "Saving..." : "Complete"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-4 px-4 pb-20 pt-4 sm:space-y-6 sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <span className="shrink-0 text-2xl sm:text-3xl">
                {challenge.icon || "📿"}
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-xl font-bold sm:text-2xl">
                  {challenge.title_bn}
                </h1>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Day {progress.current_day} of {challenge.total_days}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex flex-col items-center text-center">
                <CalendarIcon className="mb-1 h-4 w-4 text-blue-500 sm:mb-2 sm:h-5 sm:w-5" />
                <p className="text-xl font-bold sm:text-2xl">
                  {progress.current_day}
                </p>
                <p className="text-xs text-muted-foreground">Current Day</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex flex-col items-center text-center">
                <Flame className="mb-1 h-4 w-4 text-orange-500 sm:mb-2 sm:h-5 sm:w-5" />
                <p className="text-xl font-bold sm:text-2xl">
                  {progress.current_streak}
                </p>
                <p className="text-xs text-muted-foreground">Streak</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex flex-col items-center text-center">
                <Trophy className="mb-1 h-4 w-4 text-amber-500 sm:mb-2 sm:h-5 sm:w-5" />
                <p className="text-xl font-bold sm:text-2xl">
                  {progress.total_completed_days}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex flex-col items-center text-center">
                <Target className="mb-1 h-4 w-4 text-emerald-500 sm:mb-2 sm:h-5 sm:w-5" />
                <p className="text-xl font-bold sm:text-2xl">
                  {challenge.total_days - progress.current_day + 1}
                </p>
                <p className="text-xs text-muted-foreground">Remaining</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium sm:text-sm">
                  Overall Progress
                </span>
                <span className="text-xs text-muted-foreground sm:text-sm">
                  {progress.current_day - 1}/{challenge.total_days} days
                </span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-4 sm:space-y-4 sm:pt-6">
            <div className="rounded-lg border-2 border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-6">
              <p className="arabic-text text-center text-2xl leading-loose sm:text-3xl">
                {challenge.arabic_text}
              </p>
            </div>
            {challenge.transliteration_bn && (
              <p className="text-center text-sm text-muted-foreground sm:text-lg">
                {challenge.transliteration_bn}
              </p>
            )}
            <p className="text-center text-sm leading-relaxed sm:text-base">
              {challenge.translation_bn}
            </p>
          </CardContent>
        </Card>

        {!isAlreadyCompleted ? (
          <Card className="border-2 border-emerald-500">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                <span>Today's Count</span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={count >= target ? "default" : "secondary"}
                    className="text-sm sm:text-base"
                  >
                    {count} / {target}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsFullscreen(true)}
                    title="Fullscreen mode (Ctrl+F)"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-emerald-500/20">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(dailyProgress, 100)}%` }}
                  />
                </div>
                <p className="text-center text-xs text-muted-foreground sm:text-sm">
                  {remaining > 0
                    ? `${remaining} more to go!`
                    : "Target reached! 🎉"}
                </p>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-2 text-6xl font-bold tabular-nums sm:mb-4 sm:text-8xl text-emerald-500">
                    {count}
                  </div>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Tap or press Space • Ctrl+F for fullscreen
                  </p>
                </div>
              </div>

              <div className="flex justify-center mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleInputMode}
                  disabled={count >= target}
                  className="text-xs"
                >
                  <Edit3 className="mr-1 h-3 w-3" />
                  {inputMode ? "Switch to Tap" : "Direct Input"}
                </Button>
              </div>

              <Activity mode={inputMode ? "visible" : "hidden"}>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={`Enter count (0-${target})`}
                      min="0"
                      max={target}
                      className="text-center text-lg font-bold"
                      disabled={count >= target}
                    />
                    <Button
                      onClick={handleInputSubmit}
                      disabled={!inputValue || count >= target}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Enter a number between 0 and {target}
                  </p>
                </div>
              </Activity>

              <Activity mode={!inputMode ? "visible" : "hidden"}>
                <Button
                  type="button"
                  size="lg"
                  className="h-24 w-full text-xl font-bold sm:h-32 sm:text-2xl bg-emerald-500 hover:bg-emerald-600"
                  onClick={handleIncrement}
                  disabled={count >= target}
                >
                  {count >= target ? (
                    <>
                      <Check className="mr-2 h-6 w-6 sm:h-8 sm:w-8" />
                      Target Reached!
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-6 w-6 sm:h-8 sm:w-8" />
                      Tap to Count
                    </>
                  )}
                </Button>
              </Activity>

              <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={count === 0}
                  className="text-sm sm:text-base"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Counter
                </Button>
                <Button
                  variant="default"
                  onClick={handleComplete}
                  disabled={isCompleting || count < target}
                  className="text-sm sm:text-base bg-emerald-500 hover:bg-emerald-600"
                >
                  <Check className="mr-2 h-4 w-4" />
                  {isCompleting ? "Saving..." : "Complete Today"}
                </Button>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium sm:text-sm">
                    How do you feel? (Optional)
                  </label>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="great">😊 Great</SelectItem>
                      <SelectItem value="good">🙂 Good</SelectItem>
                      <SelectItem value="okay">😐 Okay</SelectItem>
                      <SelectItem value="difficult">😓 Difficult</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium sm:text-sm">
                    Notes (Optional)
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any thoughts or reflections..."
                    rows={3}
                    className="text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-emerald-500 bg-emerald-500/5">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center sm:py-12">
              <CheckCircle2 className="mb-3 h-12 w-12 sm:mb-4 sm:h-16 sm:w-16 text-emerald-500" />
              <h3 className="mb-2 text-xl font-bold sm:text-2xl">
                Day {progress.current_day} Completed!
              </h3>
              <p className="mb-3 text-sm text-muted-foreground sm:mb-4 sm:text-base">
                You completed {count} repetitions today
              </p>
              <Badge variant="secondary" className="text-sm sm:text-base">
                Come back tomorrow for Day {progress.current_day + 1}
              </Badge>
            </CardContent>
          </Card>
        )}

        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md animate-in fade-in zoom-in duration-300">
              <CardContent className="space-y-4 pt-6 text-center sm:space-y-6">
                <div className="flex justify-center">
                  <div className="rounded-full p-4 sm:p-6 bg-emerald-500/10">
                    <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-emerald-500" />
                  </div>
                </div>

                <div>
                  <h2 className="mb-2 text-2xl font-bold sm:text-3xl">
                    Well Done!
                  </h2>
                  <p className="text-base text-muted-foreground sm:text-lg">
                    Day {progress.current_day} completed successfully
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                    <span className="text-sm">Count</span>
                    <span className="font-bold">{target}</span>
                  </div>
                  {progress.current_streak >= 0 && (
                    <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                      <span className="text-sm">Streak</span>
                      <span className="flex items-center gap-1 font-bold">
                        <Flame className="h-4 w-4 text-orange-500" />
                        {progress.current_streak + 1} days
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-sm font-medium text-muted-foreground">
                  See you tomorrow for Day {progress.current_day + 1}!
                </p>

                <div className="pt-4">
                  <Link to="/challenges">
                    <Button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600">
                      Go to Challenges
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {typeof window !== "undefined" &&
          fullscreenContent &&
          createPortal(fullscreenContent, document.body)}

        {progress.daily_logs && progress.daily_logs.length > 0 && (
          <ChallengeCalendar
            challenge={challenge}
            progress={progress}
            dailyLogs={progress.daily_logs || []}
          />
        )}

        <ConfirmDialog />
      </div>
    </>
  );
}
