import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Student } from "@/types/user";

export function useBoxCoaches(selectedBoxId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["users", "coaches", selectedBoxId],
    queryFn: () =>
      api.get<Student[]>("/users/coaches", {
        headers: selectedBoxId ? { "x-box-id": selectedBoxId } : undefined,
      }),
    enabled: enabled && Boolean(selectedBoxId),
    initialData: [],
  });
}
