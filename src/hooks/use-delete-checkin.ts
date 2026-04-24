import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface DeleteCheckinResponse {
  checkinId: string;
  message: string;
}

export function useDeleteCheckin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (checkinId: string) => {
      const encoded = encodeURIComponent(checkinId);
      return api.delete<DeleteCheckinResponse>(`/checkins/${encoded}`);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["checkins", "me"] }),
        queryClient.invalidateQueries({ queryKey: ["checkins", "box"] }),
        queryClient.invalidateQueries({ queryKey: ["classes", "today"] }),
        queryClient.invalidateQueries({ queryKey: ["rewards", "summary"] }),
        queryClient.invalidateQueries({ queryKey: ["rewards", "milestones"] }),
        queryClient.invalidateQueries({ queryKey: ["feed"] }),
      ]);
    },
  });
}
