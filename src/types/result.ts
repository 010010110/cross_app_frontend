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

export interface ResultListItem {
  _id: string;
  userId: string;
  boxId: string;
  wodId: string | null;
  exerciseId: string | null;
  score: string;
  scoreKind: ResultScoreKind;
  isNewPR: boolean;
  exerciseName: string | null;
  wodTitle: string | null;
  wodDate: string | null;
  createdAt: string;
}

export interface CreateResultDto {
  wodId: string;
  score: string;
}

export interface CreateExercisePrDto {
  exerciseId: string;
  score: string;
}

export interface CreateResultResponse {
  resultId: string;
  isNewPR: boolean;
  scoreKind: ResultScoreKind;
  autoFeedPost: {
    status:
      | "created"
      | "failed"
      | "skipped-existing-post"
      | "skipped-no-checkin"
      | "skipped-no-new-pr";
    postId?: string;
    checkinId?: string;
  };
  message: string;
}
