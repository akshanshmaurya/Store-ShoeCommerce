import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { AlertCircle } from "lucide-react";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We encountered an issue loading this content. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center rounded-xl border border-error/30 bg-error/5 max-w-lg mx-auto my-8",
        className
      )}
    >
      <div className="h-16 w-16 rounded-full bg-error/15 flex items-center justify-center mb-4 text-error">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="text-heading-3 font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-body-sm text-foreground-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {onRetry && (
        <Button variant="outline" size="md" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
