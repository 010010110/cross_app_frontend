import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AdminReportRewardsXp } from "@/types/admin-reports";

interface RawRewardsXpResponse {
  period?: {
    start?: string;
    end?: string;
  };
  sourceDistribution?: Array<{
    source?: string;
    points?: number;
  }>;
  topXpEarners?: Array<{
    rank?: number;
    userId?: string;
    studentId?: string;
    name?: string;
    email?: string;
    xpInPeriod?: number;
    totalXp?: number;
    currentStreak?: number;
    longestStreak?: number;
    checkinsCount?: number;
  }>;
  streakSnapshot?: Array<{
    userId?: string;
    name?: string;
    email?: string;
    totalXp?: number;
    currentStreak?: number;
    longestStreak?: number;
  }>;
}

interface RawRewardsStudent {
  rank?: number;
  userId?: string;
  studentId?: string;
  name?: string;
  email?: string;
  xpInPeriod?: number;
  totalXp?: number;
  currentStreak?: number;
  longestStreak?: number;
  checkinsCount?: number;
}

export function useAdminReportRewardsXp(
  selectedBoxId: string | null,
  filters?: {
    startDate?: string;
    endDate?: string;
    coachId?: string;
    studentId?: string;
    minStreak?: number;
    limit?: number;
  }
) {
  // Build query string from filters
  const queryParams = new URLSearchParams();
  const startDateOnly = filters?.startDate?.slice(0, 10);
  const endDateOnly = filters?.endDate?.slice(0, 10);
  if (startDateOnly) queryParams.append("startDate", startDateOnly);
  if (endDateOnly) queryParams.append("endDate", endDateOnly);
  if (filters?.coachId) queryParams.append("coachId", filters.coachId);
  if (filters?.studentId) queryParams.append("studentId", filters.studentId);
  if (filters?.minStreak) queryParams.append("minStreak", String(filters.minStreak));
  if (filters?.limit) queryParams.append("limit", String(filters.limit));
  const queryString = queryParams.toString();
  const url = `/admin/reports/rewards-xp${queryString ? "?" + queryString : ""}`;

  return useQuery({
    queryKey: [
      "admin-reports",
      "rewards-xp",
      selectedBoxId,
      filters?.startDate,
      filters?.endDate,
      filters?.coachId,
      filters?.studentId,
      filters?.minStreak,
      filters?.limit,
    ],
    queryFn: async () => {
      const raw = await api.get<RawRewardsXpResponse>(url);
      const hasDateFilter = Boolean(startDateOnly || endDateOnly);
      const byUser = new Map<string, RawRewardsStudent>();

      (raw.topXpEarners ?? []).forEach((student, index) => {
        const key = student.studentId ?? student.userId ?? `top-${index}`;
        byUser.set(key, {
          rank: student.rank,
          userId: student.userId,
          studentId: student.studentId,
          name: student.name,
          email: student.email,
          xpInPeriod: student.xpInPeriod,
          totalXp: student.totalXp,
          currentStreak: student.currentStreak,
          longestStreak: student.longestStreak,
          checkinsCount: student.checkinsCount,
        });
      });

      (raw.streakSnapshot ?? []).forEach((student, index) => {
        const key = student.userId ?? `streak-${index}`;
        const prev = byUser.get(key);
        byUser.set(key, {
          ...prev,
          userId: prev?.userId ?? student.userId,
          studentId: prev?.studentId,
          name: student.name ?? prev?.name,
          email: student.email ?? prev?.email,
          xpInPeriod: prev?.xpInPeriod,
          totalXp: student.totalXp ?? prev?.totalXp,
          currentStreak: student.currentStreak ?? prev?.currentStreak,
          longestStreak: student.longestStreak ?? prev?.longestStreak,
          checkinsCount: prev?.checkinsCount,
          rank: prev?.rank,
        });
      });

      const students = Array.from(byUser.entries()).map(([key, student], index) => ({
        studentId: student.studentId ?? student.userId ?? key,
        name: student.name ?? "Aluno",
        email: student.email ?? "-",
        totalXpInPeriod: hasDateFilter
          ? (student.xpInPeriod ?? 0)
          : (student.xpInPeriod ?? student.totalXp ?? 0),
        currentStreak: student.currentStreak ?? 0,
        longestStreak: student.longestStreak ?? 0,
        checkinsCount: student.checkinsCount ?? 0,
        milestonesUnlocked: [],
        _rank: student.rank ?? index + 1,
      }));

      students.sort((a, b) => a._rank - b._rank);

      const normalizedStudents = students.map(({ _rank, ...student }) => student);

      const totalXpFromSourceDistribution = (raw.sourceDistribution ?? []).reduce(
        (acc, source) => acc + (source.points ?? 0),
        0
      );
      const totalXpFromStudents = normalizedStudents.reduce(
        (acc, student) => acc + student.totalXpInPeriod,
        0
      );
      const totalXpDistributed =
        totalXpFromSourceDistribution > 0
          ? totalXpFromSourceDistribution
          : totalXpFromStudents;
      const studentCount = normalizedStudents.length;

      return {
        minStreak: filters?.minStreak ?? 0,
        limit: filters?.limit ?? 15,
        totalXpDistributed,
        studentCount,
        averageXpPerStudent:
          studentCount > 0 ? totalXpDistributed / studentCount : 0,
        students: normalizedStudents,
        period: {
          startDate: raw.period?.start ?? "",
          endDate: raw.period?.end ?? "",
        },
      } satisfies AdminReportRewardsXp;
    },
    enabled: Boolean(selectedBoxId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
