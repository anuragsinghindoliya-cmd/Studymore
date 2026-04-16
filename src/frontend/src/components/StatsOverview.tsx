import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isBefore, startOfWeek } from "date-fns";
import { BarChart3, Clock, Flame, Loader2, Target, Trophy } from "lucide-react";
import React, { useMemo } from "react";
import {
  useGetSessions,
  useGetStudyStats,
  useGetSubjects,
  useGetWeeklyGoals,
} from "../hooks/useQueries";
import { formatDuration, fromNanoseconds } from "../utils/formatting";
import { toNanoseconds } from "../utils/formatting";

export function StatsOverview() {
  const { data: stats, isLoading, isError } = useGetStudyStats();
  const { data: subjects } = useGetSubjects();
  const { data: sessions } = useGetSessions();
  const { data: goals } = useGetWeeklyGoals();

  const subjectMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    // biome-ignore lint/complexity/noForEach: existing code pattern
    subjects?.forEach((s) =>
      map.set(s.id.toString(), { name: s.name, color: s.color }),
    );
    return map;
  }, [subjects]);

  // Weekly minutes per subject
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  const weeklyMinutesBySubject = useMemo(() => {
    if (!sessions) return new Map<string, number>();
    const weekStart = currentWeekStart;
    const map = new Map<string, number>();
    // biome-ignore lint/complexity/noForEach: existing code pattern
    sessions.forEach((s) => {
      if (
        s.sessionType === "work" &&
        !isBefore(fromNanoseconds(s.startTime), weekStart)
      ) {
        const key = s.subjectId.toString();
        map.set(key, (map.get(key) || 0) + Number(s.duration));
      }
    });
    return map;
  }, [sessions]);

  if (isError) {
    return <div className="text-destructive">Failed to load stats.</div>;
  }

  if (isLoading || !stats) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalMinutes = Number(stats.totalMinutes);
  const sortedSubjects = [...stats.minutesPerSubject].sort(
    (a, b) => Number(b[1]) - Number(a[1]),
  );
  const maxSubjectMinutes =
    sortedSubjects.length > 0 ? Number(sortedSubjects[0][1]) : 1;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight font-serif">
          Statistics
        </h2>
        <p className="text-muted-foreground">
          Detailed insights into your study habits and progress.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-muted/30 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
              Total Study Time
            </CardTitle>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {formatDuration(totalMinutes)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Across all subjects
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-muted/30 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
              Current Streak
            </CardTitle>
            <div className="rounded-lg bg-orange-500/10 p-2 text-orange-500">
              <Flame className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {Number(stats.currentStreak)} day
              {Number(stats.currentStreak) !== 1 ? "s" : ""}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Keep it going!</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-muted/30 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
              Longest Streak
            </CardTitle>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
              <Trophy className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {Number(stats.longestStreak)} day
              {Number(stats.longestStreak) !== 1 ? "s" : ""}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Your personal best
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Hours per subject */}
        <Card className="border-border/50 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="font-serif text-xl">
              Study Time by Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedSubjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <BarChart3 className="mb-2 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No study data yet.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedSubjects.map(([subjectId, minutes]) => {
                  const subject = subjectMap.get(subjectId.toString());
                  const mins = Number(minutes);
                  const pct = (mins / maxSubjectMinutes) * 100;
                  return (
                    <div key={subjectId.toString()} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="h-2.5 w-2.5 rounded-full ring-2 ring-background shadow-sm"
                            style={{
                              backgroundColor: subject?.color || "#888",
                            }}
                          />
                          <span className="font-semibold">
                            {subject?.name || "Unknown"}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-muted-foreground">
                          {formatDuration(mins)}
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: subject?.color || "#888",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly goal progress */}
        <Card className="border-border/50 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="font-serif text-xl">Goal Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const currentGoals = (goals || []).filter(
                (g) => g.weekStart === toNanoseconds(currentWeekStart),
              );
              return currentGoals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Target className="mb-2 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No goals set for this week.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {currentGoals.map((goal) => {
                    const subject =
                      goal.subjectId != null
                        ? subjectMap.get(goal.subjectId.toString())
                        : null;
                    const label = subject ? subject.name : "Overall Goal";
                    const color = subject?.color || "var(--primary)";
                    const target = Number(goal.targetMinutes);

                    let actual = 0;
                    if (goal.subjectId != null) {
                      actual =
                        weeklyMinutesBySubject.get(goal.subjectId.toString()) ||
                        0;
                    } else {
                      // biome-ignore lint/complexity/noForEach: existing code pattern
                      weeklyMinutesBySubject.forEach((v) => {
                        actual += v;
                      });
                    }
                    const pct = Math.min((actual / target) * 100, 100);

                    return (
                      <div key={goal.id.toString()} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold">{label}</span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {formatDuration(actual)} / {formatDuration(target)}
                          </span>
                        </div>
                        <div className="h-4 w-full rounded-full bg-muted overflow-hidden border border-border/30 p-0.5">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out shadow-inner flex items-center justify-end px-1.5"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          >
                            {pct > 15 && (
                              <span className="text-[8px] font-bold text-white leading-none">
                                {Math.round(pct)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
