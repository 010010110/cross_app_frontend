import { useState } from "react";
import { ReportFilterValues, ReportFilters } from "./ReportFilters";
import { ReportOverview } from "./ReportOverview";
import { ReportInactivity } from "./ReportInactivity";
import { ReportTrainingRanking } from "./ReportTrainingRanking";
import { ReportGymRats } from "./ReportGymRats";
import { ReportClassParticipation } from "./ReportClassParticipation";
import { ReportRewardsXp } from "./ReportRewardsXp";
import { Button } from "@/components/ui/button";
import { AlertCircle, HelpCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdminReportsPanelProps {
  selectedBoxId: string | null;
}

export function AdminReportsPanel({ selectedBoxId }: AdminReportsPanelProps) {
  const [globalFilters, setGlobalFilters] = useState<ReportFilterValues>({});
  const [rankingBy, setRankingBy] = useState<"prs" | "attendance" | "xp">("xp");
  const [thresholdDays, setThresholdDays] = useState(7);
  const [minStreak, setMinStreak] = useState(0);
  const [hasError, setHasError] = useState(false);

  if (!selectedBoxId) {
    return (
      <Alert className="mb-4">
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          Selecione um box para visualizar os relatórios de administração.
        </AlertDescription>
      </Alert>
    );
  }

  const reportSpecificFilters = (
    <div className="flex items-center justify-end pb-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="inline-flex items-center justify-center w-5 h-5 text-muted-foreground hover:text-foreground transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-xs">Use os filtros acima para segmentar dados por período, coach ou aluno. Ajuste as configurações específicas de cada relatório (limiar de inatividade, tipo de ranking, etc) abaixo dos cards.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  return (
    <div className="space-y-4 mt-6">
      {/* Global Filters */}
      <ReportFilters
        selectedBoxId={selectedBoxId}
        filters={globalFilters}
        onFiltersChange={setGlobalFilters}
        reportSpecificFilters={reportSpecificFilters}
      />

      {/* Error Banner */}
      {hasError && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Ocorreu um erro ao carregar alguns relatórios.</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setHasError(false)}
              className="text-xs"
            >
              Descartar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Reports Grid */}
      <div className="space-y-3">
        {/* Overview Report */}
        <ReportOverview selectedBoxId={selectedBoxId} filters={globalFilters} />

        {/* Inactivity Report */}
        <ReportInactivity
          selectedBoxId={selectedBoxId}
          filters={globalFilters}
          thresholdDays={thresholdDays}
          onThresholdChange={setThresholdDays}
        />

        {/* Training Ranking Report */}
        <ReportTrainingRanking
          selectedBoxId={selectedBoxId}
          filters={globalFilters}
          rankingBy={rankingBy}
          limit={10}
          onRankingByChange={setRankingBy}
        />

        {/* Gym Rats Report */}
        <ReportGymRats
          selectedBoxId={selectedBoxId}
          filters={globalFilters}
          limit={10}
        />

        {/* Class Participation Report */}
        <ReportClassParticipation
          selectedBoxId={selectedBoxId}
          filters={globalFilters}
        />

        {/* Rewards XP Report */}
        <ReportRewardsXp
          selectedBoxId={selectedBoxId}
          filters={globalFilters}
          minStreak={minStreak}
          limit={15}
        />
      </div>
    </div>
  );
}
