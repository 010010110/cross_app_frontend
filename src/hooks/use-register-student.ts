import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { RegisterUserDto, SessionResponse } from "@/types/auth";

export function useRegisterStudent() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (dto: RegisterUserDto) => api.post<SessionResponse>("/user/register", dto),
    onSuccess: (data) => {
      login(data.accessToken, data.user);
    },
  });
}
