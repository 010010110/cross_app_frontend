import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { LoginDto, SessionResponse } from "@/types/auth";

export function useLogin() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (dto: LoginDto) =>
      api.post<SessionResponse>("/auth/login", dto),
    onSuccess: (data) => {
      login(data.accessToken, data.user);
    },
  });
}
