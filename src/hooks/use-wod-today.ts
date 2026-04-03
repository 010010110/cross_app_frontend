import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Wod } from "@/types/box";

export function useWodToday(selectedBoxId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["wods", "today", selectedBoxId],
    queryFn: () => api.get<Wod | null>("/wods/today"),
    enabled: enabled && Boolean(selectedBoxId),
  });
}
