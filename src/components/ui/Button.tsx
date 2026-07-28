/** Button — bridal primary / secondary / ghost, with press feedback + haptics. */
import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { haptics, usePressScale, useTheme } from '@/theme';

import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  fullWidth?: boolean;
}

const HEIGHTS: Record<Size, number> = { sm: 38, md: 48, lg: 54 };

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  fullWidth,
  disabled,
  onPress,
  ...rest
}: ButtonProps) {
  const t = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.97);

  const isDisabled = disabled || loading;
  const height = HEIGHTS[size];

  const bg =
    variant === 'primary'
      ? t.colors.primary
      : variant === 'danger'
        ? t.colors.danger
        : 'transparent';
  const borderColor = variant === 'secondary' ? t.colors.primary : 'transparent';
  const fg =
    variant === 'primary' || variant === 'danger'
      ? t.colors.onPrimary
      : variant === 'secondary'
        ? t.colors.goldDark
        : t.colors.textBody;
  const contentColor = variant === 'primary' ? t.colors.onPrimary : variant === 'danger' ? t.colors.onPrimary : fg;

  return (
    <Animated.View style={[animatedStyle, fullWidth && styles.full]}>
      <Pressable
        {...rest}
        disabled={isDisabled}
        onPress={(e) => {
          haptics.light();
          onPress?.(e);
        }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.base,
          {
            height,
            paddingHorizontal: size === 'sm' ? t.spacing.md : t.spacing.xl,
            backgroundColor: bg,
            borderColor,
            borderWidth: variant === 'secondary' ? 1 : 0,
            borderRadius: t.radius.sm,
            opacity: isDisabled ? 0.5 : 1,
          },
          variant === 'primary' && t.elevation.sm,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={contentColor} size="small" />
        ) : (
          <View style={styles.row}>
            {icon ? <Ionicons name={icon} size={size === 'sm' ? 16 : 18} color={contentColor} /> : null}
            <Text variant="button" tone="inherit" style={{ color: contentColor }}>
              {label}
            </Text>
            {iconRight ? <Ionicons name={iconRight} size={size === 'sm' ? 16 : 18} color={contentColor} /> : null}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  full: { alignSelf: 'stretch' },
});
