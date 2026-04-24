import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AdminReportGymRats } from "@/types/admin-reports";

interface RawGymRatResponse {
  period?: {
    start?: string;
    end?: string;
  };
  ranking?: Array<{
    rank?: number;
    userId?: string;
    studentId?: string;
    name?: string;
    email?: string;
    totalCheckins?: number;
    value?: number;
    checkins?: number;
    lastCheckinDate?: string | null;
  }>;
  students?: Array<{
    rank?: number;
    userId?: string;
    studentId?: string;
    name?: string;
    email?: string;
    totalCheckins?: number;
    value?: number;
    checkins?: number;
    lastCheckinDate?: string | null;
  }>;
}

export function useAdminReportGymRats(
  selectedBoxId: string | null,
  filters?: {
    startDate?: string;
    endDate?: string;
    coachId?: string;
    studentId?: string;
    classId?: string;
    limit?: number;
  }
) {
  const queryParams = new URLSearchParams();
  if (filters?.startDate) queryParams.append("startDate", filters.startDate);
  if (filters?.endDate) queryParams.append("endDate", filters.endDate);
  if (filters?.coachId) queryParams.append("coachId", filters.coachId);
  if (filters?.studentId) queryParams.append("studentId", filters.studentId);
  if (filters?.classId) queryParams.append("classId", filters.classId);
  if (typeof filters?.limit === "number") queryParams.append("limit", String(filters.limit));

  const queryString = queryParams.toString();
  const url = `/admin/reports/gym-rats${queryString ? "?" + queryString : ""}`;

  return useQuery({
    queryKey: [
      "admin-reports",
      "gym-rats",
      selectedBoxId,
      filters?.startDate,
      filters?.endDate,
      filters?.coachId,
      filters?.studentId,
      filters?.classId,
      filters?.limit,
    ],
    queryFn: async (): Promise<AdminReportGymRats> => {
      const raw = await api.get<RawGymRatResponse>(url);
      const ranking = raw.ranking ?? raw.students ?? [];

      const students = ranking.map((item, index) => {
        const checkins =
          typeof item.totalCheckins === "number"
            ? item.totalCheckins
            : typeof item.value === "number"
            ? item.value
            : (item.checkins ?? 0);

        return {
          studentId: item.studentId ?? item.userId ?? `${index}`,
          name: item.name ?? "Aluno",
          email: item.email ?? "-",
          rank: item.rank ?? index + 1,
          checkins,
          lastCheckinDate: item.lastCheckinDate ?? null,
        };
      });

      return {
        limit: filters?.limit ?? 10,
        students,
        period: {
          startDate: raw.period?.start ?? "",
          endDate: raw.period?.end ?? "",
        },
      };
    },
    enabled: Boolean(selectedBoxId),
    staleTime: 5 * 60 * 1000,
  });
}
