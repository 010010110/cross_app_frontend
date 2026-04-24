import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminReportTrainingRanking } from "@/hooks/use-admin-report-training-ranking";
import { ReportFilterValues } from "./ReportFilters";

interface ReportTrainingRankingProps {
  selectedBoxId: string | null;
  filters: ReportFilterValues;
  rankingBy?: "prs" | "attendance" | "xp";
  limit?: number;
  onRankingByChange?: (by: "prs" | "attendance" | "xp") => void;
}

const RANKING_BY_LABELS: Record<string, string> = {
  prs: "Personal Records (PRs)",
  attendance: "Frequência de Treinos",
  xp: "Pontos de Experiência (XP)",
};

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

export function ReportTrainingRanking({
  selectedBoxId,
  filters,
  rankingBy = "xp",
  limit = 10,
  onRankingByChange,
}: ReportTrainingRankingProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const periodLabel = buildPeriodLabel(filters.startDate, filters.endDate);

  const { data, isLoading, isError, error, refetch } =
    useAdminReportTrainingRanking(selectedBoxId, {
      rankingBy,
      limit,
      startDate: filters.startDate,
      endDate: filters.endDate,
      coachId: filters.coachId,
      studentId: filters.studentId,
    });

  const filteredStudents = (data?.students || []).filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isError) {
    return (
      <Card className="border-destructive/50 glass-card">
        <CardHeader
          className="flex flex-row items-center justify-between space-y-0 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardTitle className="text-sm font-medium">Ranking de Treino</CardTitle>
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
        <CardTitle className="text-sm font-medium">Ranking de Treino</CardTitle>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isExpanded ? "" : "-rotate-90"
          }`}
        />
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground border-b pb-2">{periodLabel}</p>
          {/* Ranking Type Selector */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Classificar por
              </label>
              <Select value={rankingBy} onValueChange={onRankingByChange}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xp">Pontos de Experiência (XP)</SelectItem>
                  <SelectItem value="attendance">Frequência de Treinos</SelectItem>
                  <SelectItem value="prs">Personal Records (PRs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                    <TableHead className="font-medium w-8">🏆</TableHead>
                    <TableHead className="font-medium">Aluno</TableHead>
                    <TableHead className="font-medium text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, idx) => (
                    <TableRow key={student.studentId} className="hover:bg-muted/50">
                      <TableCell className="font-bold text-center">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {student.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {student.scoreLabel}
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

          <p className="text-xs text-muted-foreground border-t pt-2">
            Métrica: {RANKING_BY_LABELS[rankingBy]}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
