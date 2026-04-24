export type WodModel =
  | "AMRAP"
  | "EMOM"
  | "FOR_TIME"
  | "TABATA"
  | "RFT"
  | "CHIPPER"
  | "LADDER"
  | "INTERVALS"
  | "CUSTOM";

export type WodBlockType = "WARMUP" | "SKILL" | "WOD" | "COOLDOWN";

export interface WodBlock {
  type: WodBlockType;
  title: string;
  content: string;
}

export interface CreateWodBlockDto {
  type: WodBlockType;
  title: string;
  content: string;
}

export interface CreateWodDto {
  date: string; // YYYY-MM-DD format
  title: string;
  blocks: CreateWodBlockDto[];
  model?: WodModel;
}

export interface CreateWodResponse {
  wodId: string;
  boxId: string;
}

export interface Wod {
  _id: string;
  boxId: string;
  date: string; // ISO date-time
  title: string;
  blocks: WodBlock[];
  model?: WodModel;
  createdAt: string;
}
