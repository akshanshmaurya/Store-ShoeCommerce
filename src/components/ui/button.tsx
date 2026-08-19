import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "xs" | "sm" | "md" | "lg" | "icon";
  radius?: "default" | "full" | "none";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      radius = "default",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base = "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-primary select-none";

    const variants = {
      primary: "bg-primary text-background uppercase tracking-wider hover:bg-primary-hover hover:shadow-glow active:bg-primary-active active:scale-[0.98]",
      secondary: "bg-surface text-foreground uppercase tracking-wider border border-border hover:bg-surface-hover hover:border-border-focus active:bg-surface-active active:scale-[0.98]",
      outline: "bg-transparent text-foreground uppercase tracking-wider border border-border hover:bg-surface hover:border-foreground-muted active:bg-surface-muted active:scale-[0.98]",
      ghost: "bg-transparent text-foreground-muted font-medium hover:text-foreground hover:bg-surface active:bg-surface-muted",
      link: "bg-transparent text-primary font-medium underline-offset-4 hover:underline hover:text-primary-hover active:text-primary-active p-0 h-auto",
    };

    const sizes = {
      xs: "h-8 px-3 text-overline",
      sm: "h-9 px-4 text-caption",
      md: "h-11 px-6 text-body-sm",
      lg: "h-14 px-8 text-body",
      icon: "h-10 w-10 p-0",
    };

    const radii = {
      default: "rounded-md",
      full: "rounded-full",
      none: "rounded-none",
    };

    const disabledStyles = disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "";

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          base,
          variants[variant],
          size !== "icon" || variant !== "link" ? sizes[size] : "",
          radii[radius],
          disabledStyles,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
