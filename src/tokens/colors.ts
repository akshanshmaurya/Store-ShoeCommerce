// tokens/colors.ts
export const colors = {
  // Backgrounds
  background: {
    DEFAULT: '#0A0A0A',      // Deep charcoal — primary page bg
    elevated: '#141414',      // Cards, modals, drawers
    subtle: '#1A1A1A',        // Hover states, secondary surfaces
  },

  // Foregrounds
  foreground: {
    DEFAULT: '#FAFAFA',       // Primary text — near-white
    muted: '#A3A3A3',         // Secondary text, captions
    subtle: '#737373',        // Tertiary, placeholders, disabled
  },

  // Surfaces
  surface: {
    DEFAULT: '#141414',
    muted: '#1F1F1F',
    hover: '#262626',
    active: '#333333',
  },

  // Brand / Accent
  primary: {
    DEFAULT: '#C9A96E',       // Warm gold — premium accent
    hover: '#D4B87A',
    active: '#B8985E',
    muted: '#C9A96E33',       // 20% opacity for backgrounds
  },

  // Semantic
  success: {
    DEFAULT: '#22C55E',
    muted: '#22C55E1A',
  },
  warning: {
    DEFAULT: '#F59E0B',
    muted: '#F59E0B1A',
  },
  error: {
    DEFAULT: '#EF4444',
    muted: '#EF44441A',
  },

  // Borders
  border: {
    DEFAULT: '#262626',
    subtle: '#1A1A1A',
    focus: '#C9A96E',
  },

  // Overlays
  overlay: {
    light: 'rgba(255, 255, 255, 0.04)',
    medium: 'rgba(0, 0, 0, 0.6)',
    heavy: 'rgba(0, 0, 0, 0.85)',
  },
} as const;
