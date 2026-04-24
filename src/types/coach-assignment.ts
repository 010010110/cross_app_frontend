export interface CoachAssignment {
  coachId: string;
  coachName: string;
  classId: string;
  className: string;
  createdAt?: string;
}

export interface CreateCoachAssignmentDto {
  coachId: string;
  classId: string;
}

export interface CreateCoachAssignmentResponse {
  message?: string;
}

export interface DeleteCoachAssignmentResponse {
  message?: string;
}
