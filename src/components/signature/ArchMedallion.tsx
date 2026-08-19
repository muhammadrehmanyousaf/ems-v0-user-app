/**
 * ArchMedallion — a category tile: photography masked into the Mehrab (Mughal
 * arch), gold hairline, label beneath, gold glow when active.
 *
 * This is the app's signature element. Every competitor in this category ships a
 * circle or a rounded square; an arch is specifically South Asian and cannot be
 * lifted onto a food-delivery app. It uses the existing `ArchImage`, which is why
 * this file is thin — the geometry already lived in `arch-path.ts` and had simply
 * never been put on a screen.
 *
 * Width comes from the parent (a row of these flexes), so the caller measures
 * once and passes it down: `ArchImage` needs concrete pixel dimensions to build
 * the SVG path, and a percentage width would render a zero-size arch.
 */
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { img, IMG } from '@/lib/img';
import { goldScale, haptics, usePressScale, useTheme } from '@/theme';

import { ArchImage } from './ArchImage';

/** The Mehrab's aspect ratio — taller than wide, matching the arch silhouette. */
export const MEDALLION_ASPECT = 0.79;

export interface ArchMedallionProps {
  label: string;
  imageUrl?: string | null;
  /** Concrete pixel width. The arch path is built from real dimensions. */
  width: number;
  active?: boolean;
  onPress?: () => void;
  urdu?: boolean;
}

export function ArchMedallion({
  label,
  imageUrl,
  width,
  active,
  onPress,
  urdu,
}: ArchMedallionProps) {
  const t = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.95);
  const height = Math.round(width / MEDALLION_ASPECT);

  return (
    <Pressable
      onPress={() => {
        if (!onPress) return;
        haptics.selection();
        onPress();
      }}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={{ width, alignItems: 'center', gap: t.spacing.md }}
    >
      <Animated.View
        style={[
          animatedStyle,
          // The glow is the whole active affordance — no border, no fill, so the
          // arch silhouette stays clean and the photography is never tinted.
          active ? t.elevation.glow : null,
        ]}
      >
        <ArchImage
          uri={img(imageUrl, { ...IMG.medallion, width, height })}
          width={width}
          height={height}
          outline
        />
      </Animated.View>
      {/* `title` (16), not an 11px caption. The label was smaller than every
          other piece of type on Home and "Décor" still clipped — a category the
          customer cannot read is a category they cannot choose. */}
      <Text
        variant="title"
        tone={active ? 'gold' : 'primary'}
        urdu={urdu}
        numberOfLines={1}
        align="center"
      >
        {label}
      </Text>
      {/* Reserve the underline's height always so the row never shifts by 2px
          when the active item changes. */}
      <View
        style={{
          height: 2,
          width: active ? 18 : 0,
          borderRadius: 1,
          backgroundColor: active ? goldScale.bright : 'transparent',
        }}
      />
    </Pressable>
  );
}
