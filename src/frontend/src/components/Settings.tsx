import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useGetSettings, useSetSettings } from "../hooks/useQueries";
import {
  DEFAULT_LONG_BREAK,
  DEFAULT_SESSIONS_BEFORE_LONG_BREAK,
  DEFAULT_SHORT_BREAK,
  DEFAULT_WORK_DURATION,
} from "../utils/constants";

export function Settings() {
  const { data: settings, isLoading, isError } = useGetSettings();
  const { mutate: saveSettings, isPending } = useSetSettings();

  const [workDuration, setWorkDuration] = useState(
    DEFAULT_WORK_DURATION.toString(),
  );
  const [shortBreak, setShortBreak] = useState(DEFAULT_SHORT_BREAK.toString());
  const [longBreak, setLongBreak] = useState(DEFAULT_LONG_BREAK.toString());
  const [sessionsBeforeLong, setSessionsBeforeLong] = useState(
    DEFAULT_SESSIONS_BEFORE_LONG_BREAK.toString(),
  );

  useEffect(() => {
    if (settings) {
      setWorkDuration(settings.workDuration.toString());
      setShortBreak(settings.shortBreakDuration.toString());
      setLongBreak(settings.longBreakDuration.toString());
      setSessionsBeforeLong(settings.sessionsBeforeLongBreak.toString());
    }
  }, [settings]);

  const handleSave = () => {
    const work = Number.parseInt(workDuration, 10);
    const short = Number.parseInt(shortBreak, 10);
    const long = Number.parseInt(longBreak, 10);
    const sessions = Number.parseInt(sessionsBeforeLong, 10);

    if ([work, short, long, sessions].some((v) => Number.isNaN(v) || v <= 0)) {
      toast.error("All values must be greater than zero");
      return;
    }

    saveSettings(
      {
        workDuration: BigInt(work),
        shortBreak: BigInt(short),
        longBreak: BigInt(long),
        sessionsBeforeLongBreak: BigInt(sessions),
      },
      {
        onSuccess: () => toast.success("Settings saved"),
        onError: (err) => toast.error(err.message || "Failed to save settings"),
      },
    );
  };

  if (isError) {
    return <div className="text-destructive">Failed to load settings.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight font-serif">
          Settings
        </h2>
        <p className="text-muted-foreground text-sm">
          Personalize your study experience and timer intervals.
        </p>
      </div>

      <Card className="max-w-2xl border-border/50 shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <CardTitle className="font-serif text-xl">
            Timer Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="work-duration"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Work Duration
                </Label>
                <div className="relative">
                  <Input
                    id="work-duration"
                    type="number"
                    min={1}
                    max={120}
                    value={workDuration}
                    onChange={(e) => setWorkDuration(e.target.value)}
                    className="h-11 pr-12 border-border/50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                    min
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Standard is 25 minutes.
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="short-break"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Short Break
                </Label>
                <div className="relative">
                  <Input
                    id="short-break"
                    type="number"
                    min={1}
                    max={60}
                    value={shortBreak}
                    onChange={(e) => setShortBreak(e.target.value)}
                    className="h-11 pr-12 border-border/50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                    min
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Standard is 5 minutes.
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="long-break"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Long Break
                </Label>
                <div className="relative">
                  <Input
                    id="long-break"
                    type="number"
                    min={1}
                    max={60}
                    value={longBreak}
                    onChange={(e) => setLongBreak(e.target.value)}
                    className="h-11 pr-12 border-border/50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                    min
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Standard is 15 minutes.
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="sessions-before"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Cycle Length
                </Label>
                <div className="relative">
                  <Input
                    id="sessions-before"
                    type="number"
                    min={1}
                    max={10}
                    value={sessionsBeforeLong}
                    onChange={(e) => setSessionsBeforeLong(e.target.value)}
                    className="h-11 pr-12 border-border/50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                    sets
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Sessions before a long break.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border/50">
              <Button
                onClick={handleSave}
                disabled={isPending}
                className="w-full h-11 rounded-full shadow-lg shadow-primary/20 font-bold"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Saving Changes..." : "Save Configuration"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
