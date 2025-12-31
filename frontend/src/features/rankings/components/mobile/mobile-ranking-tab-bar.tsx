"use client";

import { memo } from "react";
import { useTranslation } from "react-i18next";
import { LayoutGrid, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type MobileRankingTab = "ranking" | "picker";

interface MobileRankingTabBarProps {
  activeTab: MobileRankingTab;
  onTabChange: (tab: MobileRankingTab) => void;
  hasUnsavedChanges?: boolean;
}

export const MOBILE_TAB_BAR_HEIGHT = 56;

export const MobileRankingTabBar = memo(function MobileRankingTabBar({
  activeTab,
  onTabChange,
  hasUnsavedChanges,
}: MobileRankingTabBarProps) {
  const { t } = useTranslation();

  const tabs = [
    {
      id: "ranking" as const,
      label: t("rankingView.yourRanking", "Your Ranking"),
      icon: LayoutGrid,
    },
    {
      id: "picker" as const,
      label: t("rankingView.pokemonBox", "Pokemon Box"),
      icon: Grid3X3,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{tab.label}</span>
              {tab.id === "ranking" && hasUnsavedChanges && (
                <span className="absolute top-2 right-[calc(50%-20px)] h-2 w-2 rounded-full bg-amber-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});
