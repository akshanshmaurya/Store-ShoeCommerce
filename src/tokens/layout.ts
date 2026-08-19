// tokens/layout.ts
export const layout = {
  // Container
  container: {
    maxWidth: '90rem',     // 1440px
    narrow: '60rem',       // 960px
    padding: {
      mobile: '1rem',
      tablet: '1.5rem',
      desktop: '2.5rem',
      wide: '4rem',
    },
  },

  // Grid System
  grid: {
    columns: 12,
    gap: {
      mobile: '0.75rem',   // 12px
      tablet: '1rem',      // 16px
      desktop: '1.5rem',   // 24px
    },
  },

  // Z-Index Scale
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    drawer: 300,
    modal: 400,
    toast: 500,
    tooltip: 600,
    overlay: 700,
  },

  // Border Radius
  radius: {
    none: '0',
    sm: '0.25rem',         // 4px
    md: '0.5rem',          // 8px
    lg: '0.75rem',         // 12px
    xl: '1rem',            // 16px
    '2xl': '1.5rem',       // 24px
    full: '9999px',
  },

  // Shadows (subtle, premium feel)
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 12px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.6)',
    glow: '0 0 24px rgba(201, 169, 110, 0.15)',
  },

  // Transitions
  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
    slower: '600ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;
