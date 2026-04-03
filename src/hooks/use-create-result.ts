import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CreateResultDto, CreateResultResponse } from "@/types/result";

export function useCreateResult() {
  return useMutation({
    mutationFn: (dto: CreateResultDto) =>
      api.post<CreateResultResponse>("/results", dto),
  });
}
