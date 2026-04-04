import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CreateExercisePrDto, CreateResultResponse } from "@/types/result";

export function useCreateResultPr() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateExercisePrDto) =>
      api.post<CreateResultResponse>("/results/pr", dto, { withBoxId: false }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["results", "pr"] }),
        queryClient.invalidateQueries({ queryKey: ["results"] }),
        queryClient.invalidateQueries({ queryKey: ["feed"] }),
      ]);
    },
  });
}
