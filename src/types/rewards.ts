export type StreakState = "INACTIVE" | "ACTIVE" | "AT_RISK" | "BROKEN";

export interface RewardSummary {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  availableFreezes: number;
  totalXp: number;
  streakState: StreakState;
  daysSinceLastActivity: number | null;
  nextMilestone: number | null;
}

export interface RewardMilestone {
  _id: string;
  userId: string;
  boxId: string;
  streakDays: number;
  rewardXp: number;
  rewardFreeze: number;
  unlockedAt: string;
}
