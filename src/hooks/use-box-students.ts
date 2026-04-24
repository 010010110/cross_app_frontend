import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Student } from "@/types/user";

export function useBoxStudents(selectedBoxId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["users", "students", selectedBoxId],
    queryFn: () =>
      api.get<Student[]>("/users/students", {
        headers: selectedBoxId ? { "x-box-id": selectedBoxId } : undefined,
      }),
    enabled: enabled && Boolean(selectedBoxId),
    initialData: [],
  });
}
