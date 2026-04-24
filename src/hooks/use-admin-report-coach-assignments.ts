import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CoachAssignment } from "@/types/coach-assignment";

interface RawCoachAssignment {
  coachId?: string;
  classId?: string;
  createdAt?: string;
  coachName?: string;
  className?: string;
  coach?: {
    _id?: string;
    id?: string;
    name?: string;
  };
  class?: {
    _id?: string;
    id?: string;
    name?: string;
  };
}

function normalizeAssignment(item: RawCoachAssignment): CoachAssignment {
  const coachId = item.coachId ?? item.coach?._id ?? item.coach?.id ?? "";
  const classId = item.classId ?? item.class?._id ?? item.class?.id ?? "";
  const coachName = item.coachName ?? item.coach?.name ?? "Coach";
  const className = item.className ?? item.class?.name ?? "Turma";

  return {
    coachId,
    coachName,
    classId,
    className,
    createdAt: item.createdAt,
  };
}

export function useAdminReportCoachAssignments(
  selectedBoxId: string | null,
  filters?: { coachId?: string }
) {
  const queryParams = new URLSearchParams();
  if (filters?.coachId) queryParams.append("coachId", filters.coachId);
  const queryString = queryParams.toString();
  const url = `/admin/reports/coach-assignments${queryString ? `?${queryString}` : ""}`;

  return useQuery({
    queryKey: ["admin-reports", "coach-assignments", selectedBoxId, filters?.coachId],
    queryFn: async () => {
      const raw = await api.get<RawCoachAssignment[]>(url);
      return (raw ?? []).map(normalizeAssignment);
    },
    enabled: Boolean(selectedBoxId),
    initialData: [] as CoachAssignment[],
    staleTime: 5 * 60 * 1000,
  });
}
