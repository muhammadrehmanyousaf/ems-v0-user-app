import fs from 'fs';
import path from 'path';

const DONE = new Set([
  'Button', 'SectionHeader', 'VendorCard', 'HomeHeader', 'CustomTabBar',
  'Chip', 'ChipSelect', 'Card', 'Badge', 'HowItWorks',
]);

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx$/.test(e.name)) files.push(p);
  }
})('src');

const comps = [];
const screens = [];
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  const rel = f.split(path.sep).join('/').replace('src/', '');
  const exps = [...s.matchAll(/export (?:default )?function ([A-Z]\w+)/g)].map((m) => m[1]);
  const el = (s.match(/<(View|Text|Pressable|Ionicons|Image|ScrollView|FlatList)\b/g) || []).length;
  const isScreen = rel.startsWith('app/') && !rel.includes('_layout');
  if (isScreen) screens.push({ name: rel.replace('app/', '').replace('.tsx', ''), el, lines: s.split('\n').length });
  else if (exps.length && (rel.startsWith('components/') || rel.startsWith('features/')))
    comps.push({ rel, names: exps, el });
}

let out = '| ✓ | Component | El | File |\n|---|---|---|---|\n';
comps.sort((a, b) => b.el - a.el).forEach((c) => {
  const done = c.names.some((n) => DONE.has(n));
  out += `| ${done ? '`[x]`' : '`[ ]`'} | \`${c.names.join(', ')}\` | ${c.el} | \`${c.rel}\` |\n`;
});

let out2 = '| ✓ | Screen | El | Lines |\n|---|---|---|---|\n';
screens.sort((a, b) => b.el - a.el).forEach((s) => {
  out2 += `| ${s.name === '(tabs)/index' ? '`[~]`' : '`[ ]`'} | \`${s.name}\` | ${s.el} | ${s.lines} |\n`;
});

fs.writeFileSync('sheet-comps.md', out);
fs.writeFileSync('sheet-screens.md', out2);
console.log('components:', comps.length, '| screens:', screens.length);
console.log('already redrawn:', comps.filter((c) => c.names.some((n) => DONE.has(n))).length);
