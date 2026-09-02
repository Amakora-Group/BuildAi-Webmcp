import { Activity, Bot, ClipboardCheck } from "lucide-react";

import { cn } from "@/lib/utils";

export type MobileDashboardTab = "agents" | "activity" | "approvals";

type DashboardMobileNavProps = {
  activeTab: MobileDashboardTab;
  onTabChange: (tab: MobileDashboardTab) => void;
  pendingCount: number;
  hasActiveRun: boolean;
};

const TABS: {
  id: MobileDashboardTab;
  label: string;
  icon: typeof Bot;
}[] = [
  { id: "agents", label: "Agents", icon: Bot },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "approvals", label: "Approvals", icon: ClipboardCheck },
];

export function DashboardMobileNav({
  activeTab,
  onTabChange,
  pendingCount,
  hasActiveRun,
}: DashboardMobileNavProps) {
  return (
    <nav
      className="shrink-0 border-t border-border bg-panel/95 backdrop-blur-md pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden"
      aria-label="Dashboard sections"
    >
      <div className="grid grid-cols-3">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          const badgeCount =
            id === "approvals" && pendingCount > 0 ? pendingCount : null;
          const showLiveDot = id === "activity" && hasActiveRun;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-14 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground active:text-foreground",
              )}
            >
              <span
                className={cn(
                  "absolute inset-x-4 top-0 h-0.5 rounded-full bg-foreground transition-opacity",
                  active ? "opacity-100" : "opacity-0",
                )}
                aria-hidden
              />
              <span className="relative">
                <Icon className="size-5" aria-hidden />
                {badgeCount !== null ? (
                  <span className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                ) : null}
                {showLiveDot && badgeCount === null ? (
                  <span
                    className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-foreground ring-2 ring-panel"
                    aria-hidden
                  />
                ) : null}
              </span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
