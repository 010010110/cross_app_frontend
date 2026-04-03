import { Home, Newspaper, TrendingUp, MapPinned } from "lucide-react";

type Tab = "home" | "feed" | "evolution" | "boxes";

interface TabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs = [
  { id: "home" as Tab, label: "Treino", icon: Home },
  { id: "boxes" as Tab, label: "Boxes", icon: MapPinned },
  { id: "feed" as Tab, label: "Feed", icon: Newspaper },
  { id: "evolution" as Tab, label: "Evolução", icon: TrendingUp },
];

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
