import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Session {
  'id' : bigint,
  'startTime' : bigint,
  'duration' : bigint,
  'sessionType' : string,
  'subjectId' : bigint,
}
export interface StudyStats {
  'minutesPerSubject' : Array<[bigint, bigint]>,
  'longestStreak' : bigint,
  'currentStreak' : bigint,
  'totalMinutes' : bigint,
}
export interface Subject { 'id' : bigint, 'name' : string, 'color' : string }
export interface UserProfile { 'name' : string }
export interface UserSettings {
  'longBreakDuration' : bigint,
  'workDuration' : bigint,
  'sessionsBeforeLongBreak' : bigint,
  'shortBreakDuration' : bigint,
}
export interface WeeklyGoal {
  'id' : bigint,
  'targetMinutes' : bigint,
  'subjectId' : [] | [bigint],
  'weekStart' : bigint,
}
export interface _SERVICE {
  'addSubject' : ActorMethod<[string, string], bigint>,
  'deleteSession' : ActorMethod<[bigint], undefined>,
  'deleteSubject' : ActorMethod<[bigint], undefined>,
  'deleteWeeklyGoal' : ActorMethod<[bigint], undefined>,
  'getProfile' : ActorMethod<[], [] | [UserProfile]>,
  'getSessions' : ActorMethod<[], Array<Session>>,
  'getSessionsByDateRange' : ActorMethod<[bigint, bigint], Array<Session>>,
  'getSessionsBySubject' : ActorMethod<[bigint], Array<Session>>,
  'getSettings' : ActorMethod<[], [] | [UserSettings]>,
  'getStudyStats' : ActorMethod<[], StudyStats>,
  'getSubjects' : ActorMethod<[], Array<Subject>>,
  'getWeeklyGoals' : ActorMethod<[], Array<WeeklyGoal>>,
  'logSession' : ActorMethod<[bigint, bigint, bigint, string], bigint>,
  'setProfile' : ActorMethod<[string], undefined>,
  'setSettings' : ActorMethod<[bigint, bigint, bigint, bigint], undefined>,
  'setWeeklyGoal' : ActorMethod<[[] | [bigint], bigint, bigint], bigint>,
  'updateSubject' : ActorMethod<[bigint, string, string], undefined>,
  'updateWeeklyGoal' : ActorMethod<[bigint, bigint], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
