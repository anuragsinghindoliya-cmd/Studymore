import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Int "mo:core/Int";
import Time "mo:core/Time";

actor {

  // Types

  type Subject = {
    id : Nat;
    name : Text;
    color : Text;
  };

  type Session = {
    id : Nat;
    subjectId : Nat;
    startTime : Int;
    duration : Nat;
    sessionType : Text;
  };

  type WeeklyGoal = {
    id : Nat;
    subjectId : ?Nat;
    targetMinutes : Nat;
    weekStart : Int;
  };

  type UserSettings = {
    workDuration : Nat;
    shortBreakDuration : Nat;
    longBreakDuration : Nat;
    sessionsBeforeLongBreak : Nat;
  };

  type UserProfile = {
    name : Text;
  };

  type StudyStats = {
    totalMinutes : Nat;
    minutesPerSubject : [(Nat, Nat)];
    currentStreak : Nat;
    longestStreak : Nat;
  };

  // State

  var userProfiles : Map.Map<Principal, UserProfile> = Map.empty();
  var userSubjects : Map.Map<Principal, Map.Map<Nat, Subject>> = Map.empty();
  var userSessions : Map.Map<Principal, Map.Map<Nat, Session>> = Map.empty();
  var userGoals : Map.Map<Principal, Map.Map<Nat, WeeklyGoal>> = Map.empty();
  var userSettings : Map.Map<Principal, UserSettings> = Map.empty();

  var userNextSubjectId : Map.Map<Principal, Nat> = Map.empty();
  var userNextSessionId : Map.Map<Principal, Nat> = Map.empty();
  var userNextGoalId : Map.Map<Principal, Nat> = Map.empty();

  // Constants

  let NANOS_PER_DAY : Int = 86_400_000_000_000;
  let MAX_SUBJECTS : Nat = 50;
  let MAX_SESSIONS : Nat = 10_000;
  let MAX_GOALS : Nat = 200;
  let MAX_DURATION_MINUTES : Nat = 1_440;
  let MAX_TARGET_MINUTES : Nat = 10_080;
  let MAX_SETTING_DURATION : Nat = 480;
  let MAX_SESSIONS_BEFORE_LONG_BREAK : Nat = 20;
  let MIN_TIMESTAMP : Int = 1_000_000_000_000_000_000; // ~2001-09-09 in nanos

  let DEFAULT_SUBJECTS : [(Text, Text)] = [
    ("Math", "#3B82F6"),
    ("Science", "#10B981"),
    ("English", "#F59E0B"),
    ("History", "#EF4444"),
    ("Computer Science", "#8B5CF6"),
  ];

  // Helpers

  func requireAuth(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Not authenticated");
    };
  };

  func getMap<V>(store : Map.Map<Principal, Map.Map<Nat, V>>, user : Principal) : Map.Map<Nat, V> {
    switch (store.get(user)) {
      case (?m) { m };
      case (null) {
        let m = Map.empty<Nat, V>();
        store.add(user, m);
        m;
      };
    };
  };

  func getUserSubjects(u : Principal) : Map.Map<Nat, Subject> {
    getMap(userSubjects, u);
  };
  func getUserSessions(u : Principal) : Map.Map<Nat, Session> {
    getMap(userSessions, u);
  };
  func getUserGoals(u : Principal) : Map.Map<Nat, WeeklyGoal> {
    getMap(userGoals, u);
  };

  func dayIndex(nanos : Int) : Int {
    // Floor division to avoid two calendar days mapping to day 0
    if (nanos >= 0) { nanos / NANOS_PER_DAY } else {
      (nanos - NANOS_PER_DAY + 1) / NANOS_PER_DAY;
    };
  };

  func validateTimestamp(ts : Int) {
    if (ts < MIN_TIMESTAMP) {
      Runtime.trap("Timestamp is too far in the past");
    };
    if (ts > Time.now() + NANOS_PER_DAY) {
      Runtime.trap("Timestamp cannot be in the future");
    };
  };

  func nextIdFor(store : Map.Map<Principal, Nat>, user : Principal) : Nat {
    let id = switch (store.get(user)) {
      case (?n) { n };
      case (null) { 0 };
    };
    store.add(user, id + 1);
    id;
  };

  func getNextSubjectId(user : Principal) : Nat {
    nextIdFor(userNextSubjectId, user);
  };
  func getNextSessionId(user : Principal) : Nat {
    nextIdFor(userNextSessionId, user);
  };
  func getNextGoalId(user : Principal) : Nat { nextIdFor(userNextGoalId, user) };

  // Endpoints — Profile

  public query ({ caller }) func getProfile() : async ?UserProfile {
    requireAuth(caller);
    userProfiles.get(caller);
  };

  public shared ({ caller }) func setProfile(name : Text) : async () {
    requireAuth(caller);
    if (name == "") {
      Runtime.trap("Name cannot be empty");
    };
    if (name.size() > 100) {
      Runtime.trap("Name must be 100 characters or fewer");
    };
    let isNewUser = userProfiles.get(caller) == null;
    userProfiles.add(caller, { name });
    if (isNewUser) {
      for ((subjectName, color) in DEFAULT_SUBJECTS.vals()) {
        let id = getNextSubjectId(caller);
        getUserSubjects(caller).add(id, { id; name = subjectName; color });
      };
    };
  };

  // Endpoints — Subjects

  public shared ({ caller }) func addSubject(name : Text, color : Text) : async Nat {
    requireAuth(caller);
    if (name == "") {
      Runtime.trap("Subject name cannot be empty");
    };
    if (name.size() > 100) {
      Runtime.trap("Subject name must be 100 characters or fewer");
    };
    if (color == "") {
      Runtime.trap("Color cannot be empty");
    };
    if (color.size() > 20) {
      Runtime.trap("Color must be 20 characters or fewer");
    };
    if (getUserSubjects(caller).size() >= MAX_SUBJECTS) {
      Runtime.trap("Maximum 50 subjects per user");
    };
    let id = getNextSubjectId(caller);
    getUserSubjects(caller).add(id, { id; name; color });
    id;
  };

  public shared ({ caller }) func updateSubject(id : Nat, name : Text, color : Text) : async () {
    requireAuth(caller);
    if (name == "") {
      Runtime.trap("Subject name cannot be empty");
    };
    if (name.size() > 100) {
      Runtime.trap("Subject name must be 100 characters or fewer");
    };
    if (color == "") {
      Runtime.trap("Color cannot be empty");
    };
    if (color.size() > 20) {
      Runtime.trap("Color must be 20 characters or fewer");
    };
    let subjects = getUserSubjects(caller);
    switch (subjects.get(id)) {
      case (null) { Runtime.trap("Subject not found") };
      case (?_) { subjects.add(id, { id; name; color }) };
    };
  };

  public shared ({ caller }) func deleteSubject(id : Nat) : async () {
    requireAuth(caller);
    let subjects = getUserSubjects(caller);
    switch (subjects.get(id)) {
      case (null) { Runtime.trap("Subject not found") };
      case (?_) {
        subjects.remove(id);

        // Remove orphaned goals
        let goalsToRemove = List.empty<Nat>();
        let goals = getUserGoals(caller);
        for ((gid, g) in goals.entries()) {
          switch (g.subjectId) {
            case (?sid) {
              if (sid == id) { goalsToRemove.add(gid) };
            };
            case (null) {};
          };
        };
        for (gid in goalsToRemove.values()) {
          goals.remove(gid);
        };

        // Remove orphaned sessions
        let sessionsToRemove = List.empty<Nat>();
        let sessions = getUserSessions(caller);
        for ((sid, s) in sessions.entries()) {
          if (s.subjectId == id) { sessionsToRemove.add(sid) };
        };
        for (sid in sessionsToRemove.values()) {
          sessions.remove(sid);
        };
      };
    };
  };

  public query ({ caller }) func getSubjects() : async [Subject] {
    requireAuth(caller);
    let result = List.empty<Subject>();
    for ((_, s) in getUserSubjects(caller).entries()) {
      result.add(s);
    };
    result.toArray();
  };

  // Endpoints — Sessions

  public shared ({ caller }) func logSession(subjectId : Nat, startTime : Int, duration : Nat, sessionType : Text) : async Nat {
    requireAuth(caller);
    if (duration == 0) {
      Runtime.trap("Duration must be greater than zero");
    };
    if (duration > MAX_DURATION_MINUTES) {
      Runtime.trap("Duration cannot exceed 1440 minutes");
    };
    if (sessionType != "work" and sessionType != "break") {
      Runtime.trap("Session type must be 'work' or 'break'");
    };
    validateTimestamp(startTime);
    switch (getUserSubjects(caller).get(subjectId)) {
      case (null) { Runtime.trap("Subject not found") };
      case (?_) {};
    };
    if (getUserSessions(caller).size() >= MAX_SESSIONS) {
      Runtime.trap("Maximum 10,000 sessions per user");
    };
    let id = getNextSessionId(caller);
    getUserSessions(caller).add(id, { id; subjectId; startTime; duration; sessionType });
    id;
  };

  public shared ({ caller }) func deleteSession(id : Nat) : async () {
    requireAuth(caller);
    let sessions = getUserSessions(caller);
    switch (sessions.get(id)) {
      case (null) { Runtime.trap("Session not found") };
      case (?_) { sessions.remove(id) };
    };
  };

  public query ({ caller }) func getSessions() : async [Session] {
    requireAuth(caller);
    let result = List.empty<Session>();
    for ((_, s) in getUserSessions(caller).entries()) {
      result.add(s);
    };
    result.toArray();
  };

  public query ({ caller }) func getSessionsBySubject(subjectId : Nat) : async [Session] {
    requireAuth(caller);
    let result = List.empty<Session>();
    for ((_, s) in getUserSessions(caller).entries()) {
      if (s.subjectId == subjectId) {
        result.add(s);
      };
    };
    result.toArray();
  };

  public query ({ caller }) func getSessionsByDateRange(start : Int, finish : Int) : async [Session] {
    requireAuth(caller);
    let result = List.empty<Session>();
    for ((_, s) in getUserSessions(caller).entries()) {
      if (s.startTime >= start and s.startTime <= finish) {
        result.add(s);
      };
    };
    result.toArray();
  };

  // Endpoints — Weekly Goals

  public shared ({ caller }) func setWeeklyGoal(subjectId : ?Nat, targetMinutes : Nat, weekStart : Int) : async Nat {
    requireAuth(caller);
    if (targetMinutes == 0) {
      Runtime.trap("Target minutes must be greater than zero");
    };
    if (targetMinutes > MAX_TARGET_MINUTES) {
      Runtime.trap("Target cannot exceed 10080 minutes per week");
    };
    validateTimestamp(weekStart);
    switch (subjectId) {
      case (?sid) {
        switch (getUserSubjects(caller).get(sid)) {
          case (null) { Runtime.trap("Subject not found") };
          case (?_) {};
        };
      };
      case (null) {};
    };
    for ((_, g) in getUserGoals(caller).entries()) {
      if (g.subjectId == subjectId and g.weekStart == weekStart) {
        Runtime.trap("A goal for this subject and week already exists");
      };
    };
    if (getUserGoals(caller).size() >= MAX_GOALS) {
      Runtime.trap("Maximum 200 goals per user");
    };
    let id = getNextGoalId(caller);
    getUserGoals(caller).add(id, { id; subjectId; targetMinutes; weekStart });
    id;
  };

  public shared ({ caller }) func updateWeeklyGoal(id : Nat, targetMinutes : Nat) : async () {
    requireAuth(caller);
    if (targetMinutes == 0) {
      Runtime.trap("Target minutes must be greater than zero");
    };
    if (targetMinutes > MAX_TARGET_MINUTES) {
      Runtime.trap("Target cannot exceed 10080 minutes per week");
    };
    let goals = getUserGoals(caller);
    switch (goals.get(id)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?g) {
        goals.add(
          id,
          {
            id;
            subjectId = g.subjectId;
            targetMinutes;
            weekStart = g.weekStart;
          },
        );
      };
    };
  };

  public shared ({ caller }) func deleteWeeklyGoal(id : Nat) : async () {
    requireAuth(caller);
    let goals = getUserGoals(caller);
    switch (goals.get(id)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?_) { goals.remove(id) };
    };
  };

  public query ({ caller }) func getWeeklyGoals() : async [WeeklyGoal] {
    requireAuth(caller);
    let result = List.empty<WeeklyGoal>();
    for ((_, g) in getUserGoals(caller).entries()) {
      result.add(g);
    };
    result.toArray();
  };

  // Endpoints — Settings

  public shared ({ caller }) func setSettings(workDuration : Nat, shortBreak : Nat, longBreak : Nat, sessionsBeforeLongBreak : Nat) : async () {
    requireAuth(caller);
    if (workDuration == 0 or shortBreak == 0 or longBreak == 0 or sessionsBeforeLongBreak == 0) {
      Runtime.trap("All durations must be greater than zero");
    };
    if (workDuration > MAX_SETTING_DURATION or shortBreak > MAX_SETTING_DURATION or longBreak > MAX_SETTING_DURATION) {
      Runtime.trap("Durations cannot exceed 480 minutes");
    };
    if (sessionsBeforeLongBreak > MAX_SESSIONS_BEFORE_LONG_BREAK) {
      Runtime.trap("Sessions before long break cannot exceed 20");
    };
    userSettings.add(
      caller,
      {
        workDuration;
        shortBreakDuration = shortBreak;
        longBreakDuration = longBreak;
        sessionsBeforeLongBreak;
      },
    );
  };

  public query ({ caller }) func getSettings() : async ?UserSettings {
    requireAuth(caller);
    userSettings.get(caller);
  };

  // Endpoints — Stats & Streaks

  public query ({ caller }) func getStudyStats() : async StudyStats {
    requireAuth(caller);
    var totalMinutes : Nat = 0;
    let perSubject = Map.empty<Nat, Nat>();
    let studyDays = Map.empty<Int, Bool>();

    for ((_, s) in getUserSessions(caller).entries()) {
      if (s.sessionType == "work") {
        totalMinutes += s.duration;
        let existing = switch (perSubject.get(s.subjectId)) {
          case (?v) { v };
          case (null) { 0 };
        };
        perSubject.add(s.subjectId, existing + s.duration);
        studyDays.add(dayIndex(s.startTime), true);
      };
    };

    let subjectMinutes = List.empty<(Nat, Nat)>();
    for ((sid, mins) in perSubject.entries()) {
      subjectMinutes.add((sid, mins));
    };

    let dayList = List.empty<Int>();
    for ((d, _) in studyDays.entries()) {
      dayList.add(d);
    };
    dayList.sortInPlace();
    let sortedDays = dayList.toArray();

    var currentStreak : Nat = 0;
    var longestStreak : Nat = 0;
    var streak : Nat = 0;

    if (sortedDays.size() > 0) {
      streak := 1;
      var i = 1;
      while (i < sortedDays.size()) {
        if (sortedDays[i] == sortedDays[i - 1] + 1) {
          streak += 1;
        } else {
          if (streak > longestStreak) {
            longestStreak := streak;
          };
          streak := 1;
        };
        i += 1;
      };
      if (streak > longestStreak) {
        longestStreak := streak;
      };
      currentStreak := streak;
      let todayIndex = dayIndex(Time.now());
      let lastDay = sortedDays[sortedDays.size() - 1];
      if (lastDay < todayIndex - 1) {
        currentStreak := 0;
      };
    };

    {
      totalMinutes;
      minutesPerSubject = subjectMinutes.toArray();
      currentStreak;
      longestStreak;
    };
  };
};
