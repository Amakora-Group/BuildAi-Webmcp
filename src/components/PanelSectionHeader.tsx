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
        "flex shrink-0 items-center justify-between border-b border-border px-5 py-4",
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
