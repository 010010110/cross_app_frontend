import { useState } from "react";
import { CalendarDays, Newspaper, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { FeedScreen } from "@/components/screens/FeedScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";

type CoachTab = "classes" | "feed" | "profile";

const tabs: Array<{ id: CoachTab; label: string; icon: typeof CalendarDays }> = [
  { id: "classes", label: "Turmas", icon: CalendarDays },
  { id: "feed", label: "Feed", icon: Newspaper },
  { id: "profile", label: "Perfil", icon: UserRound },
];

export default function Coach() {
  const [activeTab, setActiveTab] = useState<CoachTab>("classes");

  const renderScreen = () => {
    switch (activeTab) {
      case "classes":
        return <HomeScreen onOpenProfile={() => setActiveTab("profile")} />;
      case "feed":
        return <FeedScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <HomeScreen onOpenProfile={() => setActiveTab("profile")} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderScreen()}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur safe-area-bottom">
        <div className="max-w-lg mx-auto grid grid-cols-3 px-3 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
