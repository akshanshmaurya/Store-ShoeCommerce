import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={twMerge(
            clsx(
              'flex h-11 w-full rounded-xl border border-border bg-surface px-4 py-2 text-body-sm text-foreground transition-colors placeholder:text-foreground-subtle focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-error focus:border-error focus:ring-error',
              className
            )
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1.5 text-caption text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
