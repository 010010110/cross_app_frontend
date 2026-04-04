import type { WodModel } from "@/types/box";

export type ResultScoreKind = "TIME" | "LOAD" | "UNKNOWN";

export type ExerciseCategory =
  | "WEIGHTLIFTING"
  | "GYMNASTICS"
  | "MONOSTRUCTURAL"
  | "ACCESSORY";

export interface Exercise {
  _id: string;
  name: string;
  category: ExerciseCategory;
  isGlobal: boolean;
  boxId?: string;
  createdAt: string;
}

/** Retornado por GET /results — resultado do WOD completo, sem vínculo a exercício */
export interface WodResultListItem {
  _id: string;
  userId: string;
  boxId: string;
  wodId: string;
  score: string;
  scoreKind: ResultScoreKind;
  wodModel?: WodModel | null;
  wodTitle?: string | null;
  wodDate?: string | null;
  createdAt: string;
}

/** Retornado por GET /results/pr — PR por exercício */
export interface ResultListItem {
  _id: string;
  userId: string;
  boxId: string;
  wodId?: string | null;
  exerciseId: string;
  score: string;
  scoreKind: ResultScoreKind;
  isNewPR: boolean;
  exerciseName?: string | null;
  wodTitle?: string | null;
  wodDate?: string | null;
  wodModel?: WodModel | null;
  createdAt: string;
}

/** POST /results */
export interface CreateResultDto {
  wodId: string;
  score: string;
}

/** POST /results/pr */
export interface CreateExercisePrDto {
  exerciseId: string;
  score: string;
  autoPostText?: string;
}

/** Resposta de POST /results */
export interface CreateWodResultResponse {
  resultId: string;
  scoreKind: ResultScoreKind;
  message: string;
}

/** Resposta de POST /results/pr */
export type AutoFeedPostStatus =
  | "created"
  | "skipped-no-checkin"
  | "skipped-already-posted"
  | "skipped-no-new-pr"
  | "failed"
  | "skipped-existing-post";

export interface CreateResultResponse {
  resultId: string;
  isNewPR: boolean;
  scoreKind: ResultScoreKind;
  autoFeedPost: {
    status: AutoFeedPostStatus;
    postId?: string;
    checkinId?: string;
  };
  message: string;
}
