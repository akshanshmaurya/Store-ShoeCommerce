// tokens/motion.ts
export const motion = {
  // Easing curves
  easing: {
    default: [0.4, 0, 0.2, 1],      // ease-out — standard
    entrance: [0, 0, 0.2, 1],       // decelerate — elements entering
    exit: [0.4, 0, 1, 1],           // accelerate — elements leaving
    bounce: [0.34, 1.56, 0.64, 1],  // subtle overshoot
    smooth: [0.65, 0, 0.35, 1],     // luxury feel
  },

  // Durations (seconds)
  duration: {
    instant: 0.1,
    fast: 0.15,
    normal: 0.25,
    slow: 0.4,
    slower: 0.6,
    dramatic: 0.8,
  },

  // Preset animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },

  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },

  fadeInScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },

  slideInRight: {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },

  stagger: {
    container: { staggerChildren: 0.08 },
    item: {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
  },

  // Hover micro-interactions
  hover: {
    lift: { y: -4, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
    scale: { scale: 1.02, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
    glow: { boxShadow: '0 0 24px rgba(201, 169, 110, 0.15)', transition: { duration: 0.3 } },
  },

  // Page transitions
  page: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
} as const;
