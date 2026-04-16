import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

function usePrincipalKey() {
  const { identity } = useInternetIdentity();
  return identity?.getPrincipal().toString();
}

// Profile

export function useGetProfile() {
  const { actor } = useActor();
  const principalKey = usePrincipalKey();

  return useQuery({
    queryKey: ["profile", principalKey],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.getProfile();
    },
    enabled: !!actor && !!principalKey,
  });
}

export function useSetProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principalKey = usePrincipalKey();

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.setProfile(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", principalKey] });
    },
  });
}

// Subjects

export function useGetSubjects() {
  const { actor } = useActor();
  const principalKey = usePrincipalKey();

  return useQuery({
    queryKey: ["subjects", principalKey],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.getSubjects();
    },
    enabled: !!actor && !!principalKey,
  });
}

export function useAddSubject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principalKey = usePrincipalKey();

  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.addSubject(name, color);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects", principalKey] });
    },
  });
}

export function useUpdateSubject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principalKey = usePrincipalKey();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      color,
    }: {
      id: bigint;
      name: string;
      color: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.updateSubject(id, name, color);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects", principalKey] });
    },
  });
}

export function useDeleteSubject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principalKey = usePrincipalKey();

  return useMutation({
    mutationFn: async ({ id }: { id: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.deleteSubject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects", principalKey] });
    },
  });
}

// Sessions

export function useGetSessions() {
  const { actor } = useActor();
  const principalKey = usePrincipalKey();

  return useQuery({
    queryKey: ["sessions", principalKey],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.getSessions();
    },
    enabled: !!actor && !!principalKey,
  });
}

export function useLogSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principalKey = usePrincipalKey();

  return useMutation({
    mutationFn: async ({
      subjectId,
      startTime,
      duration,
      sessionType,
    }: {
      subjectId: bigint;
      startTime: bigint;
      duration: bigint;
      sessionType: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.logSession(
        subjectId,
        startTime,
        duration,
        sessionType,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", principalKey] });
      queryClient.invalidateQueries({ queryKey: ["stats", principalKey] });
    },
  });
}

export function useDeleteSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principalKey = usePrincipalKey();

  return useMutation({
    mutationFn: async ({ id }: { id: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.deleteSession(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", principalKey] });
      queryClient.invalidateQueries({ queryKey: ["stats", principalKey] });
    },
  });
}

// Weekly Goals

export function useGetWeeklyGoals() {
  const { actor } = useActor();
  const principalKey = usePrincipalKey();

  return useQuery({
    queryKey: ["weeklyGoals", principalKey],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.getWeeklyGoals();
    },
    enabled: !!actor && !!principalKey,
  });
}

export function useSetWeeklyGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principalKey = usePrincipalKey();

  return useMutation({
    mutationFn: async ({
      subjectId,
      targetMinutes,
      weekStart,
    }: {
      subjectId: bigint | null;
      targetMinutes: bigint;
      weekStart: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.setWeeklyGoal(subjectId, targetMinutes, weekStart);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["weeklyGoals", principalKey],
      });
    },
  });
}

export function useUpdateWeeklyGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principalKey = usePrincipalKey();

  return useMutation({
    mutationFn: async ({
      id,
      targetMinutes,
    }: {
      id: bigint;
      targetMinutes: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.updateWeeklyGoal(id, targetMinutes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["weeklyGoals", principalKey],
      });
    },
  });
}

export function useDeleteWeeklyGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principalKey = usePrincipalKey();

  return useMutation({
    mutationFn: async ({ id }: { id: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.deleteWeeklyGoal(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["weeklyGoals", principalKey],
      });
    },
  });
}

// Settings

export function useGetSettings() {
  const { actor } = useActor();
  const principalKey = usePrincipalKey();

  return useQuery({
    queryKey: ["settings", principalKey],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.getSettings();
    },
    enabled: !!actor && !!principalKey,
  });
}

export function useSetSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const principalKey = usePrincipalKey();

  return useMutation({
    mutationFn: async ({
      workDuration,
      shortBreak,
      longBreak,
      sessionsBeforeLongBreak,
    }: {
      workDuration: bigint;
      shortBreak: bigint;
      longBreak: bigint;
      sessionsBeforeLongBreak: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.setSettings(
        workDuration,
        shortBreak,
        longBreak,
        sessionsBeforeLongBreak,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", principalKey] });
    },
  });
}

// Stats

export function useGetStudyStats() {
  const { actor } = useActor();
  const principalKey = usePrincipalKey();

  return useQuery({
    queryKey: ["stats", principalKey],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.getStudyStats();
    },
    enabled: !!actor && !!principalKey,
  });
}
