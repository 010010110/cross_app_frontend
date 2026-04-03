import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ResultListItem } from "@/types/result";

function normalizeResults(payload: unknown): ResultListItem[] {
  if (Array.isArray(payload)) return payload as ResultListItem[];
  if (!payload || typeof payload !== "object") return [];

  const wrapped = payload as { items?: unknown; data?: unknown; results?: unknown };
  if (Array.isArray(wrapped.items)) return wrapped.items as ResultListItem[];
  if (Array.isArray(wrapped.data)) return wrapped.data as ResultListItem[];
  if (Array.isArray(wrapped.results)) return wrapped.results as ResultListItem[];

  return [];
}

export function useResultsPrList(limit = 50, enabled = true) {
  return useQuery({
    queryKey: ["results", "pr", limit],
    queryFn: async () => {
      const response = await api.get<unknown>(`/results/pr?limit=${limit}`, { withBoxId: false });
      return normalizeResults(response);
    },
    initialData: [],
    enabled,
  });
}
