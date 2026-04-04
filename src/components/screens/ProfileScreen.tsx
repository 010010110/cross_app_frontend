import { useState } from "react";
import { Flame, Snowflake, Zap, Trophy, Shield, Target, LogOut, Info, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useRewardsSummary } from "@/hooks/use-rewards-summary";
import { useRewardsMilestones } from "@/hooks/use-rewards-milestones";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const streakStateConfig = {
  ACTIVE: { label: "Ativo", color: "text-xp", bg: "bg-xp/15" },
  AT_RISK: { label: "Em Risco", color: "text-warning", bg: "bg-warning/15" },
  BROKEN: { label: "Quebrado", color: "text-destructive", bg: "bg-destructive/15" },
  INACTIVE: { label: "Inativo", color: "text-muted-foreground", bg: "bg-muted" },
};

const availableMilestones = [
  { streakDays: 7, rewardXp: 50, rewardFreeze: 1 },
  { streakDays: 15, rewardXp: 75, rewardFreeze: 0 },
  { streakDays: 30, rewardXp: 100, rewardFreeze: 1 },
  { streakDays: 45, rewardXp: 125, rewardFreeze: 0 },
  { streakDays: 60, rewardXp: 150, rewardFreeze: 1 },
  { streakDays: 100, rewardXp: 200, rewardFreeze: 1 },
];

export function ProfileScreen() {
  const { logout, user, selectedBoxId } = useAuth();
  const {
    data: rewardSummary,
    isLoading: rewardsLoading,
    isError: rewardsError,
  } = useRewardsSummary(selectedBoxId, Boolean(selectedBoxId));
  const { data: milestones = [] } = useRewardsMilestones(selectedBoxId, Boolean(selectedBoxId));

  const data = rewardSummary;
  const state = streakStateConfig[data?.streakState ?? "INACTIVE"];
  const navigate = useNavigate();
  const displayName = user?.email?.split("@")[0] ?? "Aluno";
  const [rulesOpen, setRulesOpen] = useState(false);
  const initials = displayName
    .split(/[.\s_-]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="glass-card p-5 text-center space-y-3">
        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
          <span className="text-2xl font-black text-gradient">{initials || "AL"}</span>
        </div>
        <div>
          <h1 className="text-xl font-bold">{displayName}</h1>
          <p className="text-sm text-muted-foreground">{selectedBoxId ? "Box ativo" : "Sem box selecionado"}</p>
        </div>
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${state.bg}`}>
          <Shield className={`h-3.5 w-3.5 ${state.color}`} />
          <span className={`text-xs font-bold ${state.color}`}>{state.label}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="glass-card p-3.5 text-center">
          <Flame className="h-5 w-5 text-streak mx-auto mb-1" />
          <p className="text-xl font-black">{data?.currentStreak ?? "-"}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Streak</p>
        </div>
        <div className="glass-card p-3.5 text-center">
          <Zap className="h-5 w-5 text-xp mx-auto mb-1" />
          <p className="text-xl font-black">{data?.totalXp ?? "-"}</p>
          <p className="text-[10px] text-muted-foreground font-medium">XP Total</p>
        </div>
        <div className="glass-card p-3.5 text-center">
          <Trophy className="h-5 w-5 text-warning mx-auto mb-1" />
          <p className="text-xl font-black">{data?.longestStreak ?? "-"}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Recorde</p>
        </div>
      </div>

      {rewardsLoading && (
        <div className="glass-card p-3 text-sm text-muted-foreground">Carregando progressao...</div>
      )}

      {rewardsError && (
        <div className="glass-card p-3 text-sm text-destructive">
          Nao foi possivel carregar seu progresso agora.
        </div>
      )}

      {/* Freeze Bar */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Snowflake className="h-4 w-4 text-freeze" />
            <span className="text-sm font-semibold">Freezes Disponíveis</span>
          </div>
          <span className="text-sm font-bold text-freeze">{data?.availableFreezes ?? 0}</span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i <= (data?.availableFreezes ?? 0) ? "bg-freeze" : "bg-secondary"
              }`}
            />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Freezes permitem manter o streak mesmo sem treinar
        </p>
      </div>

      <Collapsible open={rulesOpen} onOpenChange={setRulesOpen} className="glass-card p-4">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between gap-3 text-left"
            aria-expanded={rulesOpen}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Info className="h-4 w-4 text-primary" />
              Como funciona sua pontuacao
            </span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${rulesOpen ? "rotate-180" : ""}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          <p className="text-xs text-muted-foreground">
            O freeze so e consumido em dias uteis quando voce nao faz check-in e precisa proteger seu streak.
          </p>
          <p className="text-xs text-muted-foreground">Sabado: check-in rende bonus de +5 XP.</p>
          <p className="text-xs text-muted-foreground">Domingo: check-in rende bonus de +5 XP.</p>
          <p className="text-xs text-muted-foreground">
            Fechando check-in nos 7 dias da semana, voce recebe +5 XP extra e +1 freezing de bonus semanal.
          </p>
          <p className="text-xs text-muted-foreground">
            Regra anti-duplicidade: se no mesmo check-in de domingo voce desbloquear milestone de 7 dias e tambem fechar 7/7, o ganho total de freezing sera de apenas +1.
          </p>
        </CollapsibleContent>
      </Collapsible>

      {/* Next Milestone */}
      {data?.nextMilestone && (
        <div className="glass-card p-4 glow-primary">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Próximo Milestone</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center">
              <span className="text-lg font-black text-primary">{data.nextMilestone}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{data.nextMilestone} dias de streak</p>
              <div className="mt-1 h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, (data.currentStreak / data.nextMilestone) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Milestones Grid */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Milestones</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {availableMilestones.map((milestone) => {
            const reachedByMilestone = milestones.some((m) => m.streakDays === milestone.streakDays);
            const reachedByStreak = (data?.currentStreak ?? 0) >= milestone.streakDays;
            const reached = reachedByMilestone || reachedByStreak;

            return (
            <div
              key={milestone.streakDays}
              className={`glass-card p-3 text-center ${
                reached ? "border border-warning/50 bg-warning/10" : "opacity-80"
              }`}
            >
              <div
                className={`h-10 w-10 rounded-full mx-auto mb-1.5 flex items-center justify-center ${
                  reached ? "bg-warning/20" : "bg-secondary"
                }`}
              >
                <Trophy className={`h-5 w-5 ${reached ? "text-warning" : "text-muted-foreground"}`} />
              </div>
              <p className="text-xs font-bold">{milestone.streakDays} dias</p>
              <p className="text-[10px] text-muted-foreground">+{milestone.rewardXp} XP</p>
              <p className="text-[10px] text-freeze">+{milestone.rewardFreeze} freeze</p>
              <p className={`mt-1 text-[10px] font-semibold ${reached ? "text-warning" : "text-muted-foreground"}`}>
                {reached ? "Objetivo concluido" : "Objetivo pendente"}
              </p>
            </div>
          );
          })}
        </div>
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sair da conta{user ? ` (${user.email})` : ""}
      </Button>
    </div>
  );
}
