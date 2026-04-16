import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  Coffee,
  ShieldCheck,
  Tags,
  Target,
  Timer,
  Zap,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Navbar } from "./Navbar";

interface LandingPageProps {
  onLogin: () => void;
  isAuthenticated: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLogin,
  isAuthenticated,
}) => {
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Entrance animations should only run once on mount.
    // We remove the animation classes after they finish (max 1.7s) to prevent re-triggering on theme toggle.
    const timer = setTimeout(() => setHasAnimated(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const getEntranceAnim = (delay: string) =>
    hasAnimated
      ? ""
      : cn("animate-in fade-in slide-in-from-bottom-4 duration-1000", delay);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/10 selection:text-primary">
      <Navbar onLogin={onLogin} isAuthenticated={isAuthenticated} />

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 pt-20 pb-24 sm:px-6 lg:pt-32 lg:pb-40">
          {/* Background Accents */}
          <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[600px] w-full -translate-x-1/2 overflow-hidden blur-3xl">
            <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-primary/10 animate-pulse" />
            <div className="absolute top-20 right-1/4 h-96 w-96 rounded-full bg-blue-500/10 animate-pulse duration-[3000ms]" />
          </div>

          <div className="container mx-auto max-w-6xl text-center">
            <div
              className={cn(
                "mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm",
                getEntranceAnim("delay-0"),
              )}
            >
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold tracking-wider text-primary uppercase">
                Productivity on the Blockchain
              </span>
            </div>
            <h1
              className={cn(
                "mx-auto mb-8 max-w-4xl font-serif text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl",
                getEntranceAnim("delay-200"),
              )}
            >
              Master Your Time, <br />
              <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Conquer Your Goals.
              </span>
            </h1>
            <p
              className={cn(
                "mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl",
                getEntranceAnim("delay-300"),
              )}
            >
              StudyTimer combines the proven Pomodoro technique with
              transparent, on-chain tracking to help you maintain deep focus and
              achieve your academic milestones.
            </p>
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-4 sm:flex-row",
                getEntranceAnim("delay-500"),
              )}
            >
              <Button
                size="lg"
                onClick={onLogin}
                className="group h-12 rounded-full px-8 text-base font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
              >
                {isAuthenticated ? "Enter Dashboard" : "Get Started Now"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full px-8 text-base font-semibold transition-all hover:bg-muted/50 active:scale-95"
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore Features
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-16 text-center lg:mb-24">
              <h2 className="mb-4 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to focus.
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                StudyTimer provides a comprehensive suite of tools designed to
                minimize distractions and maximize your study output.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Pomodoro Perfection",
                  description:
                    "Fully customizable work and break intervals to match your flow.",
                  icon: Timer,
                  color: "text-blue-500",
                  bg: "bg-blue-500/10",
                },
                {
                  title: "Subject Smart Tags",
                  description:
                    "Organize your sessions by subject and see exactly where your time goes.",
                  icon: Tags,
                  color: "text-purple-500",
                  bg: "bg-purple-500/10",
                },
                {
                  title: "Weekly Milestones",
                  description:
                    "Set ambitious weekly goals and track your progress in real-time.",
                  icon: Target,
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/10",
                },
                {
                  title: "Streak Tracking",
                  description:
                    "Build habits that last with visual streaks and motivational rewards.",
                  icon: Zap,
                  color: "text-amber-500",
                  bg: "bg-amber-500/10",
                },
              ].map((feature, i) => (
                <Card
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                  key={i}
                  className="group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 border-border/50"
                >
                  <div
                    className={cn(
                      "absolute top-0 left-0 h-1 w-full opacity-0 transition-opacity group-hover:opacity-100",
                      feature.bg.replace("/10", "/40"),
                    )}
                  />
                  <CardHeader>
                    <div
                      className={cn(
                        "mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                        feature.bg,
                        feature.color,
                      )}
                    >
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl font-bold">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section
          id="how-it-works"
          className="relative bg-muted/30 py-24 sm:py-32"
        >
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-16 flex flex-col items-center justify-between gap-8 md:flex-row md:items-end">
              <div className="max-w-xl">
                <h2 className="mb-4 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                  Simple, effective workflow.
                </h2>
                <p className="text-lg text-muted-foreground">
                  Get started in seconds and start tracking your journey to
                  mastery.
                </p>
              </div>
              <Button
                variant="ghost"
                className="group text-primary font-semibold"
              >
                Learn more about Pomodoro
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            <div className="grid gap-12 lg:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Connect Identity",
                  description:
                    "Securely sign in using Internet Identity. No passwords, just pure decentralized access.",
                  icon: ShieldCheck,
                },
                {
                  step: "02",
                  title: "Start a Session",
                  description:
                    "Choose your subject, set your timer, and enter a state of deep focus.",
                  icon: Brain,
                },
                {
                  step: "03",
                  title: "Review & Improve",
                  description:
                    "Analyze your study patterns and adjust your schedule for maximum efficiency.",
                  icon: BarChart3,
                },
              ].map((step, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                <div key={i} className="relative">
                  <div className="mb-6 text-6xl font-bold tracking-tighter text-primary/10">
                    {step.step}
                  </div>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Blockchain Benefits Section */}
        <section className="py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-blue-500/5 p-8 sm:p-12 lg:p-16">
              <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                <div>
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h2 className="mb-6 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                    Your Data, <br />
                    Your Ownership.
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                    Unlike traditional apps, StudyTimer is built on the Internet
                    Computer. Your study history and goals are stored securely
                    on the blockchain, ensuring transparency, censorship
                    resistance, and total data ownership.
                  </p>
                  <ul className="space-y-4">
                    {[
                      "Fully on-chain storage",
                      "Privacy-first authentication",
                      "Verifiable study records",
                      "Community-driven development",
                    ].map((item, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 -z-10 rounded-full bg-primary/10 blur-3xl" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4 pt-8">
                      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
                        <Coffee className="mb-3 h-6 w-6 text-primary" />
                        <div className="text-2xl font-bold">Deep Work</div>
                        <div className="text-xs text-muted-foreground uppercase">
                          Mindset
                        </div>
                      </div>
                      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
                        <Target className="mb-3 h-6 w-6 text-emerald-500" />
                        <div className="text-2xl font-bold">Clear Goals</div>
                        <div className="text-xs text-muted-foreground uppercase">
                          Vision
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
                        <Zap className="mb-3 h-6 w-6 text-amber-500" />
                        <div className="text-2xl font-bold">High Energy</div>
                        <div className="text-xs text-muted-foreground uppercase">
                          Flow
                        </div>
                      </div>
                      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
                        <ShieldCheck className="mb-3 h-6 w-6 text-blue-500" />
                        <div className="text-2xl font-bold">Secure</div>
                        <div className="text-xs text-muted-foreground uppercase">
                          On-Chain
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pb-24 sm:pb-32">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col items-center rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground shadow-2xl shadow-primary/20">
              <h2 className="mb-6 font-serif text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Ready to transform your study habits?
              </h2>
              <p className="mb-10 max-w-xl text-lg opacity-90 sm:text-xl">
                Join hundreds of students mastering their productivity on the
                Internet Computer.
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={onLogin}
                className="h-14 rounded-full px-10 text-lg font-bold shadow-lg transition-all hover:scale-105"
              >
                Start Your First Session
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-12">
        <div className="container mx-auto px-4 text-center sm:px-6">
          <div className="mb-8 flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Timer className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-bold tracking-tight">
              StudyTimer
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} StudyTimer. Built on the Internet
            Computer.
          </p>
        </div>
      </footer>
    </div>
  );
};
