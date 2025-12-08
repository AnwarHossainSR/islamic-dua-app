'use client';

import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Flame,
  Target,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface DailyLog {
  day_number: number;
  completion_date: string;
  count_completed: number;
  target_count: number;
  is_completed: boolean;
  mood?: string;
  notes?: string;
}

interface ChallengeCalendarProps {
  challenge: {
    id: string;
    title_bn: string;
    total_days: number;
    daily_target_count: number;
    icon?: string;
  };
  progress: {
    current_day: number;
    current_streak: number;
    total_completed_days: number;
    missed_days: number;
  };
  dailyLogs: DailyLog[];
  className?: string;
}

export function ChallengeCalendar({
  challenge,
  progress,
  dailyLogs,
  className,
}: ChallengeCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DailyLog | null>(null);

  // Calculate calendar data
  const calendarData = useMemo(() => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (progress.current_day - 1));

    const weeks: Array<
      Array<{
        date: Date;
        dayNumber: number | null;
        log: DailyLog | null;
        status: 'completed' | 'current' | 'missed' | 'upcoming' | 'outside';
      }>
    > = [];

    // Get first day of month and calculate calendar grid
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

    const startCalendar = new Date(firstDay);
    startCalendar.setDate(startCalendar.getDate() - firstDay.getDay());

    const currentDate = new Date(startCalendar);

    for (let week = 0; week < 6; week++) {
      const weekDays = [];

      for (let day = 0; day < 7; day++) {
        const date = new Date(currentDate);
        const daysSinceStart = Math.floor(
          (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const dayNumber =
          daysSinceStart >= 0 && daysSinceStart < challenge.total_days ? daysSinceStart + 1 : null;

        let status: 'completed' | 'current' | 'missed' | 'upcoming' | 'outside' = 'outside';
        let log: DailyLog | null = null;

        if (dayNumber) {
          log = dailyLogs.find((l) => l.day_number === dayNumber) || null;

          if (dayNumber < progress.current_day) {
            status = log?.is_completed ? 'completed' : 'missed';
          } else if (dayNumber === progress.current_day) {
            status = log?.is_completed ? 'completed' : 'current';
          } else {
            status = 'upcoming';
          }
        } else if (date.getMonth() === currentMonth.getMonth()) {
          status = 'outside';
        } else {
          status = 'outside';
        }

        weekDays.push({ date, dayNumber, log, status });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      weeks.push(weekDays);

      // Stop if we've gone past the current month
      if (currentDate.getMonth() !== currentMonth.getMonth() && week >= 4) {
        break;
      }
    }

    return weeks;
  }, [currentMonth, challenge.total_days, progress.current_day, dailyLogs]);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-emerald-500 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20';
      case 'current':
        return 'border-blue-500 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 ring-2 ring-blue-500/30';
      case 'missed':
        return 'border-red-500 bg-red-500/10 text-red-700 hover:bg-red-500/20';
      case 'upcoming':
        return 'border-muted bg-muted/30 text-muted-foreground hover:bg-muted/50';
      default:
        return 'border-transparent text-muted-foreground/50';
    }
  };

  const getStatusIcon = (status: string, dayNumber: number | null) => {
    if (!dayNumber) return null;

    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'current':
        return <Target className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'missed':
        return <X className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'upcoming':
        return <Circle className="h-3 w-3 sm:h-4 sm:w-4 opacity-50" />;
      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Challenge Calendar</span>
            <span className="sm:hidden">Calendar</span>
          </CardTitle>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0 sm:h-9 sm:w-9"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <span className="min-w-20 sm:min-w-[120px] text-center text-xs sm:text-sm font-medium">
              {monthNames[currentMonth.getMonth()].slice(0, 3)} {currentMonth.getFullYear()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0 sm:h-9 sm:w-9"
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
              <span className="font-bold text-emerald-600 text-sm sm:text-base">
                {progress.total_completed_days}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Done</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
              <span className="font-bold text-orange-600 text-sm sm:text-base">
                {progress.current_streak}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Streak</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <X className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              <span className="font-bold text-red-600 text-sm sm:text-base">
                {progress.missed_days}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Miss</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar weeks */}
          {calendarData.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1 sm:gap-2">
              {week.map((day, dayIndex) => (
                <button
                  key={dayIndex}
                  onClick={() => day.dayNumber && setSelectedDay(day.log)}
                  className={cn(
                    'aspect-square rounded-lg border transition-all duration-200 flex flex-col items-center justify-center relative',
                    'h-8 w-8 sm:min-h-26 sm:min-w-26 sm:border-2',
                    getStatusColor(day.status),
                    day.dayNumber && 'cursor-pointer',
                    !day.dayNumber && 'cursor-default'
                  )}
                  disabled={!day.dayNumber}
                >
                  {day.dayNumber && (
                    <>
                      <div className="flex items-center justify-center">
                        {getStatusIcon(day.status, day.dayNumber)}
                      </div>
                      <span className="text-[10px] sm:text-xs font-medium leading-none mt-0.5">
                        {day.dayNumber}
                      </span>
                    </>
                  )}
                  {!day.dayNumber && day.date.getMonth() === currentMonth.getMonth() && (
                    <span className="text-xs text-muted-foreground/50">{day.date.getDate()}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-3 w-3 text-blue-500" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <X className="h-3 w-3 text-red-500" />
            <span>Missed</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3 text-muted-foreground opacity-50" />
            <span>Upcoming</span>
          </div>
        </div>

        {/* Selected Day Details */}
        {selectedDay && (
          <Card className="border-2 border-blue-500/20 bg-blue-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Day {selectedDay.day_number} Details</h4>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDay(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="text-sm font-medium">
                    {new Date(selectedDay.completion_date).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Count:</span>
                  <span className="text-sm font-medium">
                    {selectedDay.count_completed} / {selectedDay.target_count}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge
                    variant={selectedDay.is_completed ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {selectedDay.is_completed ? 'Completed' : 'Incomplete'}
                  </Badge>
                </div>

                {selectedDay.mood && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Mood:</span>
                    <span className="text-sm">{selectedDay.mood}</span>
                  </div>
                )}

                {selectedDay.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                    <p className="text-sm">{selectedDay.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
