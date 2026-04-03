import { useMemo, useState } from "react";
import { Flame, Loader2, School, LogIn, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useBoxesMine } from "@/hooks/use-boxes-mine";
import { useClassesToday } from "@/hooks/use-classes-today";
import { useWodToday } from "@/hooks/use-wod-today";
import { useCheckInClass } from "@/hooks/use-check-in-class";
import { WodBlockType } from "@/types/box";

const blockColors: Record<WodBlockType, string> = {
  WARMUP: "border-l-warning",
  SKILL: "border-l-freeze",
  WOD: "border-l-primary",
};

const blockLabels: Record<WodBlockType, string> = {
  WARMUP: "🔥 Aquecimento",
  SKILL: "🎯 Skill",
  WOD: "💀 WOD",
};

interface HomeScreenProps {
  onOpenNearbyBoxes?: () => void;
  onOpenProfile?: () => void;
}

export function HomeScreen({ onOpenNearbyBoxes, onOpenProfile }: HomeScreenProps) {
  const { user, selectedBoxId, setSelectedBoxId } = useAuth();
  const { toast } = useToast();

  const [checkingInClassId, setCheckingInClassId] = useState<string | null>(null);

  const hasAnyBox = (user?.boxIds.length ?? 0) > 0;

  const { data: enrolledBoxes = [], isLoading: boxesLoading } = useBoxesMine(Boolean(user));
  const hasSelectedEnrolledBox = Boolean(selectedBoxId);

  const {
    data: classesToday,
    isLoading: classesLoading,
    isError: classesError,
  } = useClassesToday(selectedBoxId, hasSelectedEnrolledBox);

  const {
    data: wodToday,
    isLoading: wodLoading,
    isError: wodError,
  } = useWodToday(selectedBoxId, hasSelectedEnrolledBox);

  const { mutateAsync: checkInClass, isPending: checkInPending } = useCheckInClass();

  const activeEnrolledBox = useMemo(
    () => enrolledBoxes.find((box) => box._id === selectedBoxId) ?? null,
    [enrolledBoxes, selectedBoxId]
  );

  const displayWod = classesToday?.wod ?? wodToday;
  const formattedWodDate = displayWod?.date
    ? displayWod.date.split("T")[0].replace(/(\d{4})-(\d{2})-(\d{2})/, "$3/$2/$1")
    : null;

  const handleCheckIn = async (classId: string, className: string) => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocalização indisponível",
        description: "Não foi possível acessar sua localização neste dispositivo.",
        variant: "destructive",
      });
      return;
    }

    setCheckingInClassId(classId);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          await checkInClass({
            classId,
            latitude: parseFloat(coords.latitude.toFixed(6)),
            longitude: parseFloat(coords.longitude.toFixed(6)),
          });

          toast({
            title: "Check-in realizado com sucesso",
            description: `Você fez check-in na aula ${className}.`,
          });
        } catch (err: unknown) {
          const status = (err as { status?: number })?.status;
          const message = (err as { message?: string | string[] })?.message;
          toast({
            title: "Falha ao fazer check-in",
            description:
              typeof message === "string"
                ? message
                : status === 400
                  ? "Localização fora do box ou aula não está em horário"
                  : "Não foi possível fazer seu check-in neste momento.",
            variant: "destructive",
          });
        } finally {
          setCheckingInClassId(null);
        }
      },
      () => {
        setCheckingInClassId(null);
        toast({
          title: "Não foi possível obter localização",
          description: "Ative a permissão de localização e tente novamente.",
          variant: "destructive",
        });
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Hoje,{" "}
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "short",
            })}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">{activeEnrolledBox?.name ?? "Seus boxes"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary">
            <Flame className="h-4 w-4 text-streak" />
            <span className="text-sm font-semibold">12</span>
          </div>
          <UserMenu onOpenProfile={onOpenProfile} />
        </div>
      </div>

      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Meus boxes</p>
          <Button size="sm" variant="outline" onClick={onOpenNearbyBoxes}>
            <Compass className="h-4 w-4 mr-2" />
            Buscar novo box
          </Button>
        </div>

        {boxesLoading && <p className="text-sm text-muted-foreground">Carregando boxes...</p>}

        {!boxesLoading && enrolledBoxes.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Você ainda não está matriculado em um box. Escolha um box próximo para se matricular.
          </p>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {enrolledBoxes.map((box) => (
            <Button
              key={box._id}
              type="button"
              variant={selectedBoxId === box._id ? "default" : "outline"}
              className="shrink-0"
              onClick={() => setSelectedBoxId(box._id)}
            >
              {box.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <School className="h-4 w-4 text-primary" />
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Aulas disponíveis hoje
          </p>
        </div>

        {!hasAnyBox && (
          <p className="text-sm text-muted-foreground">Matricule-se em um box para ver as aulas do dia.</p>
        )}

        {hasAnyBox && classesLoading && (
          <p className="text-sm text-muted-foreground">Carregando aulas...</p>
        )}

        {hasAnyBox && classesError && (
          <p className="text-sm text-destructive">Não foi possível carregar as aulas do dia.</p>
        )}

        {hasAnyBox && !classesLoading && !classesError && (classesToday?.classes.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma aula disponível para hoje no box selecionado.</p>
        )}

        {(classesToday?.classes.length ?? 0) > 0 && (
          <ScrollArea className="h-[220px] w-full rounded-lg border border-border/40 bg-secondary/20 p-1">
            <div className="space-y-2 pr-4">
              {classesToday?.classes.map((classItem) => {
                const isCheckingIn = checkingInClassId === classItem._id;
                return (
                  <div
                    key={classItem._id}
                    className="rounded-lg border border-border/60 bg-secondary/40 px-3 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{classItem.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {classItem.startTime} - {classItem.endTime}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        disabled={checkInPending || Boolean(checkingInClassId)}
                        onClick={(e) => {
                          e.preventDefault();
                          void handleCheckIn(classItem._id, classItem.name);
                        }}
                      >
                        {isCheckingIn ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Entrando...
                          </>
                        ) : (
                          <>
                            <LogIn className="h-4 w-4 mr-2" />
                            Check-in
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">WOD do dia</p>

        {!hasAnyBox && (
          <p className="text-sm text-muted-foreground">Selecione ou matricule-se em um box para ver o WOD.</p>
        )}

        {hasAnyBox && wodLoading && !displayWod && (
          <p className="text-sm text-muted-foreground">Carregando WOD...</p>
        )}

        {hasAnyBox && wodError && !displayWod && (
          <p className="text-sm text-destructive">Não foi possível carregar o WOD de hoje.</p>
        )}

        {hasAnyBox && !wodLoading && !displayWod && (
          <p className="text-sm text-muted-foreground">Ainda não existe WOD cadastrado para hoje neste box.</p>
        )}

        {displayWod && (
          <>
            {formattedWodDate && (
              <p className="text-xs text-muted-foreground">Data: {formattedWodDate}</p>
            )}
            <h3 className="text-lg font-bold tracking-tight">{displayWod.title}</h3>
            {displayWod.blocks.map((block, i) => (
              <div
                key={`${block.type}-${i}`}
                className={`glass-card p-4 border-l-4 ${blockColors[block.type as WodBlockType]}`}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {blockLabels[block.type as WodBlockType]}
                </span>
                <h3 className="font-bold text-sm mt-1 mb-2">{block.title}</h3>
                <pre className="text-sm text-secondary-foreground whitespace-pre-wrap font-sans leading-relaxed">
                  {block.content}
                </pre>
              </div>
            ))}
          </>
        )}
      </div>

      {!selectedBoxId && hasAnyBox && (
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">
            Selecione um box em "Meus boxes" para carregar aulas e WOD.
          </p>
        </div>
      )}
    </div>
  );
}
