import { useState } from "react";
import { MapPin, Zap, Flame, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockWod } from "@/lib/mock-data";

type WodBlockType = "WARMUP" | "SKILL" | "WOD";

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

export function HomeScreen() {
  const [checkedIn, setCheckedIn] = useState(false);
  const [showXp, setShowXp] = useState(false);

  const handleCheckin = () => {
    setCheckedIn(true);
    setShowXp(true);
    setTimeout(() => setShowXp(false), 1500);
  };

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Hoje,{" "}
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "short" })}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            {checkedIn ? mockWod.title : "Treino do Dia"}
          </h1>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary">
          <Flame className="h-4 w-4 text-streak" />
          <span className="text-sm font-semibold">12</span>
        </div>
      </div>

      {/* XP Float Animation */}
      {showXp && (
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 animate-xp-float pointer-events-none">
          <span className="text-3xl font-black text-xp">+10 XP</span>
        </div>
      )}

      {!checkedIn ? (
        /* Pre-Checkin State */
        <div className="space-y-4">
          {mockWod.blocks.map((block, i) => (
            <div
              key={i}
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

          <Button
            onClick={handleCheckin}
            className="w-full h-14 text-lg font-bold rounded-xl animate-pulse-glow bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            <MapPin className="mr-2 h-5 w-5" />
            Fazer Check-in
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Você precisa estar a menos de 100m do box
          </p>
        </div>
      ) : (
        /* Post-Checkin State */
        <div className="space-y-4">
          {/* Success banner */}
          <div className="glass-card p-4 flex items-center gap-3 glow-primary">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Check-in realizado!</p>
              <p className="text-xs text-muted-foreground">Streak: 12 dias • +10 XP ganhos</p>
            </div>
          </div>

          {/* WOD Blocks */}
          {mockWod.blocks.map((block, i) => (
            <div
              key={i}
              className={`glass-card p-4 border-l-4 ${blockColors[block.type as WodBlockType]} animate-scale-in`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {blockLabels[block.type as WodBlockType]}
                </span>
              </div>
              <h3 className="font-bold text-sm mb-2">{block.title}</h3>
              <pre className="text-sm text-secondary-foreground whitespace-pre-wrap font-sans leading-relaxed">
                {block.content}
              </pre>
            </div>
          ))}

          {/* Register Result Button */}
          <Button
            className="w-full h-12 font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Registrar Resultado
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
