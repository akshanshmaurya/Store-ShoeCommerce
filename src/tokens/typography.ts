  // tokens/typography.ts
export const typography = {
  // Font Families
  fontFamily: {
    display: '"Inter", "Helvetica Neue", system-ui, sans-serif',
    heading: '"Inter", "Helvetica Neue", system-ui, sans-serif',
    body: '"Inter", "Helvetica Neue", system-ui, sans-serif',
    mono: '"JetBrains Mono", "SF Mono", monospace',
  },

  // Type Scale (rem-based, 1rem = 16px)
  fontSize: {
    'display-xl': '4.5rem',    // 72px — Hero headlines
    'display-lg': '3.5rem',    // 56px — Section headlines
    'display-md': '2.5rem',    // 40px — Sub-section headlines
    'heading-1': '2rem',       // 32px
    'heading-2': '1.5rem',     // 24px
    'heading-3': '1.25rem',    // 20px
    'body-lg': '1.125rem',     // 18px
    'body': '1rem',            // 16px — Base
    'body-sm': '0.875rem',     // 14px
    'caption': '0.75rem',      // 12px
    'overline': '0.6875rem',   // 11px — All caps labels
  },

  // Font Weights
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line Heights
  lineHeight: {
    tight: 1.1,      // Display headlines
    snug: 1.25,      // Headings
    normal: 1.5,     // Body
    relaxed: 1.625,  // Large body
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.04em',   // Display text
    tight: '-0.02em',     // Headings
    normal: '0em',        // Body
    wide: '0.02em',       // Captions
    wider: '0.05em',      // Overline / labels
    widest: '0.1em',      // Badges, tags
  },
} as const;
