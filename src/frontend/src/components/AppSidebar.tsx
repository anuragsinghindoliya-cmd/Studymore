import {
  BarChart3,
  History,
  LogOut,
  Settings as SettingsIcon,
  Tags,
  Target,
  Timer,
  User,
} from "lucide-react";
import type * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ModeToggle } from "./ModeToggle";

type Tab = "timer" | "subjects" | "history" | "stats" | "goals" | "settings";

const NAV_ITEMS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "timer", label: "Focus Timer", icon: Timer },
  { id: "subjects", label: "Subjects", icon: Tags },
  { id: "history", label: "History", icon: History },
  { id: "stats", label: "Analytics", icon: BarChart3 },
  { id: "goals", label: "Weekly Goals", icon: Target },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

interface AppSidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  profileName?: string;
  onLogout: () => void;
}

export function AppSidebar({
  activeTab,
  setActiveTab,
  profileName,
  onLogout,
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 shrink-0">
            <Timer className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
            <span className="font-serif text-lg font-bold leading-none tracking-tight">
              StudyTimer
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
              Productivity
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 mb-2">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                    tooltip={item.label}
                    className="h-10 px-3 data-[active=true]:bg-primary/10 data-[active=true]:text-primary transition-all duration-200"
                  >
                    <item.icon className="size-4.5" />
                    <span className="font-medium">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2">
        <div className="flex flex-col gap-4">
          <Separator className="bg-border/40" />

          <div className="flex flex-col gap-3 group-data-[collapsible=icon]:items-center">
            <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden truncate">
              <Avatar className="h-9 w-9 border border-border/50 shadow-sm shrink-0">
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                <span className="text-sm font-semibold truncate leading-none">
                  {profileName || "User"}
                </span>
                <span className="text-[10px] text-muted-foreground truncate mt-1">
                  Active Student
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <ModeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                title="Sign out"
                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all active:scale-90"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
