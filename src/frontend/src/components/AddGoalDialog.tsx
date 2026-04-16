import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { startOfWeek } from "date-fns";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useGetSubjects, useSetWeeklyGoal } from "../hooks/useQueries";
import { toNanoseconds } from "../utils/formatting";

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddGoalDialog({ open, onOpenChange }: AddGoalDialogProps) {
  const [targetMinutes, setTargetMinutes] = useState("60");
  const [subjectId, setSubjectId] = useState<string>("global");
  const [error, setError] = useState("");
  const { data: subjects } = useGetSubjects();
  const { mutate: setGoal, isPending } = useSetWeeklyGoal();

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (open) {
      setTargetMinutes("60");
      setSubjectId("global");
    }
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = Number.parseInt(targetMinutes, 10);
    if (Number.isNaN(mins) || mins <= 0) {
      setError("Enter a valid number of minutes");
      return;
    }
    const weekStart = toNanoseconds(
      startOfWeek(new Date(), { weekStartsOn: 1 }),
    );
    setGoal(
      {
        subjectId: subjectId === "global" ? null : BigInt(subjectId),
        targetMinutes: BigInt(mins),
        weekStart,
      },
      {
        onSuccess: () => {
          toast.success("Goal set");
          onOpenChange(false);
        },
        onError: (err) => setError(err.message || "Failed to set goal"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Weekly Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">All Subjects (Global)</SelectItem>
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
            <div className="space-y-2">
              <Label htmlFor="target-minutes">Target (minutes per week)</Label>
              <Input
                id="target-minutes"
                type="number"
                min={1}
                value={targetMinutes}
                onChange={(e) => {
                  setTargetMinutes(e.target.value);
                  setError("");
                }}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Saving..." : "Set Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
