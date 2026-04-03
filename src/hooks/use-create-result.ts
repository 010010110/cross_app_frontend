import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CreateResultDto, CreateWodResultResponse } from "@/types/result";

export function useCreateResult() {
  return useMutation({
    mutationFn: (dto: CreateResultDto) =>
      api.post<CreateWodResultResponse>("/results", dto, { withBoxId: false }),
  });
}
