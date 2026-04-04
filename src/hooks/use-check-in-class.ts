import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface CheckinDto {
  classId: string;
  latitude: number;
  longitude: number;
}

interface CheckinConsistency {
  activityStatus: "counted" | "already-counted";
  currentStreak: number;
  longestStreak: number;
  availableFreezes: number;
  totalXp: number;
  xpGained: number;
  freezeUsed: boolean;
  milestonesUnlocked: number[];
}

export interface CheckinCreateResponse {
  checkinId: string;
  distanceFromBoxInMeters: number;
  consistency: CheckinConsistency;
  class: {
    classId: string;
    name: string;
    startTime: string;
    endTime: string;
  };
  message: string;
}

export function useCheckInClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CheckinDto) => {
      return api.post<CheckinCreateResponse>("/checkins", data);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["checkins", "me"] }),
        queryClient.invalidateQueries({ queryKey: ["rewards", "summary"] }),
        queryClient.invalidateQueries({ queryKey: ["rewards", "milestones"] }),
        queryClient.invalidateQueries({ queryKey: ["feed"] }),
      ]);
    },
  });
}
