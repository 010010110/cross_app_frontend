import { useState } from "react";
import { Search, Plus, Dumbbell, TrendingUp } from "lucide-react";
import { mockExercises } from "@/lib/mock-data";

const categoryLabels: Record<string, string> = {
  WEIGHTLIFTING: "Levantamento",
  GYMNASTICS: "Ginástica",
  MONOSTRUCTURAL: "Monoestrutural",
  ACCESSORY: "Acessório",
};

export function EvolutionScreen() {
  const [search, setSearch] = useState("");

  const filtered = mockExercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Evolução</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar exercício..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
        />
      </div>

      {/* PR Cards */}
      <div className="space-y-2.5">
        {filtered.map((exercise) => (
          <button
            key={exercise._id}
            className="glass-card p-4 w-full flex items-center gap-4 text-left hover:bg-secondary/50 transition-colors"
          >
            <div className="h-11 w-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{exercise.name}</p>
              <p className="text-xs text-muted-foreground">
                {categoryLabels[exercise.category] || exercise.category}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-sm text-primary">{exercise.currentPR}</p>
              <div className="flex items-center gap-0.5 justify-end">
                <TrendingUp className="h-3 w-3 text-xp" />
                <span className="text-[10px] text-xp font-medium">PR</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* FAB */}
      <button className="fixed bottom-20 right-4 h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg glow-primary hover:scale-105 transition-transform z-40">
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
