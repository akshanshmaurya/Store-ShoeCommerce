// tokens/a11y.ts
export const a11y = {
  // Focus rings
  focusRing: 'outline-none ring-2 ring-offset-2 ring-offset-background ring-primary',

  // Minimum contrast ratios (WCAG 2.1 AA)
  contrast: {
    normal: 4.5,
    large: 3.0,
  },

  // Touch targets
  minTouchTarget: '44px',

  // Reduced motion
  reducedMotion: '@media (prefers-reduced-motion: reduce)',

  // Screen reader only
  srOnly: 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
} as const;
