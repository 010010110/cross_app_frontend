import { useMemo, useState } from "react";
import { Link2, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useBoxCoaches } from "@/hooks/use-box-coaches";
import { useClassesToday } from "@/hooks/use-classes-today";
import { useAdminReportCoachAssignments } from "@/hooks/use-admin-report-coach-assignments";
import { useCreateCoachAssignment } from "@/hooks/use-create-coach-assignment";
import { useDeleteCoachAssignment } from "@/hooks/use-delete-coach-assignment";

interface AdminCoachAssignmentsPanelProps {
  selectedBoxId: string | null;
}

function getErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as { message?: string | string[]; status?: number };
  if (typeof apiError?.message === "string") return apiError.message;
  if (Array.isArray(apiError?.message) && apiError.message.length > 0) {
    return apiError.message.join(", ");
  }

  if (apiError?.status === 409) {
    return "Este vínculo já existe para este coach e turma.";
  }

  if (apiError?.status === 403) {
    return "Seu perfil não tem permissão para esta ação.";
  }

  return fallback;
}

export function AdminCoachAssignmentsPanel({ selectedBoxId }: AdminCoachAssignmentsPanelProps) {
  const { toast } = useToast();
  const [selectedCoachId, setSelectedCoachId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  const { data: coaches = [], isLoading: loadingCoaches } = useBoxCoaches(
    selectedBoxId,
    Boolean(selectedBoxId)
  );
  const { data: classesToday, isLoading: loadingClasses } = useClassesToday(
    selectedBoxId,
    Boolean(selectedBoxId)
  );
  const {
    data: assignments = [],
    isLoading: loadingAssignments,
    isError: assignmentsError,
    refetch: refetchAssignments,
  } = useAdminReportCoachAssignments(selectedBoxId);

  const { mutateAsync: createAssignment, isPending: creatingAssignment } = useCreateCoachAssignment();
  const { mutateAsync: deleteAssignment, isPending: deletingAssignment } = useDeleteCoachAssignment();

  const classOptions = useMemo(() => classesToday?.classes ?? [], [classesToday]);

  const handleCreate = async () => {
    if (!selectedCoachId || !selectedClassId) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione coach e turma para criar o vínculo.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAssignment({ coachId: selectedCoachId, classId: selectedClassId });
      setSelectedClassId("");
      toast({
        title: "Vínculo criado",
        description: "Coach vinculado à turma com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Falha ao criar vínculo",
        description: getErrorMessage(error, "Não foi possível criar o vínculo agora."),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (coachId: string, classId: string) => {
    try {
      await deleteAssignment({ coachId, classId });
      toast({
        title: "Vínculo removido",
        description: "Coach desvinculado da turma com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Falha ao remover vínculo",
        description: getErrorMessage(error, "Não foi possível remover o vínculo agora."),
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Vínculo Coach x Turma
        </CardTitle>
        <CardDescription>
          Gerencie vínculos para habilitar filtros de relatórios por coach.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="coach-assignment-coach">Coach *</Label>
            <Select value={selectedCoachId} onValueChange={setSelectedCoachId}>
              <SelectTrigger id="coach-assignment-coach">
                <SelectValue
                  placeholder={loadingCoaches ? "Carregando coaches..." : "Selecione um coach"}
                />
              </SelectTrigger>
              <SelectContent>
                {coaches.map((coach) => (
                  <SelectItem key={coach._id} value={coach._id}>
                    {coach.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="coach-assignment-class">Turma *</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger id="coach-assignment-class">
                <SelectValue
                  placeholder={loadingClasses ? "Carregando turmas..." : "Selecione uma turma"}
                />
              </SelectTrigger>
              <SelectContent>
                {classOptions.map((classItem) => (
                  <SelectItem key={classItem._id} value={classItem._id}>
                    {classItem.name} ({classItem.startTime}-{classItem.endTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleCreate}
          disabled={creatingAssignment || deletingAssignment || !selectedCoachId || !selectedClassId}
          className="w-full"
        >
          {creatingAssignment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {creatingAssignment ? "Vinculando..." : "Vincular Coach à Turma"}
        </Button>

        <div className="border-t pt-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Vínculos Ativos</p>
            <Button type="button" variant="outline" size="sm" onClick={() => void refetchAssignments()}>
              Atualizar
            </Button>
          </div>

          {loadingAssignments ? (
            <p className="text-sm text-muted-foreground">Carregando vínculos...</p>
          ) : assignmentsError ? (
            <p className="text-sm text-destructive">Não foi possível carregar os vínculos.</p>
          ) : assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum vínculo ativo neste box.</p>
          ) : (
            <div className="space-y-2">
              {assignments.map((assignment, index) => (
                <div
                  key={`${assignment.coachId}-${assignment.classId}-${index}`}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{assignment.coachName}</p>
                    <p className="text-xs text-muted-foreground">Turma: {assignment.className}</p>
                  </div>

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={deletingAssignment}
                    onClick={() => void handleDelete(assignment.coachId, assignment.classId)}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
