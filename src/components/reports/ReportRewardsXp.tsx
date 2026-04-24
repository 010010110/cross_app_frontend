import { useState } from "react";
import { ChevronDown, Zap } from "lucide-react";
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
import { useAdminReportRewardsXp } from "@/hooks/use-admin-report-rewards-xp";
import { ReportFilterValues } from "./ReportFilters";

interface ReportRewardsXpProps {
  selectedBoxId: string | null;
  filters: ReportFilterValues;
  minStreak?: number;
  limit?: number;
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

export function ReportRewardsXp({
  selectedBoxId,
  filters,
  minStreak = 0,
  limit = 15,
}: ReportRewardsXpProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const periodLabel = buildPeriodLabel(filters.startDate, filters.endDate);

  const { data, isLoading, isError, error, refetch } = useAdminReportRewardsXp(
    selectedBoxId,
    {
      startDate: filters.startDate,
      endDate: filters.endDate,
      coachId: filters.coachId,
      studentId: filters.studentId,
      minStreak,
      limit,
    }
  );

  const filteredStudents = (data?.students || []).filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStreakBadgeColor = (streak: number) => {
    if (streak >= 30) return "bg-purple-500/20 text-purple-700 dark:text-purple-400";
    if (streak >= 20) return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
    if (streak >= 10) return "bg-green-500/20 text-green-700 dark:text-green-400";
    return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
  };

  if (isError) {
    return (
      <Card className="border-destructive/50 glass-card">
        <CardHeader
          className="flex flex-row items-center justify-between space-y-0 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardTitle className="text-sm font-medium">Distribuição de XP</CardTitle>
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
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Distribuição de XP
          </CardTitle>
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
            placeholder="Buscar aluno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-sm"
          />

          {/* Summary Cards */}
          {data && !isLoading && (
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground font-medium">
                  Total XP Distribuído
                </p>
                <p className="text-lg font-bold text-foreground">
                  {typeof data.totalXpDistributed === "number"
                    ? data.totalXpDistributed.toLocaleString("pt-BR")
                    : "—"}
                </p>
              </div>
              <div className="p-2 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground font-medium">
                  Média por Aluno
                </p>
                <p className="text-lg font-bold text-foreground">
                  {typeof data.averageXpPerStudent === "number"
                    ? data.averageXpPerStudent.toFixed(0)
                    : "—"}
                </p>
              </div>
            </div>
          )}

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
                    <TableHead className="font-medium text-right">XP Total</TableHead>
                    <TableHead className="font-medium text-center">Streak</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.studentId} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Check-ins: {student.checkinsCount}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-bold text-foreground">
                          {typeof student.totalXpInPeriod === "number"
                            ? student.totalXpInPeriod.toLocaleString("pt-BR")
                            : "—"}
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStreakBadgeColor(
                            student.currentStreak
                          )}`}
                        >
                          {student.currentStreak}🔥
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              Nenhum resultado encontrado
            </p>
          )}

          {data && (
            <p className="text-xs text-muted-foreground border-t pt-2">
              {data.studentCount} alunos registrados no período
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
