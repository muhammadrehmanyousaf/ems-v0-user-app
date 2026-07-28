/**
 * ShimmerText — champagne-gold gradient text for romantic phrases. Ports web
 * `.text-bridal-shimmer` (gold → light-gold → gold). Static premium gradient;
 * an animated sweep can be layered in a later polish pass.
 */
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

import { fontFamily } from '../fonts';

export interface ShimmerTextProps {
  children: string;
  fontSize?: number;
  height?: number;
  family?: string;
  italic?: boolean;
}

export function ShimmerText({
  children,
  fontSize = 32,
  height,
  family = fontFamily.displayItalicSemi,
}: ShimmerTextProps) {
  const h = height ?? Math.round(fontSize * 1.3);
  return (
    <Svg width="100%" height={h}>
      <Defs>
        <LinearGradient id="shimmer" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#C9956A" />
          <Stop offset="0.45" stopColor="#E8C99A" />
          <Stop offset="0.9" stopColor="#C9956A" />
        </LinearGradient>
      </Defs>
      <SvgText
        fill="url(#shimmer)"
        fontSize={fontSize}
        fontFamily={family}
        x="50%"
        y={fontSize}
        textAnchor="middle"
      >
        {children}
      </SvgText>
    </Svg>
  );
}
