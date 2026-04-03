import { SessionResponse } from "@/types/auth";

export interface RegisterBoxDto {
  parentBoxId?: string;
  name: string;
  cnpj: string;
  latitude: number;
  longitude: number;
  geofenceRadius: number;
  contactPhone: string;
  contactEmail: string;
  contactWhatsapp: string;
  contactInstagram: string;
  contactWebsite: string;
  address: string;
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

export interface NearbyBox {
  boxId: string;
  name: string;
  cnpj: string;
  latitude: number;
  longitude: number;
  geofenceRadius: number;
  contactPhone: string;
  contactEmail: string;
  contactWhatsapp: string;
  contactInstagram: string;
  contactWebsite: string;
  address: string;
  distanceInMeters: number;
  isStudentRegistered: boolean;
}

export interface BoxLocation {
  type: "Point";
  coordinates: [number, number];
}

export interface Box {
  _id: string;
  parentBoxId?: string;
  name: string;
  cnpj: string;
  location: BoxLocation;
  geofenceRadius: number;
  contactPhone: string;
  contactEmail: string;
  contactWhatsapp: string;
  contactInstagram: string;
  contactWebsite: string;
  address: string;
  createdAt: string;
}

export type ClassWeekday =
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

export interface ClassSchedule {
  _id: string;
  boxId: string;
  name: string;
  weekDays: ClassWeekday[];
  startTime: string;
  endTime: string;
  createdAt: string;
}

export type WodBlockType = "WARMUP" | "SKILL" | "WOD";

export type WodModel =
  | "AMRAP"
  | "FOR_TIME"
  | "EMOM"
  | "TABATA"
  | "RFT"
  | "CHIPPER"
  | "LADDER"
  | "INTERVALS";

export interface WodBlock {
  type: WodBlockType;
  title: string;
  content: string;
}

export interface Wod {
  _id: string;
  boxId: string;
  date: string;
  title: string;
  blocks: WodBlock[];
  createdAt: string;
  model?: WodModel;
}

export interface ClassesTodayResponse {
  weekday: ClassWeekday;
  classes: ClassSchedule[];
  wod: Wod | null;
}

export interface EnrollmentTokenResponse {
  token: string;
  expiresAt: string;
  message: string;
}

export interface UseEnrollmentTokenDto {
  token: string;
}

export interface EnrollStudentResponse {
  studentId: string;
  boxId: string;
  name: string;
  email: string;
  role: "ADMIN" | "COACH" | "ALUNO";
  message: string;
}
