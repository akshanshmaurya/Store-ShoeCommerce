import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { PackageOpen } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  icon = <PackageOpen className="h-10 w-10 text-foreground-subtle" />,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center rounded-xl border border-border bg-surface/50 max-w-lg mx-auto my-8",
        className
      )}
    >
      <div className="h-16 w-16 rounded-full bg-surface-muted flex items-center justify-center mb-4 text-foreground-muted">
        {icon}
      </div>
      <h3 className="text-heading-3 font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-body-sm text-foreground-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && (
        actionHref ? (
          <a href={actionHref}>
            <Button variant="primary" size="md">
              {actionLabel}
            </Button>
          </a>
        ) : (
          <Button variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
}
