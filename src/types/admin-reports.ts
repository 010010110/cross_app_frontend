/**
 * Admin Reports API Response Types
 * Based on /admin/reports/* endpoints from swagger
 */

// Overview Report - Box summary: students, classes, check-ins
export interface AdminReportOverview {
  totalStudents: number;
  totalCoaches: number;
  totalClasses: number;
  totalCheckinsToday: number;
  totalCheckinsInPeriod: number;
  averageCheckinsPerClass: number;
  mostActiveClass?: {
    classId: string;
    name: string;
    checkinCount: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
}

// Inactivity Report - List of inactive students above threshold
export interface AdminInactiveStudent {
  studentId: string;
  name: string;
  email: string;
  daysInactive: number;
  lastCheckinDate: string | null;
  totalCheckinsInBox: number;
}

export interface AdminReportInactivity {
  thresholdDays: number;
  inactiveCount: number;
  totalStudents: number;
  students: AdminInactiveStudent[];
  period: {
    startDate: string;
    endDate: string;
  };
}

// Training Ranking Report - Top students by PR, attendance, or XP
export interface AdminRankedStudent {
  studentId: string;
  name: string;
  email: string;
  rank: number;
  score: number; // PR count, attendance count, or XP total depending on rankingBy
  scoreLabel: string; // "5 PRs", "12 workouts", "850 XP"
  metric: "prs" | "attendance" | "xp"; // what was ranked by
  lastActivityDate?: string;
}

export interface AdminReportTrainingRanking {
  rankingBy: "prs" | "attendance" | "xp";
  limit: number;
  students: AdminRankedStudent[];
  period?: {
    startDate: string;
    endDate: string;
  };
}

// Gym Rats Report - Top frequentadores por check-ins no periodo
export interface AdminGymRat {
  studentId: string;
  name: string;
  email: string;
  rank: number;
  checkins: number;
  lastCheckinDate?: string | null;
}

export interface AdminReportGymRats {
  limit: number;
  students: AdminGymRat[];
  period?: {
    startDate: string;
    endDate: string;
  };
}

// Class Participation Report - Participation data per class
export interface AdminClassParticipationData {
  classId: string;
  className: string;
  date: string;
  checkinsCount: number;
  enrolledCount: number;
  checkinLimit?: number | null;
  participationRate: number | null; // percentage 0-100 when limit is available
  coachName?: string;
}

export interface AdminReportClassParticipation {
  totalClasses: number;
  totalCheckinsInPeriod: number;
  averageParticipationRate: number; // percentage 0-100
  classes: AdminClassParticipationData[];
  period: {
    startDate: string;
    endDate: string;
  };
}

// Rewards XP Report - XP distribution and streak snapshots
export interface AdminStudentXpData {
  studentId: string;
  name: string;
  email: string;
  totalXpInPeriod: number;
  currentStreak: number;
  longestStreak: number;
  checkinsCount: number;
  milestonesUnlocked: Array<{
    milestoneName: string;
    streakDays: number;
    unlockedAt: string;
  }>;
}

export interface AdminReportRewardsXp {
  minStreak?: number;
  limit: number;
  totalXpDistributed: number;
  studentCount: number;
  averageXpPerStudent: number;
  students: AdminStudentXpData[];
  period: {
    startDate: string;
    endDate: string;
  };
}

// Filter parameters type (used across multiple reports)
export interface AdminReportFilters {
  startDate?: string; // ISO string or YYYY-MM-DD
  endDate?: string; // ISO string or YYYY-MM-DD
  coachId?: string;
  studentId?: string;
  classId?: string;
  thresholdDays?: number; // For inactivity report
  rankingBy?: "prs" | "attendance" | "xp"; // For training ranking
  minStreak?: number; // For rewards XP
  limit?: number; // For rankings and rewards
}
