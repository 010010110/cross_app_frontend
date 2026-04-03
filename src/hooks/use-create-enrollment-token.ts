import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { EnrollmentTokenResponse } from "@/types/box";

export function useCreateEnrollmentToken() {
  return useMutation({
    mutationFn: () => api.post<EnrollmentTokenResponse>("/users/me/enrollment-token", {}),
  });
}
