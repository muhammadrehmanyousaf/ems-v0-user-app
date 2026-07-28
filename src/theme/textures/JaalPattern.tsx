/**
 * JaalPattern — Mughal jaal lattice overlay. Ports the web `.bg-mughal-jaal`:
 * gold stroke @ 6% opacity, 80px tile, repeating. Lay over ivory surfaces.
 */
import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, G, Path, Pattern, Rect } from 'react-native-svg';

export function JaalPattern({ opacity = 0.06, color = '#C9956A' }: { opacity?: number; color?: string }) {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
      <Defs>
        <Pattern id="jaal" width={80} height={80} patternUnits="userSpaceOnUse">
          <G fill="none" stroke={color} strokeWidth={1} opacity={opacity}>
            <Path d="M40 0 C 50 20, 60 30, 80 40 C 60 50, 50 60, 40 80 C 30 60, 20 50, 0 40 C 20 30, 30 20, 40 0 Z" />
            <Circle cx={40} cy={40} r={6} />
            <Path d="M0 40 H 80 M 40 0 V 80" strokeDasharray="2 6" />
          </G>
        </Pattern>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#jaal)" />
    </Svg>
  );
}
