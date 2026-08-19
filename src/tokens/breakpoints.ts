// tokens/breakpoints.ts
export const breakpoints = {
  // Mobile-first approach
  sm: '640px',    // Large phones
  md: '768px',    // Tablets
  lg: '1024px',   // Small desktops / tablets landscape
  xl: '1280px',   // Desktops
  '2xl': '1536px', // Large desktops
} as const;

// Media query helpers
export const mediaQueries = {
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`,
} as const;
