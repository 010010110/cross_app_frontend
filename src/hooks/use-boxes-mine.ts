import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Box } from "@/types/box";

export function useBoxesMine(enabled = true) {
  return useQuery({
    queryKey: ["boxes", "mine"],
    queryFn: () => api.get<Box[]>("/boxes/mine"),
    enabled,
  });
}
