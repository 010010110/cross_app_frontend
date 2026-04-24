import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CreateExerciseDto } from "@/types/result";

export interface CreateExerciseResponse {
  exerciseId: string;
}

export function useCreateExercise() {
  return useMutation({
    mutationFn: (dto: CreateExerciseDto) =>
      api.post<CreateExerciseResponse>("/exercises", dto),
  });
}
