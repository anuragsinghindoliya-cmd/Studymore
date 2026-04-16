import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";
import type React from "react";
import { ModeToggle } from "./ModeToggle";

interface NavbarProps {
  onLogin: () => void;
  isAuthenticated: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogin, isAuthenticated }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Timer className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-foreground">
            StudyTimer
          </span>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            How it Works
          </a>
          <a
            href="#stats"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Analytics
          </a>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button
            onClick={onLogin}
            variant={isAuthenticated ? "outline" : "default"}
            className="rounded-full px-6 font-semibold transition-all hover:scale-105 active:scale-95"
          >
            {isAuthenticated ? "Go to Dashboard" : "Connect Identity"}
          </Button>
        </div>
      </div>
    </nav>
  );
};
