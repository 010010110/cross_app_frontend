import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminReportClassParticipation } from "@/hooks/use-admin-report-class-participation";
import { ReportFilterValues } from "./ReportFilters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReportClassParticipationProps {
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

export function ReportClassParticipation({
  selectedBoxId,
  filters,
}: ReportClassParticipationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const periodLabel = buildPeriodLabel(filters.startDate, filters.endDate);

  const { data, isLoading, isError, error, refetch } =
    useAdminReportClassParticipation(selectedBoxId, {
      startDate: filters.startDate,
      endDate: filters.endDate,
      coachId: filters.coachId,
      studentId: filters.studentId,
      classId: filters.classId,
    });

  const filteredClasses = (data?.classes || []).filter(
    (classData) =>
      classData.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (classData.coachName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ?? false)
  );

  const getParticipationColor = (rate: number | null) => {
    if (typeof rate !== "number") return "text-muted-foreground";
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (isError) {
    return (
      <Card className="border-destructive/50 glass-card">
        <CardHeader
          className="flex flex-row items-center justify-between space-y-0 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardTitle className="text-sm font-medium">
            Participação por Aula
          </CardTitle>
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
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">
            Participação por Aula
          </CardTitle>
          {data && (
            <Badge variant="secondary" className="text-xs">
              {data.totalClasses}
            </Badge>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isExpanded ? "" : "-rotate-90"
          }`}
        />
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground border-b pb-2">{periodLabel}</p>
          {/* Search */}
          <Input
            placeholder="Buscar aula ou coach..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-sm"
          />

          {/* Table */}
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            </div>
          ) : filteredClasses.length > 0 ? (
            <div className="overflow-auto max-h-72">
              <Table className="text-xs">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-medium">Aula</TableHead>
                    <TableHead className="font-medium">Data</TableHead>
                    <TableHead className="font-medium text-right">Check-ins</TableHead>
                    <TableHead className="font-medium text-right">Taxa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((classData) => (
                    <TableRow
                      key={`${classData.classId}-${classData.date}`}
                      className="hover:bg-muted/50"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{classData.className}</p>
                          {classData.coachName && (
                            <p className="text-xs text-muted-foreground">
                              Coach: {classData.coachName}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {classData.date
                          ? (() => {
                              try {
                                return format(new Date(classData.date), "dd/MM/yy", {
                                  locale: ptBR,
                                });
                              } catch {
                                return "—";
                              }
                            })()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {classData.checkinsCount}/
                        {typeof classData.checkinLimit === "number" && classData.checkinLimit > 0
                          ? classData.checkinLimit
                          : "sem limite"}
                      </TableCell>
                      <TableCell
                        className={`text-right font-bold ${getParticipationColor(
                          classData.participationRate
                        )}`}
                      >
                        {typeof classData.participationRate === "number"
                          ? `${classData.participationRate.toFixed(0)}%`
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              Nenhum dado de participação encontrado
            </p>
          )}

          {data && (
            <div className="border-t pt-2 space-y-1">
              <p className="text-xs text-muted-foreground">
                Total de check-ins no período: {data.totalCheckinsInPeriod ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                Taxa média de participação:{" "}
                <span className="font-bold text-foreground">
                  {typeof data.averageParticipationRate === "number"
                    ? data.averageParticipationRate.toFixed(0)
                    : "—"}%
                </span>
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
