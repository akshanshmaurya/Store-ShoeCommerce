import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "success" | "warning" | "error" | "outline";
  size?: "sm" | "md" | "lg";
}

export function Badge({ className, variant = "default", size = "md", ...props }: BadgeProps) {
  const variants = {
    default: "bg-surface-muted text-foreground-muted border border-border",
    primary: "bg-primary/15 text-primary border border-primary/30",
    success: "bg-success/15 text-success border border-success/30",
    warning: "bg-warning/15 text-warning border border-warning/30",
    error: "bg-error/15 text-error border border-error/30",
    outline: "bg-transparent border border-border text-foreground-muted",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-overline",
    md: "px-2.5 py-1 text-caption",
    lg: "px-3 py-1.5 text-body-sm",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded font-semibold tracking-wider uppercase transition-colors select-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
