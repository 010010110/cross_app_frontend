import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { normalizeArrayPayload } from "@/lib/response";
import { Checkin } from "@/types/feed";

export function useCheckinsBox(enabled = true) {
  return useQuery({
    queryKey: ["checkins", "box"],
    queryFn: async () => {
      const response = await api.get<unknown>("/checkins/box");
      return normalizeArrayPayload<Checkin>(response);
    },
    initialData: [],
    enabled,
  });
}
