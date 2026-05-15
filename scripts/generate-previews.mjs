// Generates Etsy-style preview mockups for every template in the catalog.
// One PNG per template at public/previews/<slug>.png. Category-driven layout.
//
// Synthetic mockups with generic placeholder text — not screenshots of the actual files.
// Looks polished enough for listing thumbnails and detail-page previews.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outDir = path.join(root, 'public', 'previews');
fs.mkdirSync(outDir, { recursive: true });

const W = 800;
const H = 1035; // ~ US Letter aspect ratio at small size
const BRAND = '#f59e0b';
const INK = '#1f2937';
const MUTED = '#6b7280';
const LINE = '#e5e7eb';
const PAPER = '#ffffff';
const SOFT = '#f9fafb';

// ---- Catalog extraction ----
const catalogSrc = fs.readFileSync(path.join(root, 'src/config/templates.ts'), 'utf8');
const entryRe = /t\('([^']+)',\s*'([^']+)',\s*'([^']+)',[\s\S]*?,\s*'(resume|bookkeeping|invoice|planner|letters|business|education|email)',/g;
const entries = [];
for (const m of catalogSrc.matchAll(entryRe)) {
  entries.push({ slug: m[1], title: m[2], description: m[3], category: m[4] });
}
console.log(`Found ${entries.length} templates to preview.`);

// ---- Helpers ----
function paper(ctx) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  // accent stripe on the left edge
  ctx.fillStyle = BRAND;
  ctx.fillRect(0, 0, 8, H);
}
function watermark(ctx) {
  ctx.fillStyle = MUTED;
  ctx.font = '14px Inter, Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('freebietemplate.com', W - 24, H - 18);
  ctx.textAlign = 'left';
}
function rule(ctx, x1, y, x2, color = LINE, w = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
}
function box(ctx, x, y, w, h, fill, stroke = null) {
  if (fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h); }
}
function text(ctx, str, x, y, opts = {}) {
  ctx.fillStyle = opts.color || INK;
  ctx.font = `${opts.weight || ''} ${opts.size || 14}px Inter, Arial, sans-serif`.trim();
  if (opts.align) ctx.textAlign = opts.align;
  ctx.fillText(str, x, y);
  ctx.textAlign = 'left';
}
function placeholderLine(ctx, x, y, len, h = 8, color = '#dadde2') {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, len, h);
}

// ---- Category renderers ----

function renderResume(ctx, entry) {
  paper(ctx);
  // Header band
  text(ctx, 'FIRST LAST', W / 2, 110, { size: 38, weight: '700', align: 'center' });
  text(ctx, 'City, State  ·  (555) 555-1234  ·  you@email.com  ·  linkedin.com/in/you', W / 2, 138, { size: 14, color: MUTED, align: 'center' });
  rule(ctx, 80, 168, W - 80);

  // Section: Summary
  text(ctx, 'SUMMARY', 80, 200, { size: 14, weight: '700', color: BRAND });
  placeholderLine(ctx, 80, 218, W - 160);
  placeholderLine(ctx, 80, 232, W - 160);
  placeholderLine(ctx, 80, 246, 380);

  // Section: Experience
  text(ctx, 'EXPERIENCE', 80, 290, { size: 14, weight: '700', color: BRAND });
  text(ctx, 'Job Title  —  Company Name', 80, 316, { size: 15, weight: '600' });
  text(ctx, 'City, State  ·  Month YYYY – Present', 80, 334, { size: 12, color: MUTED });
  ['•', '•', '•'].forEach((b, i) => {
    text(ctx, b, 84, 360 + i * 22, { size: 13 });
    placeholderLine(ctx, 100, 354 + i * 22, W - 200);
  });
  text(ctx, 'Job Title  —  Company Name', 80, 446, { size: 15, weight: '600' });
  text(ctx, 'City, State  ·  Month YYYY – Month YYYY', 80, 464, { size: 12, color: MUTED });
  ['•', '•'].forEach((b, i) => {
    text(ctx, b, 84, 490 + i * 22, { size: 13 });
    placeholderLine(ctx, 100, 484 + i * 22, W - 200);
  });

  // Section: Education
  text(ctx, 'EDUCATION', 80, 580, { size: 14, weight: '700', color: BRAND });
  text(ctx, 'Degree, Major  —  University Name', 80, 606, { size: 15, weight: '600' });
  text(ctx, 'City, State  ·  Graduated Month YYYY', 80, 624, { size: 12, color: MUTED });

  // Section: Skills
  text(ctx, 'SKILLS', 80, 680, { size: 14, weight: '700', color: BRAND });
  const skills = ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4', 'Skill 5', 'Skill 6'];
  let sx = 80;
  skills.forEach((s) => {
    const w = ctx.measureText(s).width + 24;
    box(ctx, sx, 696, w, 26, '#fef3c7');
    text(ctx, s, sx + 12, 714, { size: 13, color: '#92400e' });
    sx += w + 8;
  });

  // Footer band: title of the template
  box(ctx, 0, H - 100, W, 100, SOFT);
  text(ctx, entry.title, W / 2, H - 60, { size: 18, weight: '700', align: 'center' });
  text(ctx, 'FREE  ·  No signup  ·  Editable in Word + Google Docs', W / 2, H - 38, { size: 13, color: MUTED, align: 'center' });
  watermark(ctx);
}

function renderSpreadsheet(ctx, entry, opts = {}) {
  paper(ctx);
  // Title bar
  box(ctx, 0, 0, W, 60, BRAND);
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px Inter, Arial, sans-serif';
  ctx.fillText(entry.title, 32, 38);

  const headers = opts.headers || ['Date', 'Description', 'Category', 'Type', 'Amount'];
  const colW = (W - 60) / headers.length;

  // Column header row
  box(ctx, 30, 100, W - 60, 36, '#fff7ed');
  headers.forEach((h, i) => {
    text(ctx, h, 30 + i * colW + 14, 124, { size: 13, weight: '700', color: '#92400e' });
  });
  rule(ctx, 30, 136, W - 30, '#fed7aa', 1);

  // Data rows
  for (let r = 0; r < 18; r++) {
    const y = 136 + r * 30;
    if (r % 2 === 1) box(ctx, 30, y, W - 60, 30, SOFT);
    headers.forEach((_, i) => {
      const cellX = 30 + i * colW + 14;
      const len = 30 + Math.random() * (colW - 60);
      placeholderLine(ctx, cellX, y + 14, len, 6, r % 3 === 0 ? '#d1d5db' : '#e5e7eb');
    });
    rule(ctx, 30, y + 30, W - 30, '#f1f3f5', 1);
  }

  // Summary block
  const sy = 720;
  box(ctx, 30, sy, W - 60, 200, '#fffbeb', '#fde68a');
  text(ctx, 'SUMMARY', 50, sy + 32, { size: 14, weight: '700', color: '#92400e' });
  const sumRows = ['Total income', 'Total expenses', 'Net'];
  sumRows.forEach((label, i) => {
    text(ctx, label, 50, sy + 70 + i * 32, { size: 14 });
    placeholderLine(ctx, W - 220, sy + 64 + i * 32, 160, 10, '#fcd34d');
  });

  // Footer
  text(ctx, 'FREE  ·  Auto-totals  ·  Excel + Google Sheets', W / 2, H - 18, { size: 13, color: MUTED, align: 'center' });
  watermark(ctx);
}

function renderInvoice(ctx, entry) {
  paper(ctx);
  // Big title at top
  text(ctx, 'INVOICE', 40, 70, { size: 38, weight: '800' });

  // Business info left, meta right
  ['Your Business Name', 'Street Address', 'City, State ZIP', 'email@business.com'].forEach((line, i) => {
    text(ctx, line, 40, 110 + i * 20, { size: 14, color: i === 0 ? INK : MUTED });
  });

  const metaY = 110;
  ['Invoice #', 'Date', 'Due Date', 'Terms'].forEach((label, i) => {
    text(ctx, label, W - 280, metaY + i * 24, { size: 13, weight: '600', color: MUTED });
    placeholderLine(ctx, W - 160, metaY + i * 24 - 6, 130, 8);
  });

  // Bill To
  text(ctx, 'BILL TO', 40, 250, { size: 13, weight: '700', color: BRAND });
  ['Client Name', 'Client Address', 'City, State ZIP'].forEach((line, i) => {
    text(ctx, line, 40, 278 + i * 22, { size: 14, color: i === 0 ? INK : MUTED });
  });

  // Line items table
  box(ctx, 40, 380, W - 80, 40, BRAND);
  ['Description', 'Qty', 'Rate', 'Amount'].forEach((h, i) => {
    const xs = [60, 460, 560, 670];
    text(ctx, h, xs[i], 406, { size: 14, weight: '700', color: '#ffffff' });
  });

  for (let r = 0; r < 6; r++) {
    const y = 420 + r * 42;
    if (r % 2 === 1) box(ctx, 40, y, W - 80, 42, SOFT);
    placeholderLine(ctx, 60, y + 20, 300 + Math.random() * 60);
    placeholderLine(ctx, 460, y + 20, 30);
    placeholderLine(ctx, 560, y + 20, 70);
    placeholderLine(ctx, 670, y + 20, 70, 8, '#94a3b8');
    rule(ctx, 40, y + 42, W - 40, '#e5e7eb', 1);
  }

  // Totals block
  const ty = 720;
  text(ctx, 'Subtotal', 540, ty, { size: 14, color: MUTED });
  placeholderLine(ctx, 670, ty - 6, 80);
  text(ctx, 'Tax', 540, ty + 28, { size: 14, color: MUTED });
  placeholderLine(ctx, 670, ty + 22, 80);
  rule(ctx, 540, ty + 48, W - 40);
  text(ctx, 'TOTAL DUE', 540, ty + 80, { size: 16, weight: '700' });
  placeholderLine(ctx, 670, ty + 74, 80, 12, BRAND);

  // Footer
  text(ctx, 'Payment terms: Net 30. Thank you for your business.', 40, H - 60, { size: 13, color: MUTED });
  text(ctx, entry.title, W / 2, H - 30, { size: 15, weight: '700', align: 'center', color: BRAND });
  watermark(ctx);
}

function renderPlannerGrid(ctx, entry) {
  paper(ctx);
  box(ctx, 0, 0, W, 80, BRAND);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 26px Inter, Arial, sans-serif';
  ctx.fillText(entry.title, 36, 50);

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const colW = (W - 60) / 7;
  // Day headers
  days.forEach((d, i) => {
    text(ctx, d, 30 + i * colW + colW / 2, 122, { size: 14, weight: '700', color: '#92400e', align: 'center' });
  });
  rule(ctx, 30, 134, W - 30, BRAND, 2);

  // Time-block rows
  const hours = ['7 AM', '8', '9', '10', '11', '12 PM', '1', '2', '3', '4', '5', '6', '7'];
  for (let r = 0; r < hours.length; r++) {
    const y = 154 + r * 52;
    text(ctx, hours[r], 30, y + 28, { size: 12, color: MUTED });
    rule(ctx, 70, y, W - 30, '#f3f4f6', 1);
    for (let c = 0; c < 7; c++) {
      if ((r + c) % 5 === 0) {
        const cx = 80 + c * colW;
        box(ctx, cx, y + 8, colW - 12, 30, '#fffbeb', '#fde68a');
        placeholderLine(ctx, cx + 8, y + 22, 70, 6, '#fcd34d');
      }
    }
  }

  // Footer
  text(ctx, 'FREE printable  ·  Letter + A4  ·  Time blocks + priorities', W / 2, H - 18, { size: 13, color: MUTED, align: 'center' });
  watermark(ctx);
}

function renderLetter(ctx, entry) {
  paper(ctx);
  // Title centered
  text(ctx, entry.title.toUpperCase(), W / 2, 130, { size: 24, weight: '800', align: 'center' });
  rule(ctx, 200, 156, W - 200, BRAND, 2);

  // Sender block
  ['Your Name', 'Street Address', 'City, State ZIP', '', 'Date: __________'].forEach((line, i) => {
    if (line) text(ctx, line, 80, 210 + i * 22, { size: 14, color: i === 0 ? INK : MUTED });
  });

  // Recipient block
  ['Recipient Name', 'Recipient Title', 'Recipient Address', 'City, State ZIP'].forEach((line, i) => {
    text(ctx, line, 80, 360 + i * 22, { size: 14, color: MUTED });
  });

  text(ctx, 'Dear [Recipient Name],', 80, 480, { size: 15 });

  // Body paragraphs
  for (let p = 0; p < 3; p++) {
    const baseY = 520 + p * 100;
    for (let l = 0; l < 4; l++) {
      placeholderLine(ctx, 80, baseY + l * 18, W - 160 - (l === 3 ? Math.random() * 200 : 0));
    }
  }

  // Sign-off
  text(ctx, 'Sincerely,', 80, 880, { size: 15 });
  rule(ctx, 80, 940, 300, '#9ca3af', 1);
  text(ctx, 'Your Name', 80, 962, { size: 14, color: MUTED });

  watermark(ctx);
}

function renderEmailSig(ctx, entry) {
  paper(ctx);
  // Centered card showing the email signature mockup
  const cardX = 60, cardY = 280, cardW = W - 120, cardH = 280;
  box(ctx, cardX, cardY, cardW, cardH, '#ffffff', '#e5e7eb');

  // Accent border-right
  box(ctx, cardX + cardW / 2 - 3, cardY + 30, 3, cardH - 60, BRAND);

  // Left side: name + title
  text(ctx, 'Your Name', cardX + 36, cardY + 80, { size: 24, weight: '700' });
  text(ctx, 'Your Title', cardX + 36, cardY + 110, { size: 14, color: MUTED });
  text(ctx, 'Your Company', cardX + 36, cardY + 158, { size: 14, weight: '600', color: BRAND });

  // Right side: contact lines
  const rx = cardX + cardW / 2 + 36;
  text(ctx, 'P  (555) 555-1234', rx, cardY + 80, { size: 13 });
  text(ctx, 'E  you@company.com', rx, cardY + 110, { size: 13 });
  text(ctx, 'W  yourcompany.com', rx, cardY + 140, { size: 13, color: BRAND });

  // Social icons (faux)
  for (let i = 0; i < 4; i++) {
    const cx = rx + i * 36 + 12;
    ctx.fillStyle = BRAND;
    ctx.beginPath();
    ctx.arc(cx, cardY + 200, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  // Header title
  text(ctx, entry.title, W / 2, 130, { size: 26, weight: '800', align: 'center' });
  text(ctx, 'Copy / paste into Gmail or Outlook', W / 2, 168, { size: 14, color: MUTED, align: 'center' });

  // Footer
  text(ctx, 'FREE  ·  HTML + Google Docs versions  ·  Renders in every email client', W / 2, H - 60, { size: 13, color: MUTED, align: 'center' });
  watermark(ctx);
}

function renderBusinessDoc(ctx, entry) {
  paper(ctx);
  // Title + subtitle
  text(ctx, entry.title, 60, 100, { size: 28, weight: '800' });
  text(ctx, 'Prepared by: __________   ·   Date: __________', 60, 132, { size: 13, color: MUTED });
  rule(ctx, 60, 154, W - 60, BRAND, 3);

  const sections = ['Overview', 'Section 1', 'Section 2', 'Section 3', 'Next Steps'];
  sections.forEach((s, i) => {
    const y = 200 + i * 150;
    text(ctx, s.toUpperCase(), 60, y, { size: 14, weight: '700', color: BRAND });
    for (let l = 0; l < 4; l++) {
      placeholderLine(ctx, 60, y + 24 + l * 18, W - 120 - (l === 3 ? Math.random() * 220 : 0));
    }
  });

  watermark(ctx);
}

function renderEducation(ctx, entry) {
  paper(ctx);
  box(ctx, 0, 0, W, 80, BRAND);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 24px Inter, Arial, sans-serif';
  ctx.fillText(entry.title, 30, 50);

  // Form-like fields
  ['Teacher', 'Date', 'Grade', 'Subject'].forEach((label, i) => {
    const x = 30 + (i % 2) * (W / 2 - 20);
    const y = 130 + Math.floor(i / 2) * 60;
    text(ctx, label, x, y, { size: 13, weight: '700', color: MUTED });
    rule(ctx, x, y + 20, x + W / 2 - 80, '#9ca3af', 1);
  });

  const sections = ['Objectives', 'Materials', 'Lesson', 'Assessment'];
  sections.forEach((s, i) => {
    const y = 290 + i * 170;
    text(ctx, s, 30, y, { size: 16, weight: '700', color: BRAND });
    box(ctx, 30, y + 12, W - 60, 130, SOFT, '#e5e7eb');
    for (let l = 0; l < 4; l++) placeholderLine(ctx, 50, y + 36 + l * 22, W - 100 - (l === 3 ? Math.random() * 200 : 0));
  });

  watermark(ctx);
}

// ---- Dispatcher ----

function render(entry) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  if (entry.category === 'resume') renderResume(ctx, entry);
  else if (entry.category === 'bookkeeping') {
    const headers = entry.slug === 'mileage-log' ? ['Date', 'Start', 'End', 'Miles', 'Purpose'] : ['Date', 'Description', 'Category', 'Type', 'Amount'];
    renderSpreadsheet(ctx, entry, { headers });
  }
  else if (entry.category === 'invoice') {
    if (/quote|estimate|reminder|receipt|letter/i.test(entry.slug)) renderLetter(ctx, entry);
    else renderInvoice(ctx, entry);
  }
  else if (entry.category === 'planner') {
    // Trackers with spreadsheet feel get the grid; planners get the calendar
    if (/tracker|log|budget|debt|sinking|goal/i.test(entry.slug)) {
      renderSpreadsheet(ctx, entry, { headers: ['Item', 'Date', 'Status', 'Notes', 'Amount'] });
    } else {
      renderPlannerGrid(ctx, entry);
    }
  }
  else if (entry.category === 'letters') renderLetter(ctx, entry);
  else if (entry.category === 'business') {
    if (/calculator|tracker|pipeline|metric|funnel/i.test(entry.slug)) {
      renderSpreadsheet(ctx, entry, { headers: ['Item', 'Value', 'Notes'] });
    } else renderBusinessDoc(ctx, entry);
  }
  else if (entry.category === 'education') {
    if (entry.slug === 'gradebook' || entry.slug === 'attendance-tracker' || entry.slug === 'iep-tracker') {
      renderSpreadsheet(ctx, entry, { headers: ['Student', 'Score 1', 'Score 2', 'Score 3', 'Avg'] });
    } else renderEducation(ctx, entry);
  }
  else if (entry.category === 'email') renderEmailSig(ctx, entry);
  else renderBusinessDoc(ctx, entry);

  return canvas.encode('png');
}

// ---- Driver ----

let count = 0;
for (const entry of entries) {
  const buf = await render(entry);
  fs.writeFileSync(path.join(outDir, `${entry.slug}.png`), buf);
  count++;
  if (count % 20 === 0) console.log(`Rendered ${count}/${entries.length}`);
}
console.log(`Done. ${count} previews in public/previews/`);
