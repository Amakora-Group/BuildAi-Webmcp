import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PanelSectionHeaderProps = {
  title: string;
  action?: ReactNode;
  variant?: "label" | "heading";
  className?: string;
};

export function PanelSectionHeader({
  title,
  action,
  variant = "label",
  className,
}: PanelSectionHeaderProps) {
  return (
    <header
      className={cn(
        "panel-header flex shrink-0 items-center justify-between gap-3 px-4 py-3.5 sm:gap-4 sm:px-5 sm:py-4",
        className,
      )}
    >
      <h2 className={variant === "label" ? "type-section" : "type-heading"}>
        {title}
      </h2>
      {action}
    </header>
  );
}
