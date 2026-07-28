/**
 * ArchImage — an image masked into the Mehrab (Mughal arch) silhouette, with an
 * optional gold-hairline outline. The brand's structural signature for category
 * cards and the "featured" spotlight. Transparent corners → composes over any
 * background. Uses react-native-svg (no extra deps); for a handful of framed
 * images the SVG image path is perfectly performant.
 */
import { useId } from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, { ClipPath, Defs, Image as SvgImage, Path } from 'react-native-svg';

import { goldScale, palette } from '@/theme';

import { archPath } from './arch-path';

export function ArchImage({
  uri,
  width,
  height,
  outline = true,
  style,
}: {
  uri?: string | null;
  width: number;
  height: number;
  outline?: boolean;
  style?: ViewStyle;
}) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, ''); // valid SVG/url() id
  const clip = `arch-${rawId}`;
  // Guard: never emit a negative-sized SVG (happens on web prerender before the
  // window is measured). Reserve the space; paint once we have real dimensions.
  if (!(width > 0) || !(height > 0)) return <View style={[{ width: Math.max(0, width), height: Math.max(0, height) }, style]} />;
  const d = archPath(width, height);

  return (
    <View style={[{ width, height }, style]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <ClipPath id={clip}>
            <Path d={d} />
          </ClipPath>
        </Defs>
        {/* Sand fill shows through as a graceful placeholder before/without an image. */}
        <Path d={d} fill={palette.sand} />
        {uri ? (
          <SvgImage
            href={{ uri }}
            x={0}
            y={0}
            width={width}
            height={height}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clip})`}
          />
        ) : null}
        {outline ? <Path d={d} fill="none" stroke={goldScale.hairline} strokeWidth={1.25} /> : null}
      </Svg>
    </View>
  );
}

/** ArchOutline — just the gold arch stroke, as a decorative framing overlay. */
export function ArchOutline({
  width,
  height,
  color = goldScale.hairline,
  strokeWidth = 1.25,
  style,
}: {
  width: number;
  height: number;
  color?: string;
  strokeWidth?: number;
  style?: ViewStyle;
}) {
  if (!(width > 0) || !(height > 0)) return null;
  const d = archPath(width, height);
  return (
    <View pointerEvents="none" style={[{ width, height }, style]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} />
      </Svg>
    </View>
  );
}
