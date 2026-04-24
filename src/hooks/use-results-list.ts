import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { normalizeArrayPayload } from "@/lib/response";
import { WodResultListItem } from "@/types/result";

export function useResultsList(limit = 50, enabled = true) {
  return useQuery({
    queryKey: ["results", limit],
    queryFn: async () => {
      const response = await api.get<unknown>(`/results?limit=${limit}`, { withBoxId: false });
      return normalizeArrayPayload<WodResultListItem>(response);
    },
    initialData: [],
    enabled,
  });
}
