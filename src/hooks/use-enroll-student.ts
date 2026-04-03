import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { EnrollStudentResponse, UseEnrollmentTokenDto } from "@/types/box";

interface EnrollStudentInput extends UseEnrollmentTokenDto {
  boxId: string;
}

export function useEnrollStudent() {
  return useMutation({
    mutationFn: ({ boxId, token }: EnrollStudentInput) =>
      api.post<EnrollStudentResponse>(
        "/users/enroll",
        { token },
        { headers: { "x-box-id": boxId } }
      ),
  });
}
