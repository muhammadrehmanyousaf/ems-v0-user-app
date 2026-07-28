/** Assembled theme object. Light-only for v1 (the web is light). */
import { colors, palette, spacing, radius, elevation, moneyTone } from './tokens';
import { typography, fontFamily } from './fonts';
import { motion } from './motion';

export const theme = {
  colors,
  palette,
  spacing,
  radius,
  elevation,
  typography,
  fontFamily,
  motion,
  moneyTone,
} as const;

export type Theme = typeof theme;
