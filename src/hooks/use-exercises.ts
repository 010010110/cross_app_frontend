import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { normalizeArrayPayload } from "@/lib/response";
import { Exercise } from "@/types/result";

export function useExercises(enabled = true) {
  return useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const response = await api.get<unknown>("/exercises");
      return normalizeArrayPayload<Exercise>(response);
    },
    initialData: [],
    enabled,
  });
}
