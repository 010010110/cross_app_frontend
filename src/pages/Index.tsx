import { useEffect, useState } from "react";
import { TabBar } from "@/components/TabBar";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { FeedScreen } from "@/components/screens/FeedScreen";
import { EvolutionScreen } from "@/components/screens/EvolutionScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { NearbyBoxesScreen } from "@/components/screens/NearbyBoxesScreen";
import { useAuth } from "@/contexts/AuthContext";

type Tab = "home" | "feed" | "evolution" | "profile" | "boxes";
type NavigationTab = Exclude<Tab, "profile">;

const Index = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const hasAnyBox = (user?.boxIds.length ?? 0) > 0;

  useEffect(() => {
    if (!user) return;
    if (!hasAnyBox && activeTab !== "boxes") {
      setActiveTab("boxes");
    }
  }, [user, hasAnyBox, activeTab]);

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeScreen
            onOpenNearbyBoxes={() => setActiveTab("boxes")}
            onOpenProfile={() => setActiveTab("profile")}
          />
        );
      case "feed":
        return <FeedScreen />;
      case "evolution":
        return <EvolutionScreen />;
      case "profile":
        return <ProfileScreen />;
      case "boxes":
        return <NearbyBoxesScreen />;
      default:
        return (
          <HomeScreen
            onOpenNearbyBoxes={() => setActiveTab("boxes")}
            onOpenProfile={() => setActiveTab("profile")}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderScreen()}
      <TabBar
        active={activeTab === "profile" ? "home" : (activeTab as NavigationTab)}
        onChange={(tab) => setActiveTab(tab)}
      />
    </div>
  );
};

export default Index;
