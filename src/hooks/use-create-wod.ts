import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CreateWodDto, CreateWodResponse } from "@/types/wod";

export function useCreateWod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateWodDto) =>
      api.post<CreateWodResponse>("/wods", dto),
    onSuccess: () => {
      // Invalidate the wods/today query to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ["wods-today"] });
      // Also invalidate classes/today since it includes WOD
      queryClient.invalidateQueries({ queryKey: ["classes-today"] });
    },
  });
}
