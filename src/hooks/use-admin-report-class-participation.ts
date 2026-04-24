import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AdminReportClassParticipation } from "@/types/admin-reports";

interface RawClassParticipationResponse {
  period?: {
    start?: string;
    end?: string;
  };
  classes?: Array<{
    classId?: string;
    className?: string;
    totalCheckins?: number;
    uniqueStudents?: number;
    avgParticipantsPerSession?: number;
    checkinLimit?: number | null;
  }>;
}

export function useAdminReportClassParticipation(
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
  const url = `/admin/reports/class-participation${queryString ? "?" + queryString : ""}`;

  return useQuery({
    queryKey: [
      "admin-reports",
      "class-participation",
      selectedBoxId,
      filters?.startDate,
      filters?.endDate,
      filters?.coachId,
      filters?.studentId,
      filters?.classId,
    ],
    queryFn: async () => {
      const raw = await api.get<RawClassParticipationResponse>(url);
      const classes = (raw.classes ?? []).map((classData) => {
        const enrolledCount = classData.uniqueStudents ?? 0;
        const checkinsCount = classData.totalCheckins ?? 0;
        const checkinLimit = classData.checkinLimit;
        const hasValidLimit = typeof checkinLimit === "number" && checkinLimit > 0;
        const participationRate = hasValidLimit
          ? Math.min(100, (checkinsCount / checkinLimit) * 100)
          : null;

        return {
          classId: classData.classId ?? "",
          className: classData.className ?? "Aula",
          date: raw.period?.end ?? "",
          checkinsCount,
          enrolledCount,
          checkinLimit,
          participationRate,
        };
      });

      const totalCheckinsInPeriod = classes.reduce(
        (acc, classData) => acc + classData.checkinsCount,
        0
      );

      const averageParticipationRate =
        classes.length > 0
          ? classes.reduce((acc, classData) => acc + (classData.participationRate ?? 0), 0) /
            classes.length
          : 0;

      return {
        totalClasses: classes.length,
        totalCheckinsInPeriod,
        averageParticipationRate,
        classes,
        period: {
          startDate: raw.period?.start ?? "",
          endDate: raw.period?.end ?? "",
        },
      } satisfies AdminReportClassParticipation;
    },
    enabled: Boolean(selectedBoxId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
