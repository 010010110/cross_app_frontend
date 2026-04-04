import { FormEvent, useMemo, useState } from "react";
import { CalendarDays, Dumbbell, Loader2, Plus, Search, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useExercises } from "@/hooks/use-exercises";
import { useResultsList } from "@/hooks/use-results-list";
import { useResultsPrList } from "@/hooks/use-results-pr-list";
import { useCreateResultPr } from "@/hooks/use-create-result-pr";
import { useCreateResult } from "@/hooks/use-create-result";
import { useWodToday } from "@/hooks/use-wod-today";
import { AutoFeedPostStatus, ResultListItem, WodResultListItem } from "@/types/result";
import { WodModel } from "@/types/box";
import { Line, LineChart, XAxis, YAxis } from "recharts";

type EvolutionView = "prs" | "wod";
type WodScoreMode = "REPS" | "TIME" | "FLEX" | "UNKNOWN";
type WodSelectionOption = {
  _id: string;
  title: string;
  date: string | null;
  model?: WodModel | null;
};

const scoreKindLabel: Record<string, string> = {
  TIME: "Tempo",
  LOAD: "Carga",
  UNKNOWN: "Score",
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatWodDate(value: string | null) {
  if (!value) return "Data indisponivel";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Data indisponivel";
  return parsed.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function sortByCreatedAtAsc(a: ResultListItem, b: ResultListItem) {
  return +new Date(a.createdAt) - +new Date(b.createdAt);
}

function parseScoreToNumber(score: string, scoreKind: string): number | null {
  const normalized = score.trim().replace(",", ".");

  if (scoreKind === "TIME") {
    const parts = normalized.split(":").map((part) => Number(part));
    if (parts.some((value) => Number.isNaN(value))) return null;
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  const match = normalized.match(/\d+(?:\.\d+)?/);
  if (!match) return null;

  const value = Number(match[0]);
  return Number.isNaN(value) ? null : value;
}

function detectWodScoreMode(
  wodModel?: WodModel,
  wodTitle?: string,
  wodBlocks?: Array<{ title: string; content: string }>
): WodScoreMode {
  if (wodModel === "AMRAP" || wodModel === "EMOM" || wodModel === "TABATA") {
    return "REPS";
  }

  if (wodModel === "FOR_TIME" || wodModel === "RFT" || wodModel === "CHIPPER") {
    return "TIME";
  }

  if (wodModel === "LADDER" || wodModel === "INTERVALS") {
    return "FLEX";
  }

  const source = [wodTitle ?? "", ...(wodBlocks ?? []).map((block) => `${block.title} ${block.content}`)]
    .join(" ")
    .toLowerCase();

  if (
    source.includes("amrap") ||
    source.includes("emom") ||
    source.includes("tabata") ||
    source.includes("reps") ||
    source.includes("repeti")
  ) {
    return "REPS";
  }

  if (
    source.includes("for time") ||
    source.includes("rft") ||
    source.includes("chipper") ||
    source.includes("time cap") ||
    source.includes("menor tempo")
  ) {
    return "TIME";
  }

  if (source.includes("ladder") || source.includes("interval")) {
    return "FLEX";
  }

  return "UNKNOWN";
}

function isValidRepsScore(value: string): boolean {
  const trimmed = value.trim();
  return /^(\d+\s*(reps?)?|\d+\s*\+\s*\d+)$/i.test(trimmed);
}

function isValidTimeScore(value: string): boolean {
  const trimmed = value.trim();
  return /^\d{1,2}:\d{2}$/.test(trimmed) || /^\d{1,2}:\d{2}:\d{2}$/.test(trimmed);
}

function maskTimeScoreInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 6);

  if (!digits) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) {
    const mm = digits.slice(0, digits.length - 2);
    const ss = digits.slice(-2);
    return `${mm}:${ss}`;
  }

  const hh = digits.slice(0, digits.length - 4);
  const mm = digits.slice(-4, -2);
  const ss = digits.slice(-2);
  return `${hh}:${mm}:${ss}`;
}

function normalizeRepsScoreInput(value: string): string {
  const cleaned = value.replace(/[^\d+]/g, "");
  const parts = cleaned.split("+").filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return `${parts[0]}+${parts[1]}`;
}

function normalizeWodScoreInputByMode(value: string, mode: WodScoreMode): string {
  if (mode === "TIME") return maskTimeScoreInput(value);
  if (mode === "REPS") return normalizeRepsScoreInput(value);
  return value;
}

function normalizeWodScorePayload(value: string, mode: WodScoreMode): string {
  const trimmed = value.trim();
  if (mode === "TIME") return trimmed;
  if (mode === "REPS") return normalizeRepsScoreInput(trimmed);
  return trimmed;
}

function autoFeedPostStatusLabel(status: AutoFeedPostStatus): string {
  switch (status) {
    case "created":
      return "Post automatico criado no feed.";
    case "skipped-no-checkin":
      return "Sem post automatico: nenhum check-in valido encontrado.";
    case "skipped-already-posted":
    case "skipped-existing-post":
      return "Sem post automatico: check-in ja possuia post.";
    case "skipped-no-new-pr":
      return "Sem post automatico: resultado nao foi novo PR.";
    case "failed":
      return "PR salvo, mas houve falha ao criar post automatico.";
    default:
      return "Status de auto post indisponivel.";
  }
}

function PrResultCard({ item }: { item: ResultListItem }) {
  return (
    <div className="glass-card p-4 space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">{item.exerciseName ?? "Exercício"}</p>
          <p className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-base font-bold text-primary">{item.score}</p>
          <p className="text-[11px] text-muted-foreground">{scoreKindLabel[item.scoreKind] ?? item.scoreKind}</p>
        </div>
      </div>
      {item.isNewPR && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
            <Trophy className="h-3.5 w-3.5" />
            Novo PR
          </span>
        </div>
      )}
    </div>
  );
}

function WodResultCard({ item }: { item: WodResultListItem }) {
  return (
    <div className="glass-card p-4 space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">{item.wodTitle ?? "WOD"}</p>
          <p className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-base font-bold text-primary">{item.score}</p>
          <p className="text-[11px] text-muted-foreground">{scoreKindLabel[item.scoreKind] ?? item.scoreKind}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] text-secondary-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          WOD completo
        </span>
        {item.wodModel && (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
            {item.wodModel}
          </span>
        )}
      </div>
    </div>
  );
}

export function EvolutionScreen() {
  const { user, selectedBoxId } = useAuth();
  const { toast } = useToast();

  const [view, setView] = useState<EvolutionView>("prs");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(50);

  const [prDialogOpen, setPrDialogOpen] = useState(false);
  const [wodDialogOpen, setWodDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyExerciseId, setHistoryExerciseId] = useState<string | null>(null);
  const [prExerciseId, setPrExerciseId] = useState("");
  const [prScore, setPrScore] = useState("");
  const [prAutoPostText, setPrAutoPostText] = useState("");
  const [selectedWodId, setSelectedWodId] = useState("");
  const [wodScore, setWodScore] = useState("");

  const enabled = Boolean(user && selectedBoxId);

  const {
    data: exercises = [],
    isLoading: exercisesLoading,
  } = useExercises(enabled);
  const {
    data: prResults = [],
    isLoading: prLoading,
    isError: prError,
    refetch: refetchPrs,
  } = useResultsPrList(limit, enabled);
  const {
    data: allResults = [],
    isLoading: allResultsLoading,
    isError: allResultsError,
    refetch: refetchResults,
  } = useResultsList(limit, enabled);
  const { data: wodToday } = useWodToday(selectedBoxId, enabled);

  const { mutateAsync: createPr, isPending: createPrPending } = useCreateResultPr();
  const { mutateAsync: createWodResult, isPending: createWodPending } = useCreateResult();

  const wodResults = useMemo(
    () => allResults.slice().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [allResults]
  );

  const wodOptions = useMemo(() => {
    const optionsById = new Map<string, WodSelectionOption>();

    if (wodToday?._id) {
      optionsById.set(wodToday._id, {
        _id: wodToday._id,
        title: wodToday.title ?? "WOD de hoje",
        date: wodToday.date ?? null,
        model: wodToday.model,
      });
    }

    for (const item of wodResults) {
      if (!item.wodId || optionsById.has(item.wodId)) continue;
      optionsById.set(item.wodId, {
        _id: item.wodId,
        title: item.wodTitle ?? `WOD ${item.wodId.slice(-6)}`,
        date: item.wodDate ?? null,
        model: item.wodModel,
      });
    }

    return Array.from(optionsById.values()).sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return +new Date(b.date) - +new Date(a.date);
    });
  }, [wodResults, wodToday]);

  const selectedWodOption = useMemo(
    () => wodOptions.find((option) => option._id === selectedWodId) ?? null,
    [wodOptions, selectedWodId]
  );

  const selectedWodBlocks = useMemo(() => {
    if (!selectedWodOption?._id || selectedWodOption._id !== wodToday?._id) return undefined;
    return wodToday.blocks;
  }, [selectedWodOption, wodToday]);

  const detectedWodScoreMode = useMemo(
    () =>
      detectWodScoreMode(
        selectedWodOption?.model ?? wodToday?.model,
        selectedWodOption?.title ?? wodToday?.title,
        selectedWodBlocks
      ),
    [selectedWodBlocks, selectedWodOption, wodToday]
  );
  const effectiveWodScoreMode = detectedWodScoreMode;

  const prHistoryByExercise = useMemo(() => {
    const byExercise: Record<string, ResultListItem[]> = {};

    for (const item of prResults) {
      const exerciseId = item.exerciseId;
      if (!exerciseId) continue;
      if (!byExercise[exerciseId]) byExercise[exerciseId] = [];
      byExercise[exerciseId].push(item);
    }

    for (const exerciseId of Object.keys(byExercise)) {
      byExercise[exerciseId] = byExercise[exerciseId].slice().sort(sortByCreatedAtAsc);
    }

    return byExercise;
  }, [prResults]);

  const latestPrPerExercise = useMemo(() => {
    return Object.values(prHistoryByExercise)
      .map((history) => history[history.length - 1])
      .filter(Boolean)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [prHistoryByExercise]);

  const filteredPrs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return latestPrPerExercise;

    return latestPrPerExercise.filter((item) => {
      const exerciseName = (item.exerciseName ?? "").toLowerCase();
      const score = item.score.toLowerCase();
      return exerciseName.includes(query) || score.includes(query);
    });
  }, [latestPrPerExercise, search]);

  const filteredWodResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return wodResults;

    return wodResults.filter((item) => {
      const wodTitle = (item.wodTitle ?? "").toLowerCase();
      const score = item.score.toLowerCase();
      return wodTitle.includes(query) || score.includes(query);
    });
  }, [wodResults, search]);

  const activeLoading = view === "prs" ? prLoading : allResultsLoading;
  const activeError = view === "prs" ? prError : allResultsError;
  const activeListEmpty = view === "prs" ? filteredPrs.length === 0 : filteredWodResults.length === 0;
  const selectedHistory = useMemo(
    () => (historyExerciseId ? prHistoryByExercise[historyExerciseId] ?? [] : []),
    [historyExerciseId, prHistoryByExercise]
  );
  const selectedHistoryExerciseName = selectedHistory[0]?.exerciseName ?? "Exercício";
  const historyChartData = useMemo(() => {
    return selectedHistory
      .map((item, index) => ({
        index: index + 1,
        label: formatDateTime(item.createdAt),
        scoreRaw: item.score,
        value: parseScoreToNumber(item.score, item.scoreKind),
      }))
      .filter((item) => typeof item.value === "number");
  }, [selectedHistory]);

  const handleCreatePr = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!prExerciseId || prScore.trim().length === 0) {
      toast({
        title: "Dados incompletos",
        description: "Selecione um exercício e informe o score.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await createPr({
        exerciseId: prExerciseId,
        score: prScore.trim(),
        autoPostText: prAutoPostText.trim() || undefined,
      });
      await Promise.all([refetchPrs(), refetchResults()]);

      setPrExerciseId("");
      setPrScore("");
      setPrAutoPostText("");
      setPrDialogOpen(false);

      toast({
        title: response.isNewPR ? "Novo PR registrado" : "Resultado registrado",
        description: `${response.message} ${autoFeedPostStatusLabel(response.autoFeedPost.status)}`,
      });
    } catch (error: unknown) {
      const message = (error as { message?: string | string[] })?.message;
      toast({
        title: "Falha ao registrar PR",
        description: typeof message === "string" ? message : "Tente novamente em instantes.",
        variant: "destructive",
      });
    }
  };

  const handleCreateWodResult = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedWodId) {
      toast({
        title: "WOD indisponível",
        description: "Selecione um WOD para registrar o resultado.",
        variant: "destructive",
      });
      return;
    }

    if (wodScore.trim().length === 0) {
      toast({
        title: "Dados incompletos",
        description: "Informe o score do WOD completo.",
        variant: "destructive",
      });
      return;
    }

    if (effectiveWodScoreMode === "REPS" && !isValidRepsScore(wodScore)) {
      toast({
        title: "Formato inválido",
        description: "Para WOD AMRAP, informe apenas o número de repetições (ex: 120).",
        variant: "destructive",
      });
      return;
    }

    if (effectiveWodScoreMode === "TIME" && !isValidTimeScore(wodScore)) {
      toast({
        title: "Formato inválido",
        description: "Para WOD por tempo, informe mm:ss ou hh:mm:ss (ex: 08:34).",
        variant: "destructive",
      });
      return;
    }

    if (
      effectiveWodScoreMode === "FLEX" &&
      !isValidRepsScore(wodScore) &&
      !isValidTimeScore(wodScore)
    ) {
      toast({
        title: "Formato inválido",
        description: "Para este modelo, informe reps (ex: 120 ou 7+12) ou tempo (ex: 08:34).",
        variant: "destructive",
      });
      return;
    }

    try {
      const normalizedScore = normalizeWodScorePayload(wodScore, effectiveWodScoreMode);
      const response = await createWodResult({
        wodId: selectedWodId,
        score: normalizedScore,
      });

      await Promise.all([refetchResults(), refetchPrs()]);

      setWodScore("");
      setWodDialogOpen(false);

      toast({
        title: "Resultado do WOD registrado",
        description: response.message,
      });
    } catch (error: unknown) {
      const message = (error as { message?: string | string[] })?.message;
      toast({
        title: "Falha ao registrar resultado",
        description: typeof message === "string" ? message : "Tente novamente em instantes.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Evolução</h1>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setView("prs")}
          className={`h-10 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
            view === "prs"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          <Trophy className="h-4 w-4" />
          PRs
        </button>
        <button
          type="button"
          onClick={() => setView("wod")}
          className={`h-10 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
            view === "wod"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          <Dumbbell className="h-4 w-4" />
          Resultados de WOD
        </button>
      </div>

      <div className="flex gap-2">
        <Dialog open={prDialogOpen} onOpenChange={setPrDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Novo PR
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo PR por exercício</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePr} className="space-y-3">
              <select
                value={prExerciseId}
                onChange={(event) => setPrExerciseId(event.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={exercisesLoading || createPrPending}
              >
                <option value="">Selecione um exercício</option>
                {exercises.map((exercise) => (
                  <option key={exercise._id} value={exercise._id}>
                    {exercise.name}
                  </option>
                ))}
              </select>

              <Input
                value={prScore}
                onChange={(event) => setPrScore(event.target.value)}
                placeholder="Ex: 95kg ou 01:50"
                disabled={createPrPending}
              />

              <textarea
                value={prAutoPostText}
                onChange={(event) => setPrAutoPostText(event.target.value)}
                placeholder="Texto opcional para auto-post quando houver novo PR"
                maxLength={1200}
                className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={createPrPending}
              />

              <Button type="submit" className="w-full" disabled={createPrPending}>
                {createPrPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar PR"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={wodDialogOpen}
          onOpenChange={(open) => {
            setWodDialogOpen(open);
            if (open) {
              setSelectedWodId((current) => current || wodToday?._id || wodOptions[0]?._id || "");
            }
          }}
        >
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Resultado WOD
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar resultado do WOD</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateWodResult} className="space-y-3">
              <select
                value={selectedWodId}
                onChange={(event) => setSelectedWodId(event.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={createWodPending || wodOptions.length === 0}
              >
                <option value="">Selecione um WOD</option>
                {wodOptions.map((option) => (
                  <option key={option._id} value={option._id}>
                    {option.title} - {formatWodDate(option.date)}
                  </option>
                ))}
              </select>

              {wodOptions.length === 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Nenhum WOD disponível para seleção no momento.
                </p>
              )}

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Tipo de score do WOD</p>
                <p className="text-[11px] text-muted-foreground">
                  {effectiveWodScoreMode === "REPS" && "Modelo de reps (AMRAP/EMOM/TABATA)."}
                  {effectiveWodScoreMode === "TIME" && "Modelo de tempo (FOR_TIME/RFT/CHIPPER)."}
                  {effectiveWodScoreMode === "FLEX" && "Modelo híbrido (LADDER/INTERVALS): aceita reps ou tempo."}
                  {effectiveWodScoreMode === "UNKNOWN" && "Modelo não identificado: sem bloqueio de formato."}
                </p>
              </div>

              <Input
                value={wodScore}
                onChange={(event) =>
                  setWodScore(normalizeWodScoreInputByMode(event.target.value, effectiveWodScoreMode))
                }
                placeholder={
                  effectiveWodScoreMode === "REPS"
                    ? "Ex: 120, 120 reps ou 7+12"
                    : effectiveWodScoreMode === "TIME"
                      ? "Ex: 08:34"
                      : effectiveWodScoreMode === "FLEX"
                        ? "Ex: 120, 7+12 ou 08:34"
                        : "Ex: 120, 7+12 ou 08:34"
                }
                disabled={createWodPending}
              />

              <Button type="submit" className="w-full" disabled={createWodPending || !selectedWodId}>
                {createWodPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar resultado"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Histórico: {selectedHistoryExerciseName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
              {historyChartData.length >= 2 && (
                <ChartContainer
                  config={{
                    value: {
                      label: "Evolução",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-52 w-full"
                >
                  <LineChart data={historyChartData} margin={{ left: 8, right: 8, top: 8, bottom: 4 }}>
                    <XAxis
                      dataKey="index"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => `${value}`}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          formatter={(value, name, item) => {
                            const payload = item.payload as { scoreRaw: string; label: string };
                            return (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-muted-foreground">{name}</span>
                                <span className="font-semibold text-foreground">{payload.scoreRaw}</span>
                                <span className="text-muted-foreground">{payload.label}</span>
                              </div>
                            );
                          }}
                        />
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-value)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ChartContainer>
              )}

              {selectedHistory.length > 0 && historyChartData.length < 2 && (
                <p className="text-xs text-muted-foreground">
                  Dados numéricos insuficientes para gráfico. Exibindo histórico em lista.
                </p>
              )}

              {selectedHistory.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>
              )}

              {selectedHistory.map((item) => (
                <div key={item._id} className="rounded-md border border-border/60 px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {scoreKindLabel[item.scoreKind] ?? item.scoreKind}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-primary">{item.score}</p>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={view === "prs" ? "Buscar PR por exercício..." : "Buscar resultados de WOD..."}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-secondary px-3 py-1">{latestPrPerExercise.length} exercícios com PR</span>
        <span className="rounded-full bg-secondary px-3 py-1">{wodResults.length} resultados de WOD</span>
      </div>

      {view === "wod" && (
        <div className="glass-card p-3 text-xs text-muted-foreground">
          O resultado do WOD representa seu score final do treino completo do dia.
        </div>
      )}

      {activeLoading && (
        <div className="glass-card p-4 text-sm text-muted-foreground">Carregando evolução...</div>
      )}

      {activeError && (
        <div className="glass-card p-4 space-y-2">
          <p className="text-sm text-destructive">Falha ao carregar resultados.</p>
          <Button variant="outline" size="sm" onClick={() => void (view === "prs" ? refetchPrs() : refetchResults())}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!activeLoading && !activeError && activeListEmpty && (
        <div className="glass-card p-5 text-center space-y-2">
          <p className="font-semibold text-sm">
            {view === "prs"
              ? "Nenhum PR encontrado"
              : "Nenhum resultado de WOD encontrado"}
          </p>
          <p className="text-xs text-muted-foreground">
            {view === "prs"
              ? "Crie seu primeiro PR por exercício para iniciar sua evolução."
              : "Registre seus resultados de treino para acompanhar desempenho em WODs."}
          </p>
        </div>
      )}

      <div className="space-y-2.5">
        {view === "prs"
          ? filteredPrs.map((item) => (
              <button
                key={item._id}
                type="button"
                className="w-full text-left"
                onClick={() => {
                  setHistoryExerciseId(item.exerciseId);
                  setHistoryDialogOpen(true);
                }}
              >
                <PrResultCard item={item} />
              </button>
            ))
          : filteredWodResults.map((item) => (
              <WodResultCard key={item._id} item={item} />
            ))}
      </div>

      {!activeLoading && !activeError && (view === "prs" ? latestPrPerExercise.length : allResults.length) >= limit && (
        <Button variant="outline" className="w-full" onClick={() => setLimit((current) => Math.min(current + 25, 200))}>
          Carregar mais
        </Button>
      )}
    </div>
  );
}
