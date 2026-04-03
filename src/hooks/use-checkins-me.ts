import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Checkin } from "@/types/feed";

function normalizeCheckinsResponse(payload: unknown): Checkin[] {
  if (Array.isArray(payload)) return payload as Checkin[];
  if (!payload || typeof payload !== "object") return [];

  const wrapped = payload as { items?: unknown; data?: unknown; results?: unknown };
  if (Array.isArray(wrapped.items)) return wrapped.items as Checkin[];
  if (Array.isArray(wrapped.data)) return wrapped.data as Checkin[];
  if (Array.isArray(wrapped.results)) return wrapped.results as Checkin[];

  return [];
}

export function useCheckinsMe(enabled = true) {
  return useQuery({
    queryKey: ["checkins", "me"],
    queryFn: async () => {
      const response = await api.get<unknown>("/checkins/me", { withBoxId: false });
      return normalizeCheckinsResponse(response);
    },
    initialData: [],
    enabled,
  });
}
