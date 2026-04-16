import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  useGetSettings,
  useGetSubjects,
  useLogSession,
} from "../hooks/useQueries";
import {
  DEFAULT_LONG_BREAK,
  DEFAULT_SESSIONS_BEFORE_LONG_BREAK,
  DEFAULT_SHORT_BREAK,
  DEFAULT_WORK_DURATION,
} from "../utils/constants";
import { formatTimer, toNanoseconds } from "../utils/formatting";

type TimerPhase = "work" | "shortBreak" | "longBreak";

export function PomodoroTimer() {
  const { data: subjects, isError: subjectsError } = useGetSubjects();
  const { data: settings, isError: settingsError } = useGetSettings();
  const { mutate: logSession } = useLogSession();

  const workDuration = settings
    ? Number(settings.workDuration)
    : DEFAULT_WORK_DURATION;
  const shortBreak = settings
    ? Number(settings.shortBreakDuration)
    : DEFAULT_SHORT_BREAK;
  const longBreak = settings
    ? Number(settings.longBreakDuration)
    : DEFAULT_LONG_BREAK;
  const maxSessions = settings
    ? Number(settings.sessionsBeforeLongBreak)
    : DEFAULT_SESSIONS_BEFORE_LONG_BREAK;

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [phase, setPhase] = useState<TimerPhase>("work");
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const sessionStartRef = useRef<Date | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const handlePhaseCompleteRef = useRef<() => void>(() => {});
  const workSecondsRef = useRef(0);
  const justExpiredRef = useRef(false);

  const phaseDuration = useCallback(() => {
    switch (phase) {
      case "work":
        return workDuration * 60;
      case "shortBreak":
        return shortBreak * 60;
      case "longBreak":
        return longBreak * 60;
    }
  }, [phase, workDuration, shortBreak, longBreak]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (isRunning) return;
    setTimeLeft(phaseDuration());
  }, [workDuration, shortBreak, longBreak]);

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (phase === "work") workSecondsRef.current += 1;
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          justExpiredRef.current = true;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, phase]);

  useEffect(() => {
    if (timeLeft === 0 && justExpiredRef.current) {
      justExpiredRef.current = false;
      handlePhaseCompleteRef.current();
    }
  }, [timeLeft]);

  const handlePhaseComplete = useCallback(() => {
    setIsRunning(false);

    // Play notification sound
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1000;
        gain2.gain.value = 0.3;
        osc2.start();
        osc2.stop(ctx.currentTime + 0.3);
      }, 350);
    } catch {
      // Audio not available
    }

    if (phase === "work") {
      // Log the session
      if (selectedSubjectId && sessionStartRef.current) {
        const startNanos = toNanoseconds(sessionStartRef.current);
        logSession(
          {
            subjectId: BigInt(selectedSubjectId),
            startTime: startNanos,
            duration: BigInt(
              Math.max(1, Math.round(workSecondsRef.current / 60)),
            ),
            sessionType: "work",
          },
          {
            onSuccess: () => toast.success("Session logged!"),
            onError: (err) =>
              toast.error(err.message || "Failed to log session"),
          },
        );
      }
      sessionStartRef.current = null;
      workSecondsRef.current = 0;

      const newCompleted = completedSessions + 1;
      setCompletedSessions(newCompleted);

      if (newCompleted % maxSessions === 0) {
        setPhase("longBreak");
        setTimeLeft(longBreak * 60);
        toast.success("Great work! Time for a long break.");
      } else {
        setPhase("shortBreak");
        setTimeLeft(shortBreak * 60);
        toast.success("Session complete! Take a short break.");
      }
    } else {
      setPhase("work");
      setTimeLeft(workDuration * 60);
      toast("Break over! Ready for the next session.");
    }
  }, [
    phase,
    selectedSubjectId,
    completedSessions,
    workDuration,
    shortBreak,
    longBreak,
    maxSessions,
    logSession,
  ]);

  handlePhaseCompleteRef.current = handlePhaseComplete;

  const handleStart = () => {
    if (phase === "work" && !selectedSubjectId) {
      toast.error("Please select a subject first");
      return;
    }
    if (!isRunning && phase === "work" && !sessionStartRef.current) {
      sessionStartRef.current = new Date();
      workSecondsRef.current = 0;
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(phaseDuration());
    sessionStartRef.current = null;
    workSecondsRef.current = 0;
  };

  const handleSkip = () => {
    setIsRunning(false);
    if (phase === "work") {
      workSecondsRef.current = 0;
      const newCompleted = completedSessions + 1;
      setCompletedSessions(newCompleted);
      if (newCompleted % maxSessions === 0) {
        setPhase("longBreak");
        setTimeLeft(longBreak * 60);
      } else {
        setPhase("shortBreak");
        setTimeLeft(shortBreak * 60);
      }
    } else {
      setPhase("work");
      setTimeLeft(workDuration * 60);
    }
    sessionStartRef.current = null;
  };

  // Keyboard shortcut
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        if (isRunning) {
          handlePause();
        } else {
          handleStart();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isRunning, selectedSubjectId, phase]);

  if (subjectsError || settingsError) {
    return (
      <div className="py-4 text-destructive">Failed to load timer data.</div>
    );
  }

  const total = phaseDuration();
  const progress = total > 0 ? ((total - timeLeft) / total) * 100 : 0;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const phaseLabel =
    phase === "work"
      ? "Focus"
      : phase === "shortBreak"
        ? "Short Break"
        : "Long Break";
  const sessionInCycle =
    (completedSessions % maxSessions) + (phase === "work" ? 1 : 0);

  return (
    <div className="flex flex-col items-center gap-10 py-4 sm:py-8">
      {/* Subject selector */}
      <div className="w-full max-w-xs space-y-2">
        {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
          Current Subject
        </label>
        <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
          <SelectTrigger className="h-12 border-border/50 bg-card shadow-sm transition-all hover:border-primary/50 focus:ring-primary/20">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects?.map((s) => (
              <SelectItem key={s.id.toString()} value={s.id.toString()}>
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-3 w-3 rounded-full ring-2 ring-background shadow-sm"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="font-medium">{s.name}</span>
                </div>
              </SelectItem>
            ))}
            {(!subjects || subjects.length === 0) && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No subjects yet. Add one first.
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Timer circle container */}
      <div className="relative group">
        {/* Glow effect */}
        <div
          className={cn(
            "absolute inset-0 -z-10 rounded-full blur-3xl opacity-20 transition-all duration-1000",
            phase === "work" ? "bg-primary" : "bg-emerald-500",
            isRunning ? "scale-110" : "scale-100",
          )}
        />

        <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80 rounded-full bg-card border border-border/50 shadow-2xl">
          <svg
            aria-hidden="true"
            className="absolute inset-0 -rotate-90"
            viewBox="0 0 260 260"
          >
            <circle
              cx="130"
              cy="130"
              r="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted/20"
            />
            <circle
              cx="130"
              cy="130"
              r="120"
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={cn(
                "transition-all duration-1000 ease-linear drop-shadow-sm",
                phase === "work" ? "stroke-primary" : "stroke-emerald-500",
              )}
            />
          </svg>

          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-6xl font-bold tracking-tight sm:text-7xl tabular-nums">
              {formatTimer(timeLeft)}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                  phase === "work"
                    ? "bg-primary/10 text-primary"
                    : "bg-emerald-500/10 text-emerald-600",
                )}
              >
                {phaseLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Info */}
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        {/* Session dots */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Progress
          </span>
          <div className="flex gap-2.5">
            {Array.from({ length: maxSessions }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                key={i}
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-all duration-500 ring-2 ring-background",
                  i < completedSessions % maxSessions
                    ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)] scale-110"
                    : i === completedSessions % maxSessions &&
                        phase === "work" &&
                        isRunning
                      ? "bg-primary/40 animate-pulse"
                      : "bg-muted-foreground/20",
                )}
              />
            ))}
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            Session {sessionInCycle} of {maxSessions}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            title="Reset"
            className="h-11 w-11 rounded-full border-border/50 bg-card shadow-sm hover:bg-accent transition-all active:scale-90 active:rotate-[-45deg]"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>

          {isRunning ? (
            <Button
              size="lg"
              onClick={handlePause}
              className="h-20 w-20 rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90"
            >
              <Pause className="h-8 w-8" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleStart}
              className="h-20 w-20 rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90"
            >
              <Play className="h-8 w-8 ml-1" />
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={handleSkip}
            title="Skip"
            className="h-11 w-11 rounded-full border-border/50 bg-card shadow-sm hover:bg-accent transition-all active:scale-90 active:translate-x-1"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest bg-muted/50 px-3 py-1 rounded-full border border-border/30">
          Space to {isRunning ? "Pause" : "Start"}
        </p>
      </div>
    </div>
  );
}
