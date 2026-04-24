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
import { AdminInactiveStudent } from "@/types/admin-reports";
import { useAdminReportInactivity } from "@/hooks/use-admin-report-inactivity";
import { ReportFilterValues } from "./ReportFilters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReportInactivityProps {
  selectedBoxId: string | null;
  filters: ReportFilterValues;
  thresholdDays?: number;
  onThresholdChange?: (days: number) => void;
}

export function ReportInactivity({
  selectedBoxId,
  filters,
  thresholdDays = 7,
  onThresholdChange,
}: ReportInactivityProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDateFilter = Boolean(filters.startDate || filters.endDate);
  const periodLabel = hasDateFilter
    ? "Periodo visualizado: este relatorio nao usa filtro de data; usa dias sem treino"
    : "Periodo visualizado: baseado na data do ultimo check-in";
  const [localThreshold, setLocalThreshold] = useState(
    thresholdDays.toString()
  );
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError, error, refetch } = useAdminReportInactivity(
    selectedBoxId,
    {
      thresholdDays,
      coachId: filters.coachId,
      studentId: filters.studentId,
    }
  );

  const filteredStudents = (data?.students || []).filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleThresholdChange = () => {
    const newThreshold = parseInt(localThreshold, 10);
    if (!isNaN(newThreshold) && newThreshold > 0) {
      onThresholdChange?.(newThreshold);
    }
  };

  if (isError) {
    return (
      <Card className="border-destructive/50 glass-card">
        <CardHeader
          className="flex flex-row items-center justify-between space-y-0 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardTitle className="text-sm font-medium">Alunos Inativos</CardTitle>
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
          <CardTitle className="text-sm font-medium">Alunos Inativos</CardTitle>
          {data && (
            <Badge variant="secondary" className="text-xs">
              {data.inactiveCount}
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
          {/* Threshold Control */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Dias sem treino
              </label>
              <Input
                type="number"
                min="1"
                value={localThreshold}
                onChange={(e) => setLocalThreshold(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <Button
              onClick={handleThresholdChange}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Atualizar
            </Button>
          </div>

          {/* Search */}
          <Input
            placeholder="Buscar aluno..."
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
          ) : filteredStudents.length > 0 ? (
            <div className="overflow-auto max-h-72">
              <Table className="text-xs">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-medium">Aluno</TableHead>
                    <TableHead className="font-medium text-right">Dias</TableHead>
                    <TableHead className="font-medium">Último Check-in</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.studentId} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {student.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {student.daysInactive}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.lastCheckinDate
                          ? (() => {
                              try {
                                return format(new Date(student.lastCheckinDate), "dd/MM/yy HH:mm", {
                                  locale: ptBR,
                                });
                              } catch {
                                return "—";
                              }
                            })()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              Nenhum aluno inativo encontrado
            </p>
          )}

          {data && (
            <p className="text-xs text-muted-foreground border-t pt-2">
              {data.inactiveCount} de {data.totalStudents} alunos inativos
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
