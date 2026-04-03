import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FeedListItem } from "@/types/feed";

function normalizeFeedListResponse(payload: unknown): FeedListItem[] {
  if (Array.isArray(payload)) return payload as FeedListItem[];
  if (!payload || typeof payload !== "object") return [];

  const wrapped = payload as { items?: unknown; data?: unknown; results?: unknown };
  if (Array.isArray(wrapped.items)) return wrapped.items as FeedListItem[];
  if (Array.isArray(wrapped.data)) return wrapped.data as FeedListItem[];
  if (Array.isArray(wrapped.results)) return wrapped.results as FeedListItem[];

  return [];
}

export function useFeedList(limit = 50, enabled = true) {
  return useQuery({
    queryKey: ["feed", limit],
    queryFn: async () => {
      const response = await api.get<unknown>(`/feed?limit=${limit}`, { withBoxId: false });
      return normalizeFeedListResponse(response);
    },
    initialData: [],
    enabled,
  });
}
