"use client";

import { Sparkles, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

export type SidebarTab = "ai" | "quiz";

export function SidebarTabBar({
  tab,
  setTab,
}: {
  tab: SidebarTab;
  setTab: (t: SidebarTab) => void;
}) {
  return (
    <div className="flex border-b border-border shrink-0">
      {[
        { id: "ai" as const, label: "AI Assistant", icon: Sparkles },
        { id: "quiz" as const, label: "Quiz", icon: BrainCircuit },
      ].map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setTab(id)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 h-12 text-[14px] font-medium transition-colors border-b-2",
            tab === id
              ? "border-brand text-brand"
              : "border-transparent text-ink-muted hover:text-ink",
          )}
        >
          <Icon className="size-4" /> {label}
        </button>
      ))}
    </div>
  );
}
