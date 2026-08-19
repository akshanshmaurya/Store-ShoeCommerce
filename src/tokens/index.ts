// tokens/index.ts
export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { layout } from './layout';
export { breakpoints, mediaQueries } from './breakpoints';
export { button, input, badge } from './components';
export { motion } from './motion';
export { image } from './images';
export { a11y } from './a11y';

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { layout } from './layout';
import { breakpoints } from './breakpoints';
import { button, input, badge } from './components';
import { motion } from './motion';
import { image } from './images';
import { a11y } from './a11y';

// Unified theme object
export const theme = {
  colors,
  typography,
  spacing,
  layout,
  breakpoints,
  button,
  input,
  badge,
  motion,
  image,
  a11y,
} as const;
