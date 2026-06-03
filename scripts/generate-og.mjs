// Generates 1200x630 social-share (OpenGraph) cards for every template,
// category, guide, and collection. Output: public/og/<kind>/<slug>.png.
// Templates show their actual preview as a tilted thumbnail; other pages get
// a clean branded text card. Deterministic (no timestamps) → stable bytes.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const previewsDir = path.join(root, 'public', 'previews');
const outRoot = path.join(root, 'public', 'og');

const W = 1200, H = 630;
const BRAND = '#f59e0b', INK = '#1f2937', MUTED = '#6b7280';

// ---- Parse catalog + content configs ----
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const templatesSrc = read('src/config/templates.ts');
const tplRe = /t\('([^']+)',\s*'([^']+)',\s*'([^']+)',[\s\S]*?,\s*'(resume|bookkeeping|invoice|planner|letters|business|education|email|checklist|finance|wedding|health|kids|certificate|social|wallart)',/g;
const templates = [...templatesSrc.matchAll(tplRe)].map((m) => ({ slug: m[1], title: m[2], desc: m[3], category: m[4] }));

const catRe = /\{ id: '([a-z]+)', title: '([^']+)', description: '([^']+)'/g;
const categories = [...templatesSrc.matchAll(catRe)].map((m) => ({ id: m[1], title: m[2], desc: m[3] }));

const guidesSrc = read('src/config/guides.ts');
const guideRe = /slug: '([a-z0-9-]+)',\s*\n\s*title: '([^']+)',\s*\n\s*description: '([^']+)'/g;
const guides = [...guidesSrc.matchAll(guideRe)].map((m) => ({ slug: m[1], title: m[2], desc: m[3] }));

const colSrc = read('src/config/collections.ts');
const colRe = /slug: '([a-z0-9-]+)', kind: '(profession|seasonal)',\s*\n\s*title: '([^']+)', heading: '([^']+)',\s*\n\s*intro: '([^']+)'/g;
const collections = [...colSrc.matchAll(colRe)].map((m) => ({ slug: m[1], kind: m[2], title: m[4], desc: m[5] }));

// ---- Drawing helpers ----
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function wrap(ctx, text, maxW, size, weight = '800', maxLines = 3) {
  ctx.font = `${weight} ${size}px Arial, sans-serif`;
  const words = text.split(' '); const lines = []; let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; if (lines.length === maxLines - 1) break; }
    else line = test;
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

function brandRow(ctx) {
  rrect(ctx, 64, 56, 40, 40, 9); ctx.fillStyle = BRAND; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '800 24px Arial'; ctx.textAlign = 'center'; ctx.fillText('F', 84, 86); ctx.textAlign = 'left';
  ctx.fillStyle = INK; ctx.font = '700 26px Arial'; ctx.fillText('freebietemplate.com', 118, 86);
}
function freeBadge(ctx, x, y) {
  ctx.font = '800 18px Arial'; const tw = ctx.measureText('100% FREE').width;
  rrect(ctx, x, y, tw + 36, 40, 20); ctx.fillStyle = BRAND; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.fillText('100% FREE', x + 18, y + 27);
}
function footerBar(ctx) { ctx.fillStyle = BRAND; ctx.fillRect(0, H - 12, W, 12); }
function bg(ctx) {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#fffdf7'); g.addColorStop(1, '#fff7ec');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

async function templateCard(t) {
  const canvas = createCanvas(W, H); const ctx = canvas.getContext('2d');
  bg(ctx); brandRow(ctx);
  const cat = categories.find((c) => c.id === t.category);
  // Right: tilted preview thumbnail
  try {
    const img = await loadImage(path.join(previewsDir, `${t.slug}.png`));
    const tw = 300, th = tw * (img.height / img.width);
    ctx.save();
    ctx.translate(W - 250, H / 2 + 10); ctx.rotate(0.06);
    ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    ctx.fillStyle = '#fff'; rrect(ctx, -tw / 2 - 10, -th / 2 - 10, tw + 20, th + 20, 12); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.drawImage(img, -tw / 2, -th / 2, tw, th);
    ctx.restore();
  } catch { /* no preview */ }
  // Left: text
  const x = 64, maxW = 640;
  if (cat) { ctx.fillStyle = BRAND; ctx.font = '700 22px Arial'; ctx.fillText(cat.title.toUpperCase(), x, 180); }
  const lines = wrap(ctx, t.title, maxW, 58, '800', 3);
  ctx.fillStyle = INK; lines.forEach((l, i) => { ctx.font = '800 58px Arial'; ctx.fillText(l, x, 250 + i * 66); });
  let dy = 250 + lines.length * 66 + 16;
  ctx.fillStyle = MUTED; ctx.font = '400 24px Arial';
  wrap(ctx, t.desc, maxW, 24, '400', 2).forEach((l) => { ctx.fillText(l, x, dy); dy += 32; });
  ctx.fillStyle = '#9ca3af'; ctx.font = '600 20px Arial';
  ctx.fillText('Free · Editable · Word, Excel, Google Docs & Sheets', x, dy + 24);
  freeBadge(ctx, x, dy + 50);
  footerBar(ctx);
  return canvas.encode('png');
}

function textCard(title, desc, kicker) {
  const canvas = createCanvas(W, H); const ctx = canvas.getContext('2d');
  bg(ctx); brandRow(ctx);
  const x = 64, maxW = 900;
  ctx.fillStyle = BRAND; ctx.font = '700 24px Arial'; ctx.fillText(kicker.toUpperCase(), x, 220);
  const lines = wrap(ctx, title, maxW, 70, '800', 3);
  ctx.fillStyle = INK; lines.forEach((l, i) => { ctx.font = '800 70px Arial'; ctx.fillText(l, x, 300 + i * 80); });
  let dy = 300 + lines.length * 80 + 20;
  ctx.fillStyle = MUTED; ctx.font = '400 28px Arial';
  wrap(ctx, desc, maxW, 28, '400', 2).forEach((l) => { ctx.fillText(l, x, dy); dy += 38; });
  freeBadge(ctx, x, dy + 24);
  footerBar(ctx);
  return canvas.encode('png');
}

// ---- Generate ----
function ensure(dir) { fs.mkdirSync(path.join(outRoot, dir), { recursive: true }); }
['templates', 'category', 'guide', 'collection'].forEach(ensure);

let n = 0;
for (const t of templates) { fs.writeFileSync(path.join(outRoot, 'templates', `${t.slug}.png`), await templateCard(t)); n++; if (n % 50 === 0) console.log(`  templates ${n}/${templates.length}`); }
for (const c of categories) fs.writeFileSync(path.join(outRoot, 'category', `${c.id}.png`), await textCard(c.title, c.desc, 'Free template category'));
for (const g of guides) fs.writeFileSync(path.join(outRoot, 'guide', `${g.slug}.png`), await textCard(g.title, g.desc, 'Free guide'));
for (const col of collections) fs.writeFileSync(path.join(outRoot, 'collection', `${col.slug}.png`), await textCard(col.title, col.desc, col.kind === 'profession' ? 'Templates by profession' : 'Seasonal templates'));

console.log(`Done. OG cards: ${templates.length} templates, ${categories.length} categories, ${guides.length} guides, ${collections.length} collections.`);
