import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  CreateCoachAssignmentDto,
  CreateCoachAssignmentResponse,
} from "@/types/coach-assignment";

export function useCreateCoachAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCoachAssignmentDto) =>
      api.post<CreateCoachAssignmentResponse>("/admin/reports/coach-assignments", dto),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-reports", "coach-assignments"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-reports"] }),
      ]);
    },
  });
}
