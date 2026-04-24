import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CreateClassDto, CreateClassResponse } from "@/types/class";

export function useCreateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateClassDto) =>
      api.post<CreateClassResponse>("/classes", dto),
    onSuccess: () => {
      // Invalidate the classes/today query to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ["classes-today"] });
    },
  });
}
