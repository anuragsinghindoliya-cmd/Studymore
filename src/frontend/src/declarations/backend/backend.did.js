export const idlFactory = ({ IDL }) => {
  const UserProfile = IDL.Record({ 'name' : IDL.Text });
  const Session = IDL.Record({
    'id' : IDL.Nat,
    'startTime' : IDL.Int,
    'duration' : IDL.Nat,
    'sessionType' : IDL.Text,
    'subjectId' : IDL.Nat,
  });
  const UserSettings = IDL.Record({
    'longBreakDuration' : IDL.Nat,
    'workDuration' : IDL.Nat,
    'sessionsBeforeLongBreak' : IDL.Nat,
    'shortBreakDuration' : IDL.Nat,
  });
  const StudyStats = IDL.Record({
    'minutesPerSubject' : IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Nat)),
    'longestStreak' : IDL.Nat,
    'currentStreak' : IDL.Nat,
    'totalMinutes' : IDL.Nat,
  });
  const Subject = IDL.Record({
    'id' : IDL.Nat,
    'name' : IDL.Text,
    'color' : IDL.Text,
  });
  const WeeklyGoal = IDL.Record({
    'id' : IDL.Nat,
    'targetMinutes' : IDL.Nat,
    'subjectId' : IDL.Opt(IDL.Nat),
    'weekStart' : IDL.Int,
  });
  return IDL.Service({
    'addSubject' : IDL.Func([IDL.Text, IDL.Text], [IDL.Nat], []),
    'deleteSession' : IDL.Func([IDL.Nat], [], []),
    'deleteSubject' : IDL.Func([IDL.Nat], [], []),
    'deleteWeeklyGoal' : IDL.Func([IDL.Nat], [], []),
    'getProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'getSessions' : IDL.Func([], [IDL.Vec(Session)], ['query']),
    'getSessionsByDateRange' : IDL.Func(
        [IDL.Int, IDL.Int],
        [IDL.Vec(Session)],
        ['query'],
      ),
    'getSessionsBySubject' : IDL.Func([IDL.Nat], [IDL.Vec(Session)], ['query']),
    'getSettings' : IDL.Func([], [IDL.Opt(UserSettings)], ['query']),
    'getStudyStats' : IDL.Func([], [StudyStats], ['query']),
    'getSubjects' : IDL.Func([], [IDL.Vec(Subject)], ['query']),
    'getWeeklyGoals' : IDL.Func([], [IDL.Vec(WeeklyGoal)], ['query']),
    'logSession' : IDL.Func(
        [IDL.Nat, IDL.Int, IDL.Nat, IDL.Text],
        [IDL.Nat],
        [],
      ),
    'setProfile' : IDL.Func([IDL.Text], [], []),
    'setSettings' : IDL.Func([IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat], [], []),
    'setWeeklyGoal' : IDL.Func(
        [IDL.Opt(IDL.Nat), IDL.Nat, IDL.Int],
        [IDL.Nat],
        [],
      ),
    'updateSubject' : IDL.Func([IDL.Nat, IDL.Text, IDL.Text], [], []),
    'updateWeeklyGoal' : IDL.Func([IDL.Nat, IDL.Nat], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
