// Generates branded app icons for iOS/Android home-screen + PWA install.
// Outputs to public/: apple-touch-icon.png (180), icon-192.png, icon-512.png,
// icon-512-maskable.png. Brand = amber square with a white "document" glyph
// (matches the site header logo).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';

const here = path.dirname(fileURLToPath(import.meta.url));
const pub = path.resolve(here, '..', 'public');
const AMBER = '#f59e0b';

// glyphFrac: page size as a fraction of the canvas (smaller = more safe-zone
// padding, used for Android maskable icons).
function drawIcon(S, glyphFrac, rounded) {
  const canvas = createCanvas(S, S);
  const ctx = canvas.getContext('2d');
  // Background
  if (rounded) { ctx.beginPath(); ctx.roundRect(0, 0, S, S, S * 0.22); ctx.fillStyle = AMBER; ctx.fill(); }
  else { ctx.fillStyle = AMBER; ctx.fillRect(0, 0, S, S); }
  // White "page" glyph, centered
  const pw = S * glyphFrac, ph = pw * 1.25;
  const px = (S - pw) / 2, py = (S - ph) / 2;
  ctx.beginPath(); ctx.roundRect(px, py, pw, ph, S * 0.04); ctx.fillStyle = '#ffffff'; ctx.fill();
  // Amber lines on the page
  ctx.strokeStyle = AMBER; ctx.lineCap = 'round'; ctx.lineWidth = S * 0.035;
  const lx = px + pw * 0.2, lw = pw * 0.6;
  [0.3, 0.5, 0.7].forEach((f, i) => {
    const y = py + ph * f;
    ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(lx + (i === 2 ? lw * 0.6 : lw), y); ctx.stroke();
  });
  return canvas.encode('png');
}

const out = async (name, buf) => fs.writeFileSync(path.join(pub, name), await buf);

await out('apple-touch-icon.png', drawIcon(180, 0.46, false)); // iOS rounds it itself
await out('icon-192.png', drawIcon(192, 0.46, true));
await out('icon-512.png', drawIcon(512, 0.46, true));
await out('icon-512-maskable.png', drawIcon(512, 0.38, false)); // full-bleed + safe-zone glyph

console.log('Done. Icons written: apple-touch-icon.png, icon-192.png, icon-512.png, icon-512-maskable.png');
