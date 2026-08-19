import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/tokens/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        background: {
          DEFAULT: '#0A0A0A',
          elevated: '#141414',
          subtle: '#1A1A1A',
        },
        foreground: {
          DEFAULT: '#FAFAFA',
          muted: '#A3A3A3',
          subtle: '#737373',
        },
        surface: {
          DEFAULT: '#141414',
          muted: '#1F1F1F',
          hover: '#262626',
          active: '#333333',
        },
        primary: {
          DEFAULT: '#C9A96E',
          hover: '#D4B87A',
          active: '#B8985E',
          muted: '#C9A96E33',
        },
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
        border: {
          DEFAULT: '#262626',
          subtle: '#1A1A1A',
          focus: '#C9A96E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.04em' }],
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'heading-1': ['2rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        'heading-2': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'heading-3': ['1.25rem', { lineHeight: '1.25', letterSpacing: '0em' }],
        'body-lg': ['1.125rem', { lineHeight: '1.625', letterSpacing: '0em' }],
        'body': ['1rem', { lineHeight: '1.5', letterSpacing: '0em' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0em' }],
        'caption': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        'overline': ['0.6875rem', { lineHeight: '1.5', letterSpacing: '0.05em' }],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        normal: '0em',
        wide: '0.02em',
        wider: '0.05em',
        widest: '0.1em',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
        md: '0 4px 12px rgba(0, 0, 0, 0.4)',
        lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
        xl: '0 16px 48px rgba(0, 0, 0, 0.6)',
        glow: '0 0 24px rgba(201, 169, 110, 0.15)',
      },
      aspectRatio: {
        'product': '3/4',
        'product-wide': '4/3',
        'hero': '16/9',
        'square': '1/1',
        'banner': '21/9',
      },
    },
  },
  plugins: [],
};

export default config;
