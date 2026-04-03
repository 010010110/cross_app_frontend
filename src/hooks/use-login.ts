import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { LoginDto, SessionResponse } from "@/types/auth";

export function useLogin() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: async (dto: LoginDto) => {
      try {
        return await api.post<SessionResponse>("/auth/login", dto);
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      login(data.accessToken, data.user);
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
}
