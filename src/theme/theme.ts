/** Assembled theme object. Light-only for v1 (the web is light). */
import { typography, fontFamily } from './fonts';
import { motion } from './motion';
import {
  colors,
  palette,
  spacing,
  radius,
  elevation,
  goldScale,
  overlay,
  layout,
  moneyTone,
} from './tokens';

export const theme = {
  colors,
  palette,
  spacing,
  radius,
  elevation,
  goldScale,
  /** Named translucent surfaces. A literal `rgba()` in a screen is a defect. */
  overlay,
  /** Gutter, max content width, minimum tap target. */
  layout,
  typography,
  fontFamily,
  motion,
  moneyTone,
} as const;

export type Theme = typeof theme;
