// tokens/images.ts
export const image = {
  // Aspect ratios for product imagery
  aspectRatio: {
    product: '3/4',        // Portrait — standard shoe shot
    productWide: '4/3',    // Landscape — lifestyle
    hero: '16/9',          // Cinematic
    square: '1/1',         // Category thumbnails
    banner: '21/9',        // Ultra-wide editorial
  },

  // Object fit strategies
  fit: {
    product: 'cover',
    hero: 'cover',
    category: 'cover',
    avatar: 'cover',
  },

  // Loading strategies
  loading: {
    hero: 'eager',
    aboveFold: 'eager',
    belowFold: 'lazy',
    productGrid: 'lazy',
  },

  // Placeholder / skeleton
  placeholder: {
    color: '#1A1A1A',
    shimmer: 'linear-gradient(90deg, #1A1A1A 0%, #262626 50%, #1A1A1A 100%)',
  },
} as const;
