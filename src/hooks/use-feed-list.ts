import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { normalizeArrayPayload } from "@/lib/response";
import { FeedListItem } from "@/types/feed";

export function useFeedList(limit = 50, enabled = true) {
  return useQuery({
    queryKey: ["feed", limit],
    queryFn: async () => {
      const response = await api.get<unknown>(`/feed?limit=${limit}`, { withBoxId: false });
      return normalizeArrayPayload<FeedListItem>(response);
    },
    initialData: [],
    enabled,
  });
}
