import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserSettings {
    longBreakDuration: bigint;
    workDuration: bigint;
    sessionsBeforeLongBreak: bigint;
    shortBreakDuration: bigint;
}
export interface Session {
    id: bigint;
    startTime: bigint;
    duration: bigint;
    sessionType: string;
    subjectId: bigint;
}
export interface StudyStats {
    minutesPerSubject: Array<[bigint, bigint]>;
    longestStreak: bigint;
    currentStreak: bigint;
    totalMinutes: bigint;
}
export interface Subject {
    id: bigint;
    name: string;
    color: string;
}
export interface WeeklyGoal {
    id: bigint;
    targetMinutes: bigint;
    subjectId?: bigint;
    weekStart: bigint;
}
export interface UserProfile {
    name: string;
}
export interface backendInterface {
    addSubject(name: string, color: string): Promise<bigint>;
    deleteSession(id: bigint): Promise<void>;
    deleteSubject(id: bigint): Promise<void>;
    deleteWeeklyGoal(id: bigint): Promise<void>;
    getProfile(): Promise<UserProfile | null>;
    getSessions(): Promise<Array<Session>>;
    getSessionsByDateRange(start: bigint, finish: bigint): Promise<Array<Session>>;
    getSessionsBySubject(subjectId: bigint): Promise<Array<Session>>;
    getSettings(): Promise<UserSettings | null>;
    getStudyStats(): Promise<StudyStats>;
    getSubjects(): Promise<Array<Subject>>;
    getWeeklyGoals(): Promise<Array<WeeklyGoal>>;
    logSession(subjectId: bigint, startTime: bigint, duration: bigint, sessionType: string): Promise<bigint>;
    setProfile(name: string): Promise<void>;
    setSettings(workDuration: bigint, shortBreak: bigint, longBreak: bigint, sessionsBeforeLongBreak: bigint): Promise<void>;
    setWeeklyGoal(subjectId: bigint | null, targetMinutes: bigint, weekStart: bigint): Promise<bigint>;
    updateSubject(id: bigint, name: string, color: string): Promise<void>;
    updateWeeklyGoal(id: bigint, targetMinutes: bigint): Promise<void>;
}
