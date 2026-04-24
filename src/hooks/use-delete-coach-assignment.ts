import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DeleteCoachAssignmentResponse } from "@/types/coach-assignment";

interface DeleteCoachAssignmentParams {
  coachId: string;
  classId: string;
}

export function useDeleteCoachAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ coachId, classId }: DeleteCoachAssignmentParams) => {
      const queryString = new URLSearchParams({ coachId, classId }).toString();
      return api.delete<DeleteCoachAssignmentResponse>(
        `/admin/reports/coach-assignments?${queryString}`
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-reports", "coach-assignments"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-reports"] }),
      ]);
    },
  });
}
