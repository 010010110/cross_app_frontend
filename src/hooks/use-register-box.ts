import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { RegisterBoxDto, RegisterBoxResponse } from "@/types/box";

export function useRegisterBox() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (dto: RegisterBoxDto) =>
      api.post<RegisterBoxResponse>("/boxes/register", dto),
    onSuccess: (data) => {
      login(data.accessToken, data.user);
    },
  });
}
