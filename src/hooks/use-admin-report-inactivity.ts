import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AdminReportInactivity } from "@/types/admin-reports";

interface RawInactivityResponse {
  thresholdDays?: number;
  count?: number;
  students?: Array<{
    studentId?: string;
    name?: string;
    email?: string;
    daysInactive?: number;
    lastCheckinDate?: string | null;
    totalCheckinsInBox?: number;
  }>;
}

export function useAdminReportInactivity(
  selectedBoxId: string | null,
  filters?: {
    thresholdDays?: number;
    coachId?: string;
    studentId?: string;
  }
) {
  // Build query string from filters
  const queryParams = new URLSearchParams();
  if (filters?.thresholdDays) queryParams.append("thresholdDays", String(filters.thresholdDays));
  if (filters?.coachId) queryParams.append("coachId", filters.coachId);
  if (filters?.studentId) queryParams.append("studentId", filters.studentId);
  const queryString = queryParams.toString();
  const url = `/admin/reports/inactivity${queryString ? "?" + queryString : ""}`;

  return useQuery({
    queryKey: [
      "admin-reports",
      "inactivity",
      selectedBoxId,
      filters?.thresholdDays,
      filters?.coachId,
      filters?.studentId,
    ],
    queryFn: async () => {
      const raw = await api.get<RawInactivityResponse>(url);
      const students = (raw.students ?? []).map((student) => ({
        studentId: student.studentId ?? "",
        name: student.name ?? "Aluno",
        email: student.email ?? "-",
        daysInactive: student.daysInactive ?? 0,
        lastCheckinDate: student.lastCheckinDate ?? null,
        totalCheckinsInBox: student.totalCheckinsInBox ?? 0,
      }));

      return {
        thresholdDays: raw.thresholdDays ?? filters?.thresholdDays ?? 7,
        inactiveCount: raw.count ?? students.length,
        totalStudents: students.length,
        students,
        period: {
          startDate: "",
          endDate: "",
        },
      } satisfies AdminReportInactivity;
    },
    enabled: Boolean(selectedBoxId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
