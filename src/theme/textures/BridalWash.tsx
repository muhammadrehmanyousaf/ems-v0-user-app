/**
 * BridalWash — the warm hero/auth background. Ports the web `.bg-bridal-wash`:
 * rose glow (top-left) + gold glow (bottom-right) over an ivory→blush vertical.
 */
import { StyleSheet, View, type ViewProps } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

export function BridalWash({ style, children, ...rest }: ViewProps) {
  return (
    <View style={[styles.fill, style]} {...rest}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id="base" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FDF8F2" />
            <Stop offset="1" stopColor="#FFF0F3" />
          </LinearGradient>
          <RadialGradient id="rose" cx="0" cy="0" r="0.75">
            <Stop offset="0" stopColor="#F2B5C0" stopOpacity="0.35" />
            <Stop offset="0.55" stopColor="#F2B5C0" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="gold" cx="1" cy="1" r="0.75">
            <Stop offset="0" stopColor="#C9956A" stopOpacity="0.18" />
            <Stop offset="0.55" stopColor="#C9956A" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#base)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#rose)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#gold)" />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ fill: { overflow: 'hidden' } });
