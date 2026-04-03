import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface CheckinDto {
  classId: string;
  latitude: number;
  longitude: number;
}

export interface CheckinCreateResponse {
  checkinId: string;
  distanceFromBoxInMeters: number;
  consistency: string;
  class: {
    _id: string;
    name: string;
  };
  message: string;
}

export function useCheckInClass() {
  return useMutation({
    mutationFn: async (data: CheckinDto) => {
      return api.post<CheckinCreateResponse>("/checkins", data);
    },
  });
}
