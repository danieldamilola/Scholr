"use client";

import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

/**
 * A reusable tab navigation bar with an optional count badge per tab.
 *
 * Example:
 *   <Tabs
 *     tabs={[
 *       { id: "all", label: "All", count: 42 },
 *       { id: "pending", label: "Pending", count: 3 },
 *     ]}
 *     activeTab={activeTab}
 *     onTabChange={setActiveTab}
 *   />
 */
export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div className={cn("border-b border-border", className)}>
      <div className="flex gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative pb-3 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "text-brand"
                : "text-ink-muted hover:text-ink",
            )}
          >
            <span>
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1.5 text-xs text-ink-muted">
                  ({tab.count})
                </span>
              )}
            </span>
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-brand rounded-t" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export type { Tab };
