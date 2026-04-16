import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { AppSidebar } from "./components/AppSidebar";
import { LandingPage } from "./components/LandingPage";
import { PomodoroTimer } from "./components/PomodoroTimer";
import { ProfileSetupDialog } from "./components/ProfileSetupDialog";
import { SessionHistory } from "./components/SessionHistory";
import { Settings } from "./components/Settings";
import { StatsOverview } from "./components/StatsOverview";
import { SubjectList } from "./components/SubjectList";
import { WeeklyGoalsView } from "./components/WeeklyGoals";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetProfile } from "./hooks/useQueries";

type Tab = "timer" | "subjects" | "history" | "stats" | "goals" | "settings";

const App = () => {
  const { identity, login, clear, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useGetProfile();
  const [activeTab, setActiveTab] = useState<Tab>("timer");

  // Stage 1: Landing page (not authenticated)
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage onLogin={login} isAuthenticated={isAuthenticated} />
        <Toaster position="bottom-right" />
      </>
    );
  }

  // Loading profile
  if (profileLoading || isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <Toaster position="bottom-right" />
      </div>
    );
  }

  // Profile fetch failed
  if (profileError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-destructive">
          Failed to load profile. Please refresh.
        </p>
        <Toaster position="bottom-right" />
      </div>
    );
  }

  // Stage 2: Profile setup (authenticated but no profile)
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <ProfileSetupDialog open={true} onOpenChange={() => {}} />
        <Toaster position="bottom-right" />
      </div>
    );
  }

  // Stage 3: Main app
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          profileName={profile.name}
          onLogout={clear}
        />
        <SidebarInset>
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto max-w-5xl px-4 py-6 md:px-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {activeTab === "timer" && <PomodoroTimer />}
              {activeTab === "subjects" && <SubjectList />}
              {activeTab === "history" && <SessionHistory />}
              {activeTab === "stats" && <StatsOverview />}
              {activeTab === "goals" && <WeeklyGoalsView />}
              {activeTab === "settings" && <Settings />}
            </div>
          </main>
        </SidebarInset>
      </div>
      <Toaster position="bottom-right" />
    </SidebarProvider>
  );
};

export default App;
