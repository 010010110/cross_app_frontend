import { useState } from "react";
import { TabBar } from "@/components/TabBar";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { FeedScreen } from "@/components/screens/FeedScreen";
import { EvolutionScreen } from "@/components/screens/EvolutionScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";

type Tab = "home" | "feed" | "evolution" | "profile";

const screens: Record<Tab, React.FC> = {
  home: HomeScreen,
  feed: FeedScreen,
  evolution: EvolutionScreen,
  profile: ProfileScreen,
};

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const Screen = screens[activeTab];

  return (
    <div className="min-h-screen bg-background">
      <Screen />
      <TabBar active={activeTab} onChange={setActiveTab} />
    </div>
  );
};

export default Index;
