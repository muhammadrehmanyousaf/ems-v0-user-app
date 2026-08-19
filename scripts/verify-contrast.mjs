/**
 * Contrast gate — asserts the live palette meets WCAG-AA for every
 * foreground/background pair the app actually paints.
 *
 * ── Why this file no longer contains any colours ──────────────────────────
 *
 * It used to keep its own hand-copied duplicate of the palette, with a comment
 * asking whoever changed a token to remember to change it here too. That is not
 * a gate, it is a second source of truth — and it failed exactly as you would
 * expect: the v4 palette landed, every value on screen changed, and this script
 * reported "38 passed" while still measuring v3's colours. A gate that can pass
 * against colours nobody is looking at is worse than no gate, because it is
 * trusted.
 *
 * It now parses `src/theme/tokens.ts` and measures whatever is actually there.
 * A token cannot change without this seeing it, and a token that is deleted
 * fails loudly instead of silently testing a ghost.
 *
 * Gate 9 in rules.md cannot pass without this being green.
 * Run: `npm run verify:contrast`
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = fs.readFileSync(path.join(ROOT, 'src/theme/tokens.ts'), 'utf8');

/**
 * Pull `name: '#RRGGBB'` out of the palette block only. Scoping to the palette
 * matters: `colors` is full of aliases pointing at palette entries, and a plain
 * whole-file scrape would also collect the shadow colours, which are not
 * foregrounds and would make the count meaningless.
 */
function readPalette() {
  const start = SRC.indexOf('export const palette = {');
  if (start === -1) throw new Error('palette block not found in tokens.ts');
  const end = SRC.indexOf('} as const;', start);
  const block = SRC.slice(start, end);
  const out = {};
  for (const m of block.matchAll(/(\w+):\s*'(#[0-9A-Fa-f]{6})'/g)) out[m[1]] = m[2];
  return out;
}

const C = readPalette();

/** Fail loudly if a pair below names a token that no longer exists. */
function need(name) {
  const v = C[name];
  if (!v) {
    console.error(`\n✗ token "${name}" is referenced by the contrast gate but no longer exists in tokens.ts.`);
    console.error('  Either restore it or update the CHECKS table — do not delete the check.\n');
    process.exit(1);
  }
  return v;
}

function lin(v) {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
function lum(hex) {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
}
function ratio(fg, bg) {
  const a = lum(fg) + 0.05;
  const b = lum(bg) + 0.05;
  return Math.max(a, b) / Math.min(a, b);
}

/**
 * Composite `fg` at opacity `a` over `bg`, returning the hex a user actually
 * sees. Screens dim secondary text with `opacity` rather than a lighter token,
 * so measuring the token alone reports a contrast nobody on the screen has.
 */
function mix(fgName, bgName, a) {
  const f = parseInt(need(fgName).slice(1), 16);
  const b = parseInt(need(bgName).slice(1), 16);
  const ch = (s) =>
    Math.round((((f >> s) & 255) * a + ((b >> s) & 255) * (1 - a)))
      .toString(16)
      .padStart(2, '0');
  return `#${ch(16)}${ch(8)}${ch(0)}`;
}

// [fgTokenName | literal hex, bgTokenName, minRatio, label]
// 4.5 = normal text AA · 3.0 = large text / UI component AA.
const CHECKS = [
  // ── Ink on every surface. The whole system rests on these six. ──────────
  ['ink', 'paper', 4.5, 'heading ink on paper'],
  ['ink', 'white', 4.5, 'heading ink on card'],
  ['ink', 'sunken', 4.5, 'ink on a well'],
  ['ink', 'goldSoft', 4.5, 'ink on the gold wash'],
  ['ink', 'shaadiSoft', 4.5, 'ink on the shaadi wash'],
  ['inkBody', 'paper', 4.5, 'body on paper'],
  ['inkBody', 'white', 4.5, 'body on card'],
  ['inkMuted', 'paper', 4.5, 'muted / caption on paper'],
  ['inkMuted', 'white', 4.5, 'muted / caption on card'],
  ['inkMuted', 'sunken', 4.5, 'muted on a well'],

  // ── Gold: the one accent. It must survive as TEXT, as a FILL, and as a
  //    LINE — three different thresholds, and v3 only ever checked two. ────
  ['goldDeep', 'paper', 4.5, 'gold text on paper'],
  ['goldDeep', 'white', 4.5, 'gold text on card'],
  ['goldDeep', 'goldSoft', 4.5, 'gold text on its own wash'],
  ['ink', 'gold', 4.5, 'CTA label on the gold fill'],
  // The gold FILL is 2.36:1 against paper — below the 3:1 that WCAG asks of a
  // UI component's boundary. Darkening gold to reach it turns the metallic
  // accent into mustard, so the boundary is carried by a `goldDeep` RIM
  // instead: 1px, on every gold fill, which is also the brand's signature line.
  // `Button` enforces it. This checks the rim, which is what defines the edge.
  ['goldDeep', 'paper', 3.0, 'gold CTA rim against paper (defines the edge)'],
  ['goldLine', 'paper', 1.2, 'gold hairline is visible on paper'],
  ['line', 'paper', 1.15, 'hairline is visible on paper'],
  ['line', 'white', 1.2, 'hairline is visible on a card'],
  ['lineStrong', 'white', 1.35, 'strong rule is visible on a card'],

  // ── The deep register ──────────────────────────────────────────────────
  ['onDark', 'inkSurface', 4.5, 'type on the deep register'],
  ['goldLight', 'inkSurface', 4.5, 'gold type on the deep register'],
  ['gold', 'inkSurface', 3.0, 'gold accent on the deep register (UI)'],
  [mix('onDark', 'inkSurface', 0.7), 'inkSurface', 4.5, 'dimmed label on deep (onDark @70%)'],

  // ── Secondary ──────────────────────────────────────────────────────────
  ['shaadi', 'paper', 4.5, 'shaadi red on paper'],
  ['shaadi', 'white', 4.5, 'shaadi red on card'],
  ['shaadi', 'shaadiSoft', 4.5, 'shaadi red on its own wash'],
  ['white', 'shaadi', 4.5, 'type on a shaadi fill'],

  // ── Semantic, on paper and on their own washes ─────────────────────────
  ['success', 'paper', 4.5, 'success on paper'],
  ['success', 'successBg', 4.5, 'success on its wash'],
  ['danger', 'paper', 4.5, 'danger on paper'],
  ['danger', 'dangerBg', 4.5, 'danger on its wash'],
  ['warning', 'paper', 4.5, 'warning on paper'],
  ['warning', 'warningBg', 4.5, 'warning on its wash'],
  ['info', 'paper', 4.5, 'info on paper'],
  ['info', 'infoBg', 4.5, 'info on its wash'],

  // ── Decorative-only. Held to a LOWER bar deliberately, and named so that
  //    nobody mistakes the pass for permission to set body copy in it. ────
  ['inkFaint', 'paper', 2.5, 'faint (DECORATIVE ONLY) on paper'],
];

let failed = 0;
for (const [fg, bg, min, label] of CHECKS) {
  const fgHex = fg.startsWith('#') ? fg : need(fg);
  const bgHex = need(bg);
  const r = ratio(fgHex, bgHex);
  const ok = r >= min;
  if (!ok) failed += 1;
  console.log(`${ok ? '✓' : '✗'} ${r.toFixed(2)}:1 (need ${min})  ${label}`);
}

const total = CHECKS.length;
console.log(`\n${total - failed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('\nCONTRAST GATE FAILED — fix the TOKEN, never the threshold.\n');
  process.exit(1);
}
console.log('CONTRAST GATE PASSED');
