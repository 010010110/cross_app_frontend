import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { WodResultListItem } from "@/types/result";

function normalizeResults(payload: unknown): WodResultListItem[] {
  if (Array.isArray(payload)) return payload as WodResultListItem[];
  if (!payload || typeof payload !== "object") return [];

  const wrapped = payload as { items?: unknown; data?: unknown; results?: unknown };
  if (Array.isArray(wrapped.items)) return wrapped.items as WodResultListItem[];
  if (Array.isArray(wrapped.data)) return wrapped.data as WodResultListItem[];
  if (Array.isArray(wrapped.results)) return wrapped.results as WodResultListItem[];

  return [];
}

export function useResultsList(limit = 50, enabled = true) {
  return useQuery({
    queryKey: ["results", limit],
    queryFn: async () => {
      const response = await api.get<unknown>(`/results?limit=${limit}`, { withBoxId: false });
      return normalizeResults(response);
    },
    initialData: [],
    enabled,
  });
}
