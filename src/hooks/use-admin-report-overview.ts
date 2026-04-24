import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AdminReportOverview } from "@/types/admin-reports";

interface RawOverviewResponse {
  period?: {
    start?: string;
    end?: string;
  };
  summary?: {
    totalStudents?: number;
    totalCoaches?: number;
    totalActiveClasses?: number;
    totalCheckins?: number;
    activeStudentsInPeriod?: number;
  };
}

export function useAdminReportOverview(
  selectedBoxId: string | null,
  filters?: {
    startDate?: string;
    endDate?: string;
    coachId?: string;
    studentId?: string;
    classId?: string;
  }
) {
  // Build query string from filters
  const queryParams = new URLSearchParams();
  if (filters?.startDate) queryParams.append("startDate", filters.startDate);
  if (filters?.endDate) queryParams.append("endDate", filters.endDate);
  if (filters?.coachId) queryParams.append("coachId", filters.coachId);
  if (filters?.studentId) queryParams.append("studentId", filters.studentId);
  if (filters?.classId) queryParams.append("classId", filters.classId);
  const queryString = queryParams.toString();
  const url = `/admin/reports/overview${queryString ? "?" + queryString : ""}`;

  return useQuery({
    queryKey: [
      "admin-reports",
      "overview",
      selectedBoxId,
      filters?.startDate,
      filters?.endDate,
      filters?.coachId,
      filters?.studentId,
      filters?.classId,
    ],
    queryFn: async (): Promise<AdminReportOverview> => {
      const raw = await api.get<RawOverviewResponse>(url);
      const totalClasses = raw.summary?.totalActiveClasses ?? 0;
      const totalCheckins = raw.summary?.totalCheckins ?? 0;

      return {
        totalStudents: raw.summary?.totalStudents ?? 0,
        totalCoaches: raw.summary?.totalCoaches ?? 0,
        totalClasses,
        totalCheckinsToday: 0,
        totalCheckinsInPeriod: totalCheckins,
        averageCheckinsPerClass:
          totalClasses > 0 ? totalCheckins / totalClasses : 0,
        period: {
          startDate: raw.period?.start ?? "",
          endDate: raw.period?.end ?? "",
        },
      };
    },
    enabled: Boolean(selectedBoxId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
