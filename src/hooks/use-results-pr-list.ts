import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { normalizeArrayPayload } from "@/lib/response";
import { ResultListItem } from "@/types/result";

export function useResultsPrList(limit = 50, enabled = true) {
  return useQuery({
    queryKey: ["results", "pr", limit],
    queryFn: async () => {
      const response = await api.get<unknown>(`/results/pr?limit=${limit}`, { withBoxId: false });
      return normalizeArrayPayload<ResultListItem>(response);
    },
    initialData: [],
    enabled,
  });
}
