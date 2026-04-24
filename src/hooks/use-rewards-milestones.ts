import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { normalizeArrayPayload } from "@/lib/response";
import { RewardMilestone } from "@/types/rewards";

export function useRewardsMilestones(selectedBoxId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["rewards", "milestones", selectedBoxId],
    queryFn: async () => {
      const response = await api.get<unknown>("/rewards/me/milestones");
      return normalizeArrayPayload<RewardMilestone>(response);
    },
    initialData: [],
    enabled: enabled && Boolean(selectedBoxId),
  });
}
