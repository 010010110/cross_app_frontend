import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ClassesTodayResponse } from "@/types/box";

export function useClassesToday(selectedBoxId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["classes", "today", selectedBoxId],
    queryFn: () => api.get<ClassesTodayResponse>("/classes/today"),
    enabled: enabled && Boolean(selectedBoxId),
  });
}
