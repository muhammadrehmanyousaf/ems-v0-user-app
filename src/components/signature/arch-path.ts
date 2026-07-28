/**
 * Mehrab (Mughal arch) — the brand signature silhouette. A graceful pointed arch:
 * straight sides below the spring line, two shoulder curves meeting at a soft apex
 * at top-centre, bottom corners lightly rounded. Used to mask hero/featured/category
 * imagery and as a gold-hairline framing motif. Authentically South-Asian, structural
 * (not decorative filler).
 */
export function archPath(
  w: number,
  h: number,
  opts?: { spring?: number; apex?: number; radius?: number },
): string {
  const r = opts?.radius ?? Math.min(16, w * 0.06); // bottom corner radius
  const spring = (opts?.spring ?? 0.46) * h; // straight sides end here; arch begins
  const apex = (opts?.apex ?? 0.015) * h; // apex sits just below the top edge
  return [
    `M0,${h - r}`,
    `Q0,${h} ${r},${h}`, // bottom-left corner
    `L${w - r},${h}`,
    `Q${w},${h} ${w},${h - r}`, // bottom-right corner
    `L${w},${spring}`,
    `C${w},${spring * 0.42} ${w * 0.72},${apex} ${w / 2},${apex}`, // right shoulder → apex
    `C${w * 0.28},${apex} 0,${spring * 0.42} 0,${spring}`, // apex → left shoulder
    'Z',
  ].join(' ');
}
