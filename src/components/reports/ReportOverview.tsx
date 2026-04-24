import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminReportOverview } from "@/types/admin-reports";
import { useAdminReportOverview } from "@/hooks/use-admin-report-overview";
import { useBoxCoaches } from "@/hooks/use-box-coaches";
import { ReportFilterValues } from "./ReportFilters";

interface ReportOverviewProps {
  selectedBoxId: string | null;
  filters: ReportFilterValues;
}

function buildPeriodLabel(startDate?: string, endDate?: string): string {
  const formatDate = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString("pt-BR");
  };

  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start && end) return `Periodo visualizado: ${start} ate ${end}`;
  if (start) return `Periodo visualizado: desde ${start}`;
  if (end) return `Periodo visualizado: ate ${end}`;
  return "Periodo visualizado: todo o historico";
}

export function ReportOverview({ selectedBoxId, filters }: ReportOverviewProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const periodLabel = buildPeriodLabel(filters.startDate, filters.endDate);
  const { data: coaches = [] } = useBoxCoaches(selectedBoxId);
  const { data, isLoading, isError, error, refetch } = useAdminReportOverview(
    selectedBoxId,
    {
      startDate: filters.startDate,
      endDate: filters.endDate,
      coachId: filters.coachId,
      studentId: filters.studentId,
      classId: filters.classId,
    }
  );

  if (isError) {
    return (
      <Card className="border-destructive/50 glass-card">
        <CardHeader
          className="flex flex-row items-center justify-between space-y-0 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardTitle className="text-sm font-medium">Resumo Geral</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-xs">
              Erro
            </Badge>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isExpanded ? "" : "-rotate-90"
              }`}
            />
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-3">
              {error instanceof Error ? error.message : "Falha ao carregar relatório"}
            </p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Tentar novamente
            </Button>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-sm font-medium">Resumo Geral</CardTitle>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isExpanded ? "" : "-rotate-90"
          }`}
        />
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3 border-b pb-2">{periodLabel}</p>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            </div>
          ) : data ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground font-medium">Alunos</p>
                <p className="text-xl font-bold text-foreground">
                  {data.totalStudents ?? "—"}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground font-medium">Coaches</p>
                <p className="text-xl font-bold text-foreground">
                    {(data.totalCoaches && data.totalCoaches > 0)
                      ? data.totalCoaches
                      : coaches.length}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground font-medium">Aulas</p>
                <p className="text-xl font-bold text-foreground">
                  {data.totalClasses ?? "—"}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground font-medium">Check-ins Hoje</p>
                <p className="text-xl font-bold text-foreground">
                  {data.totalCheckinsToday ?? "—"}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground font-medium">
                  Check-ins no Período
                </p>
                <p className="text-xl font-bold text-foreground">
                  {data.totalCheckinsInPeriod ?? "—"}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground font-medium">
                  Média por Aula
                </p>
                <p className="text-xl font-bold text-foreground">
                  {typeof data.averageCheckinsPerClass === "number"
                    ? data.averageCheckinsPerClass.toFixed(1)
                    : "—"}
                </p>
              </div>

              {data.mostActiveClass && (
                <div className="p-3 bg-muted/50 rounded-lg col-span-2 sm:col-span-3">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Aula Mais Ativa
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {data.mostActiveClass.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {data.mostActiveClass.checkinCount} check-ins
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Nenhum dado encontrado</p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
