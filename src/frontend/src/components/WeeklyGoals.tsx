import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { isBefore, startOfWeek } from "date-fns";
import { Loader2, Plus, Target, Trash2 } from "lucide-react";
import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import type { WeeklyGoal } from "../backend";
import {
  useDeleteWeeklyGoal,
  useGetSessions,
  useGetSubjects,
  useGetWeeklyGoals,
} from "../hooks/useQueries";
import {
  formatDuration,
  fromNanoseconds,
  toNanoseconds,
} from "../utils/formatting";
import { AddGoalDialog } from "./AddGoalDialog";

export function WeeklyGoalsView() {
  const { data: goals, isLoading, isError } = useGetWeeklyGoals();
  const { data: subjects } = useGetSubjects();
  const { data: sessions } = useGetSessions();
  const { mutate: deleteGoal, isPending: isDeleting } = useDeleteWeeklyGoal();

  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WeeklyGoal | null>(null);

  const subjectMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    // biome-ignore lint/complexity/noForEach: existing code pattern
    subjects?.forEach((s) =>
      map.set(s.id.toString(), { name: s.name, color: s.color }),
    );
    return map;
  }, [subjects]);

  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  const weeklyMinutes = useMemo(() => {
    if (!sessions) return { total: 0, bySubject: new Map<string, number>() };
    const weekStart = currentWeekStart;
    let total = 0;
    const bySubject = new Map<string, number>();
    // biome-ignore lint/complexity/noForEach: existing code pattern
    sessions.forEach((s) => {
      if (
        s.sessionType === "work" &&
        !isBefore(fromNanoseconds(s.startTime), weekStart)
      ) {
        const mins = Number(s.duration);
        total += mins;
        const key = s.subjectId.toString();
        bySubject.set(key, (bySubject.get(key) || 0) + mins);
      }
    });
    return { total, bySubject };
  }, [sessions]);

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteGoal(
      { id: deleteTarget.id },
      {
        onSuccess: () => {
          toast.success("Goal deleted");
          setDeleteTarget(null);
        },
        onError: () => toast.error("Failed to delete goal"),
      },
    );
  };

  if (isError) {
    return <div className="text-destructive">Failed to load goals.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight font-serif">
            Weekly Goals
          </h2>
          <p className="text-muted-foreground text-sm">
            Set targets to stay motivated through the week.
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="rounded-full shadow-lg shadow-primary/20"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !goals || goals.length === 0 ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Target className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="mb-6 text-muted-foreground font-medium text-center max-w-xs">
              No weekly goals set. Setting goals helps you stay consistent and
              track your academic growth.
            </p>
            <Button
              variant="outline"
              onClick={() => setAddOpen(true)}
              className="rounded-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Set your first goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {goals
            .filter((g) => g.weekStart === toNanoseconds(currentWeekStart))
            .map((goal) => {
              const subject =
                goal.subjectId != null
                  ? subjectMap.get(goal.subjectId.toString())
                  : null;
              const label = subject ? subject.name : "Overall Target";
              const color = subject?.color || "var(--primary)";
              const target = Number(goal.targetMinutes);
              let actual = 0;
              if (goal.subjectId != null) {
                actual =
                  weeklyMinutes.bySubject.get(goal.subjectId.toString()) || 0;
              } else {
                actual = weeklyMinutes.total;
              }
              const pct = Math.min((actual / target) * 100, 100);
              const isCompleted = pct >= 100;

              return (
                <Card
                  key={goal.id.toString()}
                  className={cn(
                    "group relative overflow-hidden border-border/50 transition-all hover:shadow-lg",
                    isCompleted &&
                      "border-emerald-500/20 bg-emerald-500/[0.02]",
                  )}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full ring-2 ring-background shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                      <CardTitle className="text-xl font-serif">
                        {label}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeleteTarget(goal)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-2xl font-bold tracking-tight">
                            {formatDuration(actual)}
                          </p>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                            Completed
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm font-medium">
                            {formatDuration(target)}
                          </p>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                            Weekly Target
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="h-3 w-full rounded-full bg-muted overflow-hidden border border-border/30 p-0.5 shadow-inner">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-1000 ease-out shadow-sm",
                              isCompleted ? "bg-emerald-500" : "",
                            )}
                            style={{
                              width: `${pct}%`,
                              backgroundColor: isCompleted ? undefined : color,
                            }}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wider",
                              isCompleted
                                ? "text-emerald-600"
                                : "text-muted-foreground",
                            )}
                          >
                            {isCompleted
                              ? "Goal Achieved!"
                              : `${Math.round(pct)}% of target`}
                          </span>
                          {!isCompleted && (
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              {formatDuration(target - actual)} remaining
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}

      <AddGoalDialog open={addOpen} onOpenChange={setAddOpen} />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this goal?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
