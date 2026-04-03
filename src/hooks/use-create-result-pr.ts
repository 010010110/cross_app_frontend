import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CreateExercisePrDto, CreateResultResponse } from "@/types/result";

export function useCreateResultPr() {
  return useMutation({
    mutationFn: (dto: CreateExercisePrDto) =>
      api.post<CreateResultResponse>("/results/pr", dto),
  });
}
