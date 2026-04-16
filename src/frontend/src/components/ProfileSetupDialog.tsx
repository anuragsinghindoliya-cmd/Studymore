import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Timer } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useSetProfile } from "../hooks/useQueries";

interface ProfileSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSetupDialog({
  open,
  onOpenChange,
}: ProfileSetupDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { mutate: saveProfile, isPending } = useSetProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    saveProfile(
      { name: name.trim() },
      {
        onSuccess: () => {
          toast.success("Profile created");
          onOpenChange(false);
        },
        onError: (err) => {
          setError(err.message || "Failed to create profile");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/50 shadow-2xl">
        <div className="flex flex-col items-center pt-6 pb-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 mb-4 animate-bounce duration-1000">
            <Timer className="h-7 w-7 text-primary-foreground" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">
              Welcome to StudyTimer
            </DialogTitle>
            <DialogDescription className="text-base pt-1">
              Create your profile to start your journey towards focused
              productivity.
            </DialogDescription>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 pb-4">
          <div className="space-y-2 px-1">
            <Label
              htmlFor="name"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
            >
              Display Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              maxLength={100}
              className="h-12 border-border/50 focus:ring-primary/20 text-lg"
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </p>
            )}
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-full text-base font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isPending ? "Setting up..." : "Get Started"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
