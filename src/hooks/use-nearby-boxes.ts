import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { NearbyBox } from "@/types/box";

export interface NearbyBoxesParams {
  latitude: number;
  longitude: number;
}

export function useNearbyBoxes() {
  return useMutation({
    mutationFn: ({ latitude, longitude }: NearbyBoxesParams) => {
      const search = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
      });

      return api.get<NearbyBox[]>(`/boxes/nearby?${search.toString()}`);
    },
  });
}
