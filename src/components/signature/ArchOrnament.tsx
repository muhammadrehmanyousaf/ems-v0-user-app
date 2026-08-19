/**
 * ArchOrnament — the Mehrab as an ornamented niche: the arch silhouette filled
 * with Mughal jaal latticework, in gold, on the deep register.
 *
 * ── Why this and not a photograph ─────────────────────────────────────────
 *
 * The right of the hero panel read as empty, and the obvious fix is an image.
 * Three candidates, and all three fail on truth:
 *
 * • **A vendor photograph** would be a claim. The hero is brand space, so a
 *   marquee pictured there implies a relationship we are not asserting — and on
 *   this platform 86% of listings lead with shared stock anyway, so the picture
 *   would most likely not even be that vendor's.
 * • **Stock wedding photography** is the exact fiction rules.md §6 forbids, and
 *   the same fiction that put a Wedding Wala office render on a venue listing.
 * • **A brand asset** does not exist. `assets/images` holds icons, splash art
 *   and Expo logos — no photography.
 *
 * So the space is filled with something that IS ours and is not a claim about
 * anyone: the ornament itself. A mehrab in Mughal architecture is rarely a bare
 * outline — it is a niche carved with jaal, the pierced lattice screen. Drawing
 * the arch and leaving it hollow was the incomplete version; this is the
 * finished one.
 *
 * ── How it is built ───────────────────────────────────────────────────────
 *
 * One SVG. `archPath` supplies the silhouette, which becomes a `ClipPath`; a
 * `Pattern` tiles the jaal motif; a rect fills the clip with that pattern, and
 * the same path is stroked on top so the edge stays crisp. Vector throughout, so
 * it costs a few hundred bytes rather than a 2–4 MB photograph, and it is sharp
 * on every density — which matters more than usual here, because the audience is
 * mid-range Android on metered data.
 *
 * Opacity is deliberately low. This is a watermark the eye should find on the
 * second look, not an object competing with the countdown. Everything about the
 * Mehrab in this app follows that rule: present, never loud.
 */
import Svg, {
  ClipPath,
  Defs,
  G,
  Path,
  Pattern,
  Rect,
  Circle,
} from 'react-native-svg';

import { alpha, palette } from '@/theme';

import { archPath } from './arch-path';

export interface ArchOrnamentProps {
  width: number;
  height: number;
  /** Lattice colour. Defaults to the light gold that reads on the deep ground. */
  color?: string;
  /** Overall opacity. Low by default — a watermark, not an object. */
  opacity?: number;
}

export function ArchOrnament({
  width,
  height,
  color = palette.goldLight,
  opacity = 0.22,
}: ArchOrnamentProps) {
  const d = archPath(width, height);
  // 44, not the texture's 80: the arch is ~200px wide here, and an 80px tile
  // would show barely two repeats — the lattice needs to read as a lattice.
  const tile = 44;

  return (
    <Svg width={width} height={height} pointerEvents="none" opacity={opacity}>
      <Defs>
        <ClipPath id="archClip">
          <Path d={d} />
        </ClipPath>
        <Pattern id="jaal" width={tile} height={tile} patternUnits="userSpaceOnUse">
          <G fill="none" stroke={color} strokeWidth={0.9}>
            {/* The four-petal jaal motif, the same one the web uses for
                `.bg-mughal-jaal`, scaled to the smaller tile. */}
            <Path
              d={`M${tile / 2} 0 C ${tile * 0.62} ${tile * 0.25}, ${tile * 0.75} ${tile * 0.37}, ${tile} ${tile / 2} C ${tile * 0.75} ${tile * 0.62}, ${tile * 0.62} ${tile * 0.75}, ${tile / 2} ${tile} C ${tile * 0.37} ${tile * 0.75}, ${tile * 0.25} ${tile * 0.62}, 0 ${tile / 2} C ${tile * 0.25} ${tile * 0.37}, ${tile * 0.37} ${tile * 0.25}, ${tile / 2} 0 Z`}
            />
            <Circle cx={tile / 2} cy={tile / 2} r={tile * 0.13} />
          </G>
        </Pattern>
      </Defs>

      {/* The lattice, clipped to the arch. */}
      <G clipPath="url(#archClip)">
        <Rect x="0" y="0" width={width} height={height} fill="url(#jaal)" />
        {/* A faint wash inside the niche so the arch reads as a recess rather
            than as a pattern that happens to be arch-shaped. */}
        <Rect x="0" y="0" width={width} height={height} fill={alpha(color, 0.05)} />
      </G>

      {/* The silhouette, stroked last so the edge stays crisp over the lattice. */}
      <Path d={d} fill="none" stroke={color} strokeWidth={1.1} opacity={0.9} />
    </Svg>
  );
}
