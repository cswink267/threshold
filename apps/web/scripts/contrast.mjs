// Checks the world's colors against WCAG contrast minimums. Run: npm run contrast
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/world.css', import.meta.url), 'utf8');
const tokens = Object.fromEntries(
  [...css.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6}|#[0-9a-f]{3})\b/gi)].map(([, name, hex]) => [name, hex]),
);

const channel = (value) => {
  const s = value / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex) => {
  const h = hex.length === 4 ? [...hex.slice(1)].map((c) => c + c).join('') : hex.slice(1);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
const ratio = (a, b) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

const checks = [
  ['ink', 'bg', 4.5, 'headings and primary text'],
  ['ink-soft', 'bg', 4.5, 'reading text'],
  ['ink-soft', 'bg-deep', 4.5, 'reading text at the darkest edges'],
  ['ink-dim', 'bg', 3, 'large type only'],
  ['accent', 'bg', 3, 'focus ring and the light'],
  ['accent-ink', 'accent', 4.5, 'text on the main action'],
];

let failures = 0;
for (const [fg, bg, min, role] of checks) {
  if (!tokens[fg] || !tokens[bg]) {
    console.log(`skip  --${fg} on --${bg}: not a hex color in world.css`);
    continue;
  }
  const r = ratio(tokens[fg], tokens[bg]);
  if (r < min) failures++;
  console.log(`${r >= min ? 'pass' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  --${fg} on --${bg}  (needs ${min}:1, ${role})`);
}
process.exitCode = failures ? 1 : 0;
