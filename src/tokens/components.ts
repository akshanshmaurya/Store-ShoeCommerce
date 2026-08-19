// tokens/components.ts — Button variants
export const button = {
  variants: {
    primary: {
      base: 'bg-primary text-background font-semibold uppercase tracking-wider',
      hover: 'hover:bg-primary-hover hover:shadow-glow',
      active: 'active:bg-primary-active active:scale-[0.98]',
      disabled: 'opacity-40 cursor-not-allowed',
    },
    secondary: {
      base: 'bg-surface text-foreground font-semibold uppercase tracking-wider border border-border',
      hover: 'hover:bg-surface-hover hover:border-border-focus',
      active: 'active:bg-surface-active active:scale-[0.98]',
      disabled: 'opacity-40 cursor-not-allowed',
    },
    outline: {
      base: 'bg-transparent text-foreground font-semibold uppercase tracking-wider border border-border',
      hover: 'hover:bg-surface hover:border-foreground-muted',
      active: 'active:bg-surface-muted active:scale-[0.98]',
      disabled: 'opacity-40 cursor-not-allowed',
    },
    ghost: {
      base: 'bg-transparent text-foreground-muted font-medium',
      hover: 'hover:text-foreground hover:bg-surface',
      active: 'active:bg-surface-muted',
      disabled: 'opacity-40 cursor-not-allowed',
    },
    link: {
      base: 'bg-transparent text-primary font-medium underline-offset-4',
      hover: 'hover:underline hover:text-primary-hover',
      active: 'active:text-primary-active',
      disabled: 'opacity-40 cursor-not-allowed',
    },
  },

  sizes: {
    xs: 'h-8 px-3 text-overline',
    sm: 'h-9 px-4 text-caption',
    md: 'h-11 px-6 text-body-sm',
    lg: 'h-14 px-8 text-body',
    icon: 'h-10 w-10 p-0',
  },

  radius: {
    default: 'rounded-md',
    full: 'rounded-full',
    none: 'rounded-none',
  },
} as const;

export const input = {
  base: `
    w-full bg-surface border border-border rounded-md
    text-foreground placeholder:text-foreground-subtle
    focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-border-focus
    disabled:opacity-40 disabled:cursor-not-allowed
    transition-colors duration-fast
  `,
  sizes: {
    sm: 'h-9 px-3 text-body-sm',
    md: 'h-11 px-4 text-body',
    lg: 'h-14 px-5 text-body-lg',
  },
  states: {
    error: 'border-error focus:border-error focus:ring-error',
    success: 'border-success focus:border-success focus:ring-success',
  },
} as const;

export const badge = {
  variants: {
    default: 'bg-surface-muted text-foreground-muted',
    primary: 'bg-primary-muted text-primary',
    success: 'bg-success-muted text-success',
    warning: 'bg-warning-muted text-warning',
    error: 'bg-error-muted text-error',
    outline: 'bg-transparent border border-border text-foreground-muted',
  },
  sizes: {
    sm: 'px-2 py-0.5 text-overline',
    md: 'px-2.5 py-1 text-caption',
    lg: 'px-3 py-1.5 text-body-sm',
  },
} as const;
