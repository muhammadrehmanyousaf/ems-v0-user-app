/**
 * Text — the single typography primitive. Every string in the app renders
 * through this so the Bridal type scale + ink tokens stay consistent.
 */
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { useTheme, type TypographyVariant } from '@/theme';

export type TextTone =
  | 'primary' // warm charcoal heading/body ink
  | 'body'
  | 'muted'
  | 'label' // gold-brown
  | 'onDark'
  | 'onGold'
  | 'gold'
  | 'success'
  | 'danger'
  | 'inherit';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  tone?: TextTone;
  align?: TextStyle['textAlign'];
  italic?: boolean;
  /** Render with the Nastaliq Urdu family (RTL-friendly). */
  urdu?: boolean;
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
}

export function Text({
  variant = 'body',
  tone = 'primary',
  align,
  italic,
  urdu,
  weight,
  style,
  ...rest
}: TextProps) {
  const t = useTheme();
  const scale = t.typography[variant];

  const toneColor: Record<TextTone, string | undefined> = {
    primary: t.colors.textPrimary,
    body: t.colors.textBody,
    muted: t.colors.textMuted,
    label: t.colors.textLabel,
    onDark: t.colors.textOnDark,
    onGold: t.colors.onPrimary,
    gold: t.colors.goldDark,
    success: t.colors.success,
    danger: t.colors.danger,
    inherit: undefined,
  };

  // Explicit weight override maps onto the family for the current variant.
  const weightFamily = weight
    ? {
        light: t.fontFamily.bodyLight,
        regular: t.fontFamily.body,
        medium: t.fontFamily.bodyMedium,
        semibold: t.fontFamily.uiSemibold,
        bold: t.fontFamily.bodyBold,
      }[weight]
    : undefined;

  const family = urdu
    ? t.fontFamily.urdu
    : italic
      ? t.fontFamily.displayItalic
      : (weightFamily ?? scale.fontFamily);

  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: family,
          fontSize: scale.fontSize,
          lineHeight: urdu ? scale.lineHeight * 1.7 : scale.lineHeight,
          letterSpacing: scale.letterSpacing,
          color: toneColor[tone],
          textAlign: align,
          writingDirection: urdu ? 'rtl' : undefined,
        },
        style,
      ]}
    />
  );
}
