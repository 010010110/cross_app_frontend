import { SessionResponse } from "@/types/auth";

export interface RegisterBoxDto {
  parentBoxId?: string;
  name: string;
  cnpj: string;
  latitude: number;
  longitude: number;
  geofenceRadius: number;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface RegisterBoxResponse extends SessionResponse {
  boxId: string;
  adminId: string;
  adminLinkedToExisting: boolean;
  message: string;
}
