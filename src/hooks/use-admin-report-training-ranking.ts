import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AdminReportTrainingRanking } from "@/types/admin-reports";

interface RawTrainingRankingResponse {
  period?: {
    start?: string;
    end?: string;
  };
  rankingBy?: "prs" | "attendance" | "xp";
  ranking?: Array<{
    rank?: number;
    userId?: string;
    studentId?: string;
    name?: string;
    email?: string;
    value?: number;
    score?: number;
    totalXp?: number;
    prsCount?: number;
    attendanceCount?: number;
  }>;
}

export function useAdminReportTrainingRanking(
  selectedBoxId: string | null,
  filters?: {
    rankingBy?: "prs" | "attendance" | "xp";
    limit?: number;
    startDate?: string;
    endDate?: string;
    coachId?: string;
    studentId?: string;
  }
) {
  // Build query string from filters
  const queryParams = new URLSearchParams();
  if (filters?.rankingBy) queryParams.append("rankingBy", filters.rankingBy);
  if (filters?.limit) queryParams.append("limit", String(filters.limit));
  if (filters?.startDate) queryParams.append("startDate", filters.startDate);
  if (filters?.endDate) queryParams.append("endDate", filters.endDate);
  if (filters?.coachId) queryParams.append("coachId", filters.coachId);
  if (filters?.studentId) queryParams.append("studentId", filters.studentId);
  const queryString = queryParams.toString();
  const url = `/admin/reports/training-ranking${queryString ? "?" + queryString : ""}`;

  return useQuery({
    queryKey: [
      "admin-reports",
      "training-ranking",
      selectedBoxId,
      filters?.rankingBy,
      filters?.limit,
      filters?.startDate,
      filters?.endDate,
      filters?.coachId,
      filters?.studentId,
    ],
    queryFn: async () => {
      const raw = await api.get<RawTrainingRankingResponse>(url);
      const metric = raw.rankingBy ?? filters?.rankingBy ?? "xp";
      const ranking = raw.ranking ?? [];

      const students = ranking.map((entry, index) => {
        const computedScore =
          typeof entry.value === "number"
            ? entry.value
            : typeof entry.score === "number"
              ? entry.score
            : metric === "xp"
              ? (entry.totalXp ?? 0)
              : metric === "prs"
                ? (entry.prsCount ?? 0)
                : (entry.attendanceCount ?? 0);

        const scoreSuffix = metric === "xp" ? "XP" : metric === "prs" ? "PRs" : "treinos";

        return {
          studentId: entry.studentId ?? entry.userId ?? `${index}`,
          name: entry.name ?? "Aluno",
          email: entry.email ?? "-",
          rank: entry.rank ?? index + 1,
          score: computedScore,
          scoreLabel: `${computedScore} ${scoreSuffix}`,
          metric,
        };
      });

      return {
        rankingBy: metric,
        limit: filters?.limit ?? 10,
        students,
        period: {
          startDate: raw.period?.start ?? "",
          endDate: raw.period?.end ?? "",
        },
      } satisfies AdminReportTrainingRanking;
    },
    enabled: Boolean(selectedBoxId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
