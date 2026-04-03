import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Exercise } from "@/types/result";

function normalizeExercises(payload: unknown): Exercise[] {
  if (Array.isArray(payload)) return payload as Exercise[];
  if (!payload || typeof payload !== "object") return [];

  const wrapped = payload as { items?: unknown; data?: unknown; results?: unknown };
  if (Array.isArray(wrapped.items)) return wrapped.items as Exercise[];
  if (Array.isArray(wrapped.data)) return wrapped.data as Exercise[];
  if (Array.isArray(wrapped.results)) return wrapped.results as Exercise[];

  return [];
}

export function useExercises(enabled = true) {
  return useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const response = await api.get<unknown>("/exercises");
      return normalizeExercises(response);
    },
    initialData: [],
    enabled,
  });
}
