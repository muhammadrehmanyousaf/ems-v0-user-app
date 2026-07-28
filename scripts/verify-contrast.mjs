/**
 * Contrast gate — asserts the Bridal palette meets WCAG-AA for every
 * foreground/background pair the app actually uses. Mirrors src/theme/tokens.ts.
 * Run: `node scripts/verify-contrast.mjs` (or `npm run verify:contrast`).
 */
const C = {
  base: '#FCFCFD',
  ivory: '#FDF8F2',
  cream: '#FFF9F4',
  blush: '#FFF0F3',
  charcoalSurface: '#2C1810',
  gold: '#C9956A',
  goldDark: '#916539',
  rose: '#F2B5C0',
  ink: '#2C1810',
  text: '#5C3D2E',
  textSoft: '#7A5040',
  textLabel: '#955E39',
  inkCool: '#181221',
  onDark: '#FDF8F2',
  onGold: '#2C1810',
  beige: '#EDD9C3',
  sand: '#F5E6D3',
  success: '#3F6B4C',
  successBg: '#E8F1E9',
  danger: '#A23A2A',
  dangerBg: '#FBEAE6',
  info: '#8B5A72',
  infoBg: '#F3EBEF',
};

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
  return (Math.max(a, b) / Math.min(a, b));
}

// [fg, bg, minRatio, label] — 4.5 = normal text AA, 3.0 = large text / UI AA.
const CHECKS = [
  [C.ink, C.ivory, 4.5, 'heading ink on ivory'],
  [C.ink, C.cream, 4.5, 'heading ink on cream'],
  [C.ink, C.base, 4.5, 'heading ink on base'],
  [C.text, C.ivory, 4.5, 'body on ivory'],
  [C.text, C.cream, 4.5, 'body on cream'],
  [C.textSoft, C.ivory, 4.5, 'muted on ivory'],
  [C.textSoft, C.cream, 4.5, 'muted on cream'],
  [C.textLabel, C.ivory, 4.5, 'label (gold-brown) on ivory'],
  [C.goldDark, C.ivory, 4.5, 'gold-dark text/link on ivory'],
  [C.goldDark, C.cream, 4.5, 'gold-dark text/link on cream'],
  [C.onGold, C.gold, 4.5, 'button text on gold'],
  [C.onDark, C.charcoalSurface, 4.5, 'text on charcoal'],
  [C.success, C.ivory, 3.0, 'success on ivory (UI)'],
  [C.success, C.successBg, 4.5, 'success on success-bg'],
  [C.danger, C.ivory, 3.0, 'danger on ivory (UI)'],
  [C.danger, C.dangerBg, 4.5, 'danger on danger-bg'],
  [C.info, C.infoBg, 4.5, 'info on info-bg'],
  [C.ink, C.sand, 4.5, 'ink on sand (chip)'],
  [C.textSoft, C.sand, 4.5, 'chip label on sand'],
];

let pass = 0;
let fail = 0;
for (const [fg, bg, min, label] of CHECKS) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (ok) pass += 1;
  else fail += 1;
  const mark = ok ? '✓' : '✗';
  console.log(`${mark} ${r.toFixed(2)}:1 (need ${min})  ${label}`);
}
console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) {
  console.log('CONTRAST GATE FAILED');
  process.exit(1);
}
console.log('CONTRAST GATE PASSED');
