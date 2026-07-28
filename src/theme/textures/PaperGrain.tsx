/**
 * PaperGrain — 3% warm noise overlay for ivory surfaces. Ports web `.bg-bridal-grain`.
 * Uses an SVG turbulence filter; degrades to nothing if unsupported (grain is subtle).
 */
import { StyleSheet } from 'react-native';
import Svg, { Defs, Filter, FeColorMatrix, FeTurbulence, Rect } from 'react-native-svg';

export function PaperGrain({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none" opacity={opacity}>
      <Defs>
        <Filter id="grain" x="0" y="0" width="100%" height="100%">
          <FeTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} stitchTiles="stitch" />
          <FeColorMatrix
            values="0 0 0 0 0.17 0 0 0 0 0.09 0 0 0 0 0.06 0 0 0 0.55 0"
          />
        </Filter>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" filter="url(#grain)" />
    </Svg>
  );
}
