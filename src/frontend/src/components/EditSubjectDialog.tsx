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
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Subject } from "../backend";
import { useUpdateSubject } from "../hooks/useQueries";
import { SUBJECT_COLORS } from "../utils/constants";

interface EditSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject | null;
}

export function EditSubjectDialog({
  open,
  onOpenChange,
  subject,
}: EditSubjectDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(SUBJECT_COLORS[0]);
  const [error, setError] = useState("");
  const { mutate: updateSubject, isPending } = useUpdateSubject();

  useEffect(() => {
    if (open && subject) {
      setName(subject.name);
      setColor(subject.color);
      setError("");
    }
  }, [open, subject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) return;
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    updateSubject(
      { id: subject.id, name: name.trim(), color },
      {
        onSuccess: () => {
          toast.success("Subject updated");
          onOpenChange(false);
        },
        onError: (err) => setError(err.message || "Failed to update subject"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Subject</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-subject-name">Name</Label>
              <Input
                id="edit-subject-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                maxLength={100}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {SUBJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                      color === c
                        ? "border-foreground scale-110"
                        : "border-transparent",
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
