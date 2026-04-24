import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { normalizeArrayPayload } from "@/lib/response";
import { Checkin } from "@/types/feed";

export function useCheckinsMe(enabled = true) {
  return useQuery({
    queryKey: ["checkins", "me"],
    queryFn: async () => {
      const response = await api.get<unknown>("/checkins/me", { withBoxId: false });
      return normalizeArrayPayload<Checkin>(response);
    },
    initialData: [],
    enabled,
  });
}
