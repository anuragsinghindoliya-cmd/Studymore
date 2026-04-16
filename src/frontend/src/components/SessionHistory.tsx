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
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { format, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { History, Loader2, Trash2 } from "lucide-react";
import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import type { Session } from "../backend";
import {
  useDeleteSession,
  useGetSessions,
  useGetSubjects,
} from "../hooks/useQueries";
import { formatDuration, fromNanoseconds } from "../utils/formatting";

type DateFilter = "all" | "today" | "week" | "month";

export function SessionHistory() {
  const { data: sessions, isLoading, isError } = useGetSessions();
  const { data: subjects } = useGetSubjects();
  const { mutate: deleteSession, isPending: isDeleting } = useDeleteSession();

  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null);

  const subjectMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    // biome-ignore lint/complexity/noForEach: existing code pattern
    subjects?.forEach((s) =>
      map.set(s.id.toString(), { name: s.name, color: s.color }),
    );
    return map;
  }, [subjects]);

  const filteredSessions = useMemo(() => {
    if (!sessions) return [];

    let filtered = [...sessions];

    // Date filter
    const now = new Date();
    if (dateFilter === "today") {
      const start = startOfDay(now);
      filtered = filtered.filter((s) => fromNanoseconds(s.startTime) >= start);
    } else if (dateFilter === "week") {
      const start = startOfWeek(now, { weekStartsOn: 1 });
      filtered = filtered.filter((s) => fromNanoseconds(s.startTime) >= start);
    } else if (dateFilter === "month") {
      const start = startOfMonth(now);
      filtered = filtered.filter((s) => fromNanoseconds(s.startTime) >= start);
    }

    // Subject filter
    if (subjectFilter !== "all") {
      filtered = filtered.filter(
        (s) => s.subjectId.toString() === subjectFilter,
      );
    }

    // Sort by most recent first
    filtered.sort((a, b) => Number(b.startTime - a.startTime));

    return filtered;
  }, [sessions, dateFilter, subjectFilter]);

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteSession(
      { id: deleteTarget.id },
      {
        onSuccess: () => {
          toast.success("Session deleted");
          setDeleteTarget(null);
        },
        onError: () => toast.error("Failed to delete session"),
      },
    );
  };

  if (isError) {
    return <div className="text-destructive">Failed to load sessions.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight font-serif">
            Session History
          </h2>
          <p className="text-muted-foreground text-sm">
            Review your past study and break sessions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={dateFilter}
            onValueChange={(v) => setDateFilter(v as DateFilter)}
          >
            <SelectTrigger className="w-36 h-10 border-border/50 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-40 h-10 border-border/50 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects?.map((s) => (
                <SelectItem key={s.id.toString()} value={s.id.toString()}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredSessions.length === 0 ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <History className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium">
              No sessions found for the selected filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
                  Date
                </TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
                  Subject
                </TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
                  Type
                </TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
                  Duration
                </TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => {
                const subject = subjectMap.get(session.subjectId.toString());
                const date = fromNanoseconds(session.startTime);
                return (
                  <TableRow
                    key={session.id.toString()}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="text-sm font-medium">
                      {format(date, "MMM d, yyyy")}
                      <span className="ml-2 text-xs text-muted-foreground font-normal">
                        {format(date, "h:mm a")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        {subject ? (
                          <>
                            <div
                              className="h-2 w-2 rounded-full ring-2 ring-background shadow-sm"
                              style={{ backgroundColor: subject.color }}
                            />
                            <span className="text-sm font-semibold">
                              {subject.name}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">
                            Unknown
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          session.sessionType === "work"
                            ? "bg-primary/10 text-primary"
                            : "bg-emerald-500/10 text-emerald-600",
                        )}
                      >
                        {session.sessionType}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-mono font-medium text-muted-foreground">
                      {formatDuration(Number(session.duration))}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteTarget(session)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this session?</AlertDialogTitle>
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
