import type { Wod } from "@/types/wod";

export type ClassWeekday =
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

export interface CreateClassDto {
  name: string;
  weekDays: ClassWeekday[];
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  checkinLimit?: number;
}

export interface CreateClassResponse {
  classId: string;
  boxId: string;
  message: string;
}

export interface ClassSchedule {
  _id: string;
  boxId: string;
  name: string;
  weekDays: ClassWeekday[];
  startTime: string;
  endTime: string;
  checkinLimit?: number;
  createdAt: string;
}

export interface ClassesTodayResponse {
  weekday: ClassWeekday;
  classes: ClassSchedule[];
  wod: Wod | null;
}
