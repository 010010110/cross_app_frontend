import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { RewardMilestone } from "@/types/rewards";

function normalizeRewardMilestones(payload: unknown): RewardMilestone[] {
  if (Array.isArray(payload)) return payload as RewardMilestone[];
  if (!payload || typeof payload !== "object") return [];

  const wrapped = payload as { items?: unknown; data?: unknown; results?: unknown };
  if (Array.isArray(wrapped.items)) return wrapped.items as RewardMilestone[];
  if (Array.isArray(wrapped.data)) return wrapped.data as RewardMilestone[];
  if (Array.isArray(wrapped.results)) return wrapped.results as RewardMilestone[];

  return [];
}

export function useRewardsMilestones(selectedBoxId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["rewards", "milestones", selectedBoxId],
    queryFn: async () => {
      const response = await api.get<unknown>("/rewards/me/milestones");
      return normalizeRewardMilestones(response);
    },
    initialData: [],
    enabled: enabled && Boolean(selectedBoxId),
  });
}
