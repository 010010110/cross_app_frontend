import { Flame, Snowflake, Zap, Trophy, Shield, Target } from "lucide-react";
import { mockRewardSummary, mockMilestones } from "@/lib/mock-data";

const streakStateConfig = {
  ACTIVE: { label: "Ativo", color: "text-xp", bg: "bg-xp/15" },
  AT_RISK: { label: "Em Risco", color: "text-warning", bg: "bg-warning/15" },
  BROKEN: { label: "Quebrado", color: "text-destructive", bg: "bg-destructive/15" },
  INACTIVE: { label: "Inativo", color: "text-muted-foreground", bg: "bg-muted" },
};

export function ProfileScreen() {
  const data = mockRewardSummary;
  const state = streakStateConfig[data.streakState];

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="glass-card p-5 text-center space-y-3">
        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
          <span className="text-2xl font-black text-gradient">JA</span>
        </div>
        <div>
          <h1 className="text-xl font-bold">João Aluno</h1>
          <p className="text-sm text-muted-foreground">Cross Box Alpha</p>
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
          <p className="text-xl font-black">{data.currentStreak}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Streak</p>
        </div>
        <div className="glass-card p-3.5 text-center">
          <Zap className="h-5 w-5 text-xp mx-auto mb-1" />
          <p className="text-xl font-black">{data.totalXp}</p>
          <p className="text-[10px] text-muted-foreground font-medium">XP Total</p>
        </div>
        <div className="glass-card p-3.5 text-center">
          <Trophy className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-black">{data.longestStreak}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Recorde</p>
        </div>
      </div>

      {/* Freeze Bar */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Snowflake className="h-4 w-4 text-freeze" />
            <span className="text-sm font-semibold">Freezes Disponíveis</span>
          </div>
          <span className="text-sm font-bold text-freeze">{data.availableFreezes}</span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i <= data.availableFreezes ? "bg-freeze" : "bg-secondary"
              }`}
            />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Freezes permitem manter o streak mesmo sem treinar
        </p>
      </div>

      {/* Next Milestone */}
      {data.nextMilestone && (
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
                  style={{ width: `${(data.currentStreak / data.nextMilestone) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Milestones Grid */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Milestones</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {mockMilestones.map((m) => (
            <div
              key={m.days}
              className={`glass-card p-3 text-center ${
                m.unlocked ? "glow-primary" : "opacity-50"
              }`}
            >
              <div
                className={`h-10 w-10 rounded-full mx-auto mb-1.5 flex items-center justify-center ${
                  m.unlocked ? "bg-primary/20" : "bg-secondary"
                }`}
              >
                <Trophy
                  className={`h-5 w-5 ${m.unlocked ? "text-primary" : "text-muted-foreground"}`}
                />
              </div>
              <p className="text-xs font-bold">{m.days} dias</p>
              <p className="text-[10px] text-muted-foreground">+{m.xp} XP</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
