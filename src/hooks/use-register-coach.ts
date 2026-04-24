import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface RegisterCoachDto {
  name: string;
  email: string;
  password: string;
  contactPhone: string;
  whatsapp: string;
  address: string;
  socialInstagram?: string;
  socialFacebook?: string;
}

export function useRegisterCoach() {
  return useMutation({
    mutationFn: (dto: RegisterCoachDto) =>
      api.post<unknown>("/user/register", {
        ...dto,
        role: "COACH",
      }),
  });
}
