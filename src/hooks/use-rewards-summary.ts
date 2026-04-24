import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { normalizeObjectPayload } from "@/lib/response";
import { RewardSummary } from "@/types/rewards";

function normalizeRewardSummary(payload: unknown): RewardSummary | null {
  const raw = normalizeObjectPayload<{
    currentStreak?: unknown;
    longestStreak?: unknown;
    lastActivityDate?: unknown;
    availableFreezes?: unknown;
    totalXp?: unknown;
    streakState?: unknown;
    daysSinceLastActivity?: unknown;
    nextMilestone?: unknown;
  }>(payload);

  if (!raw) return null;

  if (typeof raw.currentStreak !== "number") return null;
  if (typeof raw.longestStreak !== "number") return null;
  if (typeof raw.availableFreezes !== "number") return null;
  if (typeof raw.totalXp !== "number") return null;
  if (typeof raw.streakState !== "string") return null;

  return {
    currentStreak: raw.currentStreak,
    longestStreak: raw.longestStreak,
    lastActivityDate: typeof raw.lastActivityDate === "string" ? raw.lastActivityDate : null,
    availableFreezes: raw.availableFreezes,
    totalXp: raw.totalXp,
    streakState: raw.streakState as RewardSummary["streakState"],
    daysSinceLastActivity: typeof raw.daysSinceLastActivity === "number" ? raw.daysSinceLastActivity : null,
    nextMilestone: typeof raw.nextMilestone === "number" ? raw.nextMilestone : null,
  };
}

export function useRewardsSummary(selectedBoxId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["rewards", "summary", selectedBoxId],
    queryFn: async () => {
      const response = await api.get<unknown>("/rewards/me/summary");
      return normalizeRewardSummary(response);
    },
    enabled: enabled && Boolean(selectedBoxId),
  });
}
