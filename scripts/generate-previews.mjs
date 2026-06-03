// Generates Etsy-style preview mockups for every template in the catalog.
// One PNG per template at public/previews/<slug>.png.
//
// Original synthetic mockups — generic placeholder names, generic professional
// copy, standard layouts. Not copies of any specific commercial template.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outDir = path.join(root, 'public', 'previews');
fs.mkdirSync(outDir, { recursive: true });

const W = 800;
const H = 1035;
const BRAND = '#f59e0b';
const INK = '#1f2937';
const MUTED = '#6b7280';
const LINE = '#e5e7eb';
const PAPER = '#ffffff';
const SOFT = '#f9fafb';

// ---- Catalog ----
const catalogSrc = fs.readFileSync(path.join(root, 'src/config/templates.ts'), 'utf8');
const entryRe = /t\('([^']+)',\s*'([^']+)',\s*'([^']+)',[\s\S]*?,\s*'(resume|bookkeeping|invoice|planner|letters|business|education|email|checklist|finance|wedding|health|kids|certificate|social)',/g;
const entries = [];
for (const m of catalogSrc.matchAll(entryRe)) {
  entries.push({ slug: m[1], title: m[2], description: m[3], category: m[4] });
}
console.log(`Found ${entries.length} templates to preview.`);

// ---- Slug-stable random pool selectors ----
function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
const pickFor = (slug, pool) => pool[hash(slug) % pool.length];

const FIRST_NAMES = ['Morgan', 'Alex', 'Jordan', 'Casey', 'Riley', 'Taylor', 'Cameron', 'Avery', 'Quinn', 'Drew', 'Sage', 'Reese', 'Logan', 'Skyler', 'Rowan', 'Emerson', 'Hayden', 'Marlowe', 'Devon', 'Indigo', 'Parker', 'Ellis', 'Harper', 'Jamie', 'Kai'];
const LAST_NAMES = ['Bell', 'Rivera', 'Prescott', 'Morgan', 'Chen', 'Brooks', 'Reed', 'Hayes', 'Sullivan', 'Bennett', 'Whitman', 'Caldwell', 'Pierce', 'Hughes', 'Fitzgerald', 'Park', 'Walsh', 'Stone', 'Whitaker', 'Larsson', 'Vance', 'Hollis', 'Marsh', 'Castillo', 'Okonkwo'];
const CITIES = ['New York, NY', 'San Francisco, CA', 'Chicago, IL', 'Austin, TX', 'Seattle, WA', 'Boston, MA', 'Denver, CO', 'Atlanta, GA', 'Portland, OR', 'Miami, FL', 'Minneapolis, MN', 'Nashville, TN'];

function nameFor(slug) {
  const f = pickFor(slug + 'F', FIRST_NAMES);
  const l = pickFor(slug + 'L', LAST_NAMES);
  return { first: f, last: l, full: `${f} ${l}`, initials: f[0] + l[0] };
}
function cityFor(slug) { return pickFor(slug, CITIES); }
function phoneFor(slug) {
  const h = hash(slug);
  const a = 200 + (h % 700);
  const b = 100 + ((h >> 4) % 900);
  return `(${a}) 555-${String(b).padStart(4, '0')}`;
}
function emailFor(name) {
  return `${name.first.toLowerCase()}.${name.last.toLowerCase()}@example.com`;
}

// ---- Drawing helpers ----
function paper(ctx) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
}
function watermark(ctx) {
  ctx.fillStyle = '#9ca3af';
  ctx.font = '13px Inter, Arial, sans-serif';
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
  let font = opts.size || 14;
  let weight = opts.weight || '';
  let family = opts.serif ? 'Georgia, Times, serif' : 'Inter, Helvetica, Arial, sans-serif';
  if (opts.italic) family = `italic ${family}`;
  ctx.font = `${weight} ${font}px ${family}`.trim();
  if (opts.align) ctx.textAlign = opts.align;
  ctx.fillText(str, x, y);
  ctx.textAlign = 'left';
}
function wrappedText(ctx, str, x, y, maxW, lineH, opts = {}) {
  ctx.fillStyle = opts.color || INK;
  ctx.font = `${opts.weight || ''} ${opts.size || 13}px ${opts.serif ? 'Georgia, serif' : 'Inter, Helvetica, Arial, sans-serif'}`.trim();
  const words = str.split(' ');
  let line = '';
  let curY = y;
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, curY);
      line = w;
      curY += lineH;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, curY);
  return curY;
}
function avatarCircle(ctx, cx, cy, r, initials, palette) {
  // Gradient fill
  const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  grad.addColorStop(0, palette[0]);
  grad.addColorStop(1, palette[1]);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // Soft silhouette inside (shoulders + head outline)
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  // Head
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.18, r * 0.36, 0, Math.PI * 2);
  ctx.fill();
  // Shoulders (rounded rect via arc)
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.55, r * 0.72, r * 0.42, 0, Math.PI, 0, true);
  ctx.fill();
  // White ring
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  // Initials in corner if given
  if (initials) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 12px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(initials, cx, cy + r + 24);
    ctx.textAlign = 'left';
  }
}
function chip(ctx, x, y, label, bg, fg) {
  ctx.font = '12px Inter, Arial, sans-serif';
  const w = ctx.measureText(label).width + 20;
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(x, y, w, 22, 11);
  ctx.fill();
  text(ctx, label, x + 10, y + 15, { size: 12, color: fg });
  return w + 8;
}
function placeholderLine(ctx, x, y, len, h = 6, color = '#dadde2') {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, len, h);
}

// ---- Sample content pools ----
const TITLES = {
  default: ['Marketing Manager', 'Senior Product Designer', 'Software Engineer', 'Operations Lead', 'Account Director', 'Project Manager'],
  executive: ['Chief Marketing Officer', 'VP of Engineering', 'Director of Operations', 'SVP, Sales'],
  tech: ['Senior Software Engineer', 'Staff Engineer', 'Engineering Manager', 'Tech Lead'],
  creative: ['Senior Brand Designer', 'Creative Director', 'Lead Visual Designer'],
  data: ['Senior Data Analyst', 'Analytics Engineer', 'BI Lead'],
  sales: ['Senior Account Executive', 'Sales Manager', 'Director of Sales'],
  marketing: ['Marketing Director', 'Growth Marketing Lead', 'Brand Strategist'],
  finance: ['Senior Accountant', 'Finance Manager', 'Controller'],
  nurse: ['Registered Nurse, BSN', 'ICU Nurse Manager', 'Charge Nurse'],
  teacher: ['Middle School Teacher', 'Elementary Educator', 'High School Math Teacher'],
  customer: ['Customer Success Lead', 'Senior Support Specialist'],
  retail: ['Store Manager', 'Retail Operations Lead'],
  hospitality: ['Hotel Operations Manager', 'Front Office Lead'],
  manager: ['Operations Manager', 'Engineering Manager', 'Senior Manager'],
  pm: ['Senior Project Manager', 'Program Manager', 'Technical PM'],
  trades: ['Master Electrician', 'Senior HVAC Technician', 'Lead Auto Technician'],
  military: ['Captain, U.S. Army (Veteran)', 'Operations Specialist (Veteran)'],
  student: ['Computer Science Student', 'Marketing Intern Candidate'],
  federal: ['Senior Program Analyst, GS-13', 'Policy Advisor, GS-14'],
  intl: ['International Operations Lead', 'European Account Director'],
};

const SUMMARIES = [
  'Results-driven professional with 8+ years of experience leading cross-functional teams and delivering measurable business outcomes. Combines analytical rigor with strong communication to translate strategy into action.',
  'Versatile leader who turns ambiguous problems into shipped products and scalable processes. Known for clear writing, fast prototyping, and bringing the whole team along.',
  'Operator with a track record of growing teams, owning P&L, and making fast decisions with limited data. Comfortable on both the strategy side and rolling up sleeves.',
];
const BULLETS = [
  'Led cross-functional team of 12 to launch a new product line, growing revenue by $4.2M in the first 18 months.',
  'Reduced operational costs by 30% by redesigning vendor selection process and renegotiating four major contracts.',
  'Built and shipped customer onboarding flow used by 40,000+ new accounts per quarter, lifting activation by 22%.',
  'Mentored five direct reports through promotion cycles; team retention reached 96% across 24 months.',
  'Owned end-to-end roadmap, prioritization, and stakeholder communication for a $2M annual budget portfolio.',
  'Established weekly executive reporting cadence; reduced data turnaround time from 5 days to 1 day.',
  'Partnered with engineering to ship a self-serve dashboard used by 800+ internal users, replacing manual reports.',
  'Identified upsell opportunity worth $1.1M ARR by analyzing usage data across the top 50 enterprise customers.',
];

const SKILLS_BY_TYPE = {
  default: ['Strategy', 'Operations', 'Stakeholder Mgmt', 'Analytics', 'Cross-functional', 'Leadership', 'Process Design'],
  tech: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'CI/CD', 'System Design'],
  data: ['SQL', 'Python', 'Looker', 'dbt', 'Snowflake', 'A/B Testing', 'Dashboards', 'Stats'],
  marketing: ['SEO', 'Paid Social', 'Lifecycle', 'Brand', 'Content', 'CRO', 'GA4', 'HubSpot'],
  creative: ['Figma', 'Brand Systems', 'Illustration', 'Type', 'Motion', 'Photography', 'Art Direction'],
  sales: ['Discovery', 'Forecasting', 'Salesforce', 'Closing', 'Pipeline Mgmt', 'Outbound', 'Negotiation'],
  finance: ['QuickBooks', 'NetSuite', 'GAAP', 'Audit', 'Excel', 'Tax', 'Forecasting', 'Reporting'],
  nurse: ['IV Therapy', 'Triage', 'Critical Care', 'EMR (Epic)', 'BLS/ACLS', 'Patient Education'],
  trades: ['Diagnostics', 'Safety Compliance', 'OSHA-30', 'Blueprints', 'Code Inspection'],
};

function titleForResume(slug) {
  if (/executive/.test(slug)) return pickFor(slug, TITLES.executive);
  if (/tech|engineer/.test(slug)) return pickFor(slug, TITLES.tech);
  if (/creative/.test(slug)) return pickFor(slug, TITLES.creative);
  if (/data/.test(slug)) return pickFor(slug, TITLES.data);
  if (/sales/.test(slug)) return pickFor(slug, TITLES.sales);
  if (/marketing/.test(slug)) return pickFor(slug, TITLES.marketing);
  if (/finance|account/.test(slug)) return pickFor(slug, TITLES.finance);
  if (/nurse|health/.test(slug)) return pickFor(slug, TITLES.nurse);
  if (/teacher/.test(slug)) return pickFor(slug, TITLES.teacher);
  if (/customer/.test(slug)) return pickFor(slug, TITLES.customer);
  if (/retail/.test(slug)) return pickFor(slug, TITLES.retail);
  if (/hospitality/.test(slug)) return pickFor(slug, TITLES.hospitality);
  if (/manager$|^manager/.test(slug)) return pickFor(slug, TITLES.manager);
  if (/project-manager/.test(slug)) return pickFor(slug, TITLES.pm);
  if (/trades|mechanic/.test(slug)) return pickFor(slug, TITLES.trades);
  if (/military/.test(slug)) return pickFor(slug, TITLES.military);
  if (/student|internship/.test(slug)) return pickFor(slug, TITLES.student);
  if (/federal/.test(slug)) return pickFor(slug, TITLES.federal);
  if (/photo/.test(slug)) return pickFor(slug, TITLES.intl);
  return pickFor(slug, TITLES.default);
}

function skillsForResume(slug) {
  if (/tech|engineer/.test(slug)) return SKILLS_BY_TYPE.tech;
  if (/data/.test(slug)) return SKILLS_BY_TYPE.data;
  if (/marketing/.test(slug)) return SKILLS_BY_TYPE.marketing;
  if (/creative/.test(slug)) return SKILLS_BY_TYPE.creative;
  if (/sales/.test(slug)) return SKILLS_BY_TYPE.sales;
  if (/finance|account/.test(slug)) return SKILLS_BY_TYPE.finance;
  if (/nurse|health/.test(slug)) return SKILLS_BY_TYPE.nurse;
  if (/trades|mechanic/.test(slug)) return SKILLS_BY_TYPE.trades;
  return SKILLS_BY_TYPE.default;
}

const PALETTES = [
  ['#fbbf24', '#d97706'], // amber
  ['#60a5fa', '#1d4ed8'], // blue
  ['#34d399', '#047857'], // green
  ['#f472b6', '#be185d'], // pink
  ['#a78bfa', '#5b21b6'], // purple
  ['#fb923c', '#c2410c'], // orange
  ['#94a3b8', '#334155'], // slate
];
function paletteFor(slug) { return pickFor(slug, PALETTES); }

// ---- Resume layout variants ----

function resumeClassicCentered(ctx, entry) {
  paper(ctx);
  const name = nameFor(entry.slug);
  const title = titleForResume(entry.slug);
  const city = cityFor(entry.slug);
  const phone = phoneFor(entry.slug);
  const email = emailFor(name);

  // Top header
  text(ctx, name.full.toUpperCase(), W / 2, 96, { size: 38, weight: '300', serif: true, align: 'center' });
  text(ctx, title.toUpperCase(), W / 2, 124, { size: 14, color: BRAND, weight: '600', align: 'center' });
  rule(ctx, 240, 144, W - 240, INK, 1);
  text(ctx, `${city}  ·  ${phone}  ·  ${email}`, W / 2, 168, { size: 12, color: MUTED, align: 'center' });

  // Summary
  text(ctx, 'SUMMARY', 60, 220, { size: 13, weight: '700', color: INK });
  rule(ctx, 60, 230, 200, INK);
  let y = wrappedText(ctx, pickFor(entry.slug + 'S', SUMMARIES), 60, 256, W - 120, 18, { size: 13, color: MUTED });

  // Experience
  y += 36;
  text(ctx, 'PROFESSIONAL EXPERIENCE', 60, y, { size: 13, weight: '700' });
  rule(ctx, 60, y + 10, 320, INK);
  y += 36;
  for (let i = 0; i < 2; i++) {
    const company = ['Northwind Studio', 'Hartford & Co.', 'Vantage Labs', 'Meridian Group', 'Riverstone Partners'][hash(entry.slug + i) % 5];
    text(ctx, title, 60, y, { size: 14, weight: '700' });
    text(ctx, ` — ${company}`, 60 + ctx.measureText(title).width, y, { size: 14, color: MUTED });
    text(ctx, i === 0 ? 'Jan 2022 – Present' : 'Jun 2018 – Dec 2021', W - 60, y, { size: 12, color: MUTED, align: 'right' });
    y += 20;
    text(ctx, `${city}`, 60, y, { size: 12, color: MUTED, italic: true });
    y += 18;
    const bullets = [pickFor(entry.slug + i + 'a', BULLETS), pickFor(entry.slug + i + 'b', BULLETS), pickFor(entry.slug + i + 'c', BULLETS)];
    for (const b of bullets) {
      ctx.fillStyle = INK;
      ctx.font = '600 13px Inter, Arial, sans-serif';
      ctx.fillText('·', 64, y);
      y = wrappedText(ctx, b, 78, y, W - 138, 16, { size: 12, color: '#374151' }) + 22;
    }
    y += 6;
  }

  // Education
  text(ctx, 'EDUCATION', 60, y, { size: 13, weight: '700' });
  rule(ctx, 60, y + 10, 200, INK);
  y += 36;
  text(ctx, 'B.S. — University of California, Berkeley', 60, y, { size: 13, weight: '700' });
  text(ctx, 'Graduated May 2018', W - 60, y, { size: 12, color: MUTED, align: 'right' });

  // Skills
  y += 36;
  text(ctx, 'SKILLS', 60, y, { size: 13, weight: '700' });
  rule(ctx, 60, y + 10, 140, INK);
  y += 28;
  let sx = 60;
  for (const s of skillsForResume(entry.slug).slice(0, 6)) {
    sx += chip(ctx, sx, y, s, '#fef3c7', '#92400e');
  }

  watermark(ctx);
}

function resumeTwoColumnSidebar(ctx, entry) {
  paper(ctx);
  const name = nameFor(entry.slug);
  const title = titleForResume(entry.slug);
  const city = cityFor(entry.slug);
  const phone = phoneFor(entry.slug);
  const email = emailFor(name);
  const pal = paletteFor(entry.slug);

  // Sidebar
  const sbW = 260;
  box(ctx, 0, 0, sbW, H, '#1f2937');

  // Avatar in sidebar
  avatarCircle(ctx, sbW / 2, 130, 70, null, pal);

  // Name + title
  text(ctx, name.full.toUpperCase(), sbW / 2, 240, { size: 22, weight: '700', color: '#ffffff', align: 'center' });
  text(ctx, title, sbW / 2, 266, { size: 13, color: pal[0], align: 'center' });

  // Sidebar sections
  let sy = 320;
  text(ctx, 'CONTACT', 30, sy, { size: 12, weight: '700', color: pal[0] });
  sy += 28;
  ['📍 ' + city, '📞 ' + phone, '✉ ' + email, '🔗 linkedin.com/in/profile'].forEach((line) => {
    text(ctx, line, 30, sy, { size: 11, color: '#d1d5db' });
    sy += 22;
  });

  sy += 20;
  text(ctx, 'SKILLS', 30, sy, { size: 12, weight: '700', color: pal[0] });
  sy += 28;
  for (const s of skillsForResume(entry.slug).slice(0, 6)) {
    text(ctx, s, 30, sy, { size: 12, color: '#e5e7eb' });
    box(ctx, 30, sy + 8, 200, 4, '#374151');
    box(ctx, 30, sy + 8, 90 + (hash(entry.slug + s) % 100), 4, pal[0]);
    sy += 26;
  }

  sy += 16;
  text(ctx, 'EDUCATION', 30, sy, { size: 12, weight: '700', color: pal[0] });
  sy += 26;
  text(ctx, 'B.S. Marketing', 30, sy, { size: 12, weight: '600', color: '#ffffff' });
  text(ctx, 'UC Berkeley · 2018', 30, sy + 18, { size: 11, color: '#9ca3af' });

  // Main column
  let y = 80;
  text(ctx, 'PROFILE', sbW + 40, y, { size: 14, weight: '700', color: pal[1] });
  rule(ctx, sbW + 40, y + 10, sbW + 200, pal[1]);
  y = wrappedText(ctx, pickFor(entry.slug + 'S', SUMMARIES), sbW + 40, y + 36, W - sbW - 80, 18, { size: 12, color: '#374151' }) + 40;

  text(ctx, 'EXPERIENCE', sbW + 40, y, { size: 14, weight: '700', color: pal[1] });
  rule(ctx, sbW + 40, y + 10, sbW + 200, pal[1]);
  y += 36;
  for (let i = 0; i < 2; i++) {
    const company = ['Northwind Studio', 'Hartford & Co.', 'Vantage Labs', 'Meridian Group'][hash(entry.slug + i) % 4];
    text(ctx, title, sbW + 40, y, { size: 13, weight: '700' });
    text(ctx, company + ' · ' + (i === 0 ? '2022 – Present' : '2018 – 2021'), sbW + 40, y + 18, { size: 11, color: MUTED });
    y += 40;
    for (let b = 0; b < 3; b++) {
      ctx.fillStyle = pal[1];
      ctx.fillRect(sbW + 40, y - 8, 3, 12);
      y = wrappedText(ctx, pickFor(entry.slug + i + 'b' + b, BULLETS), sbW + 56, y, W - sbW - 96, 16, { size: 11, color: '#374151' }) + 18;
    }
    y += 14;
  }

  watermark(ctx);
}

function resumeWithPhoto(ctx, entry) {
  paper(ctx);
  const name = nameFor(entry.slug);
  const title = titleForResume(entry.slug);
  const city = cityFor(entry.slug);
  const phone = phoneFor(entry.slug);
  const email = emailFor(name);
  const pal = paletteFor(entry.slug);

  // Header band with photo
  box(ctx, 0, 0, W, 220, SOFT);
  avatarCircle(ctx, 130, 110, 78, null, pal);

  text(ctx, name.full.toUpperCase(), 240, 90, { size: 32, weight: '700' });
  text(ctx, title, 240, 124, { size: 16, color: pal[1], weight: '600' });
  text(ctx, `${city}  ·  ${phone}`, 240, 152, { size: 12, color: MUTED });
  text(ctx, email + '  ·  linkedin.com/in/profile', 240, 172, { size: 12, color: MUTED });
  text(ctx, 'Nationality: U.S.  ·  Languages: English, Spanish', 240, 192, { size: 12, color: MUTED });

  rule(ctx, 0, 220, W, pal[0], 4);

  // Body
  let y = 270;
  text(ctx, 'PROFILE', 60, y, { size: 14, weight: '700', color: pal[1] });
  y = wrappedText(ctx, pickFor(entry.slug + 'S', SUMMARIES), 60, y + 24, W - 120, 18, { size: 12, color: '#374151' }) + 40;

  text(ctx, 'EXPERIENCE', 60, y, { size: 14, weight: '700', color: pal[1] });
  rule(ctx, 60, y + 10, 240, pal[1]);
  y += 36;
  for (let i = 0; i < 2; i++) {
    const company = ['Hartford & Co.', 'Meridian Group', 'Vantage Labs', 'Northwind Studio'][hash(entry.slug + i) % 4];
    text(ctx, `${title}  ·  ${company}`, 60, y, { size: 13, weight: '700' });
    text(ctx, i === 0 ? '2022 – Present' : '2018 – 2021', W - 60, y, { size: 12, color: MUTED, align: 'right' });
    y += 22;
    for (let b = 0; b < 2; b++) {
      ctx.fillStyle = pal[1];
      ctx.fillRect(60, y - 8, 3, 12);
      y = wrappedText(ctx, pickFor(entry.slug + i + 'p' + b, BULLETS), 76, y, W - 136, 16, { size: 12, color: '#374151' }) + 18;
    }
    y += 14;
  }

  text(ctx, 'EDUCATION', 60, y, { size: 14, weight: '700', color: pal[1] });
  rule(ctx, 60, y + 10, 240, pal[1]);
  y += 36;
  text(ctx, 'B.A. International Business · London School of Economics', 60, y, { size: 13, weight: '600' });
  text(ctx, '2014 – 2018', W - 60, y, { size: 12, color: MUTED, align: 'right' });

  watermark(ctx);
}

function resumeModernBlock(ctx, entry) {
  paper(ctx);
  const name = nameFor(entry.slug);
  const title = titleForResume(entry.slug);
  const city = cityFor(entry.slug);
  const phone = phoneFor(entry.slug);
  const email = emailFor(name);
  const pal = paletteFor(entry.slug);

  // Big color block header
  box(ctx, 0, 0, W, 200, pal[1]);
  text(ctx, name.first.toUpperCase(), 60, 90, { size: 56, weight: '300', color: '#ffffff' });
  text(ctx, name.last.toUpperCase(), 60, 152, { size: 56, weight: '800', color: '#ffffff' });
  text(ctx, title.toUpperCase(), 60, 180, { size: 12, color: pal[0], weight: '700' });

  // Contact strip
  box(ctx, 0, 200, W, 50, pal[0]);
  text(ctx, `${phone}  ·  ${email}  ·  ${city}`, W / 2, 230, { size: 13, color: '#ffffff', weight: '600', align: 'center' });

  let y = 290;
  text(ctx, 'ABOUT ME', 60, y, { size: 14, weight: '800', color: pal[1] });
  y = wrappedText(ctx, pickFor(entry.slug + 'S', SUMMARIES), 60, y + 26, W - 120, 18, { size: 12 }) + 36;

  text(ctx, 'EXPERIENCE', 60, y, { size: 14, weight: '800', color: pal[1] });
  y += 30;
  for (let i = 0; i < 2; i++) {
    const company = ['Vantage Labs', 'Hartford & Co.', 'Northwind Studio'][hash(entry.slug + i) % 3];
    text(ctx, title, 60, y, { size: 14, weight: '700' });
    text(ctx, company + '  ·  ' + (i === 0 ? '2022 – Now' : '2018 – 2021'), 60, y + 18, { size: 12, color: MUTED });
    y += 42;
    for (let b = 0; b < 2; b++) {
      ctx.fillStyle = pal[0];
      ctx.fillRect(60, y - 8, 6, 6);
      y = wrappedText(ctx, pickFor(entry.slug + i + 'mb' + b, BULLETS), 76, y, W - 136, 16, { size: 12, color: '#374151' }) + 20;
    }
    y += 10;
  }

  // Skills row
  text(ctx, 'SKILLS', 60, y, { size: 14, weight: '800', color: pal[1] });
  y += 24;
  let sx = 60;
  for (const s of skillsForResume(entry.slug).slice(0, 7)) {
    sx += chip(ctx, sx, y, s, pal[1], '#ffffff');
  }

  watermark(ctx);
}

function resumeAtsPlain(ctx, entry) {
  paper(ctx);
  const name = nameFor(entry.slug);
  const title = titleForResume(entry.slug);
  const city = cityFor(entry.slug);
  const phone = phoneFor(entry.slug);
  const email = emailFor(name);

  text(ctx, name.full, W / 2, 90, { size: 30, weight: '700', align: 'center' });
  text(ctx, `${city} | ${phone} | ${email} | linkedin.com/in/profile`, W / 2, 116, { size: 12, color: MUTED, align: 'center' });
  rule(ctx, 60, 138, W - 60, INK, 1);

  let y = 170;
  text(ctx, 'PROFESSIONAL SUMMARY', 60, y, { size: 14, weight: '700' });
  y = wrappedText(ctx, pickFor(entry.slug + 'S', SUMMARIES), 60, y + 24, W - 120, 18, { size: 13, color: '#374151' }) + 36;

  text(ctx, 'EXPERIENCE', 60, y, { size: 14, weight: '700' });
  y += 26;
  for (let i = 0; i < 2; i++) {
    const company = ['Hartford & Co.', 'Meridian Group', 'Northwind Studio'][hash(entry.slug + i) % 3];
    text(ctx, `${title}, ${company}`, 60, y, { size: 13, weight: '700' });
    text(ctx, i === 0 ? 'January 2022 – Present' : 'June 2018 – December 2021', W - 60, y, { size: 12, color: MUTED, align: 'right' });
    y += 20;
    text(ctx, city, 60, y, { size: 12, color: MUTED });
    y += 18;
    for (let b = 0; b < 3; b++) {
      ctx.fillStyle = INK;
      ctx.font = '13px Inter';
      ctx.fillText('•', 64, y);
      y = wrappedText(ctx, pickFor(entry.slug + i + 'a' + b, BULLETS), 80, y, W - 140, 16, { size: 12, color: '#374151' }) + 18;
    }
    y += 8;
  }

  text(ctx, 'EDUCATION', 60, y, { size: 14, weight: '700' });
  y += 24;
  text(ctx, 'Bachelor of Science, Business Administration', 60, y, { size: 13, weight: '600' });
  text(ctx, '2014 – 2018', W - 60, y, { size: 12, color: MUTED, align: 'right' });
  y += 18;
  text(ctx, 'University of California, Berkeley', 60, y, { size: 12, color: MUTED });

  y += 36;
  text(ctx, 'SKILLS', 60, y, { size: 14, weight: '700' });
  y += 22;
  text(ctx, skillsForResume(entry.slug).slice(0, 7).join(', '), 60, y, { size: 12, color: '#374151' });

  watermark(ctx);
}

function resumeTechSplit(ctx, entry) {
  paper(ctx);
  const name = nameFor(entry.slug);
  const title = titleForResume(entry.slug);
  const phone = phoneFor(entry.slug);
  const email = emailFor(name);
  const pal = paletteFor(entry.slug);

  // Header
  text(ctx, name.full, 60, 80, { size: 30, weight: '700' });
  text(ctx, title, 60, 108, { size: 14, color: pal[1] });
  text(ctx, `github.com/${name.first.toLowerCase()} · linkedin.com/in/profile · ${email} · ${phone}`, 60, 134, { size: 11, color: MUTED });
  rule(ctx, 60, 150, W - 60, pal[1], 2);

  let y = 180;
  // Tech stack callout
  box(ctx, 60, y, W - 120, 90, '#f8fafc', '#e2e8f0');
  text(ctx, 'TECH STACK', 80, y + 26, { size: 12, weight: '700', color: pal[1] });
  let cx = 80;
  for (const s of (SKILLS_BY_TYPE.tech).slice(0, 8)) {
    const w = ctx.measureText(s).width + 18;
    box(ctx, cx, y + 42, w, 24, '#1e293b');
    text(ctx, s, cx + 9, y + 58, { size: 12, color: pal[0] });
    cx += w + 8;
  }
  y += 116;

  text(ctx, 'EXPERIENCE', 60, y, { size: 14, weight: '700' });
  rule(ctx, 60, y + 8, 180);
  y += 32;
  for (let i = 0; i < 2; i++) {
    const company = ['Stripe', 'Linear', 'Vercel', 'Notion'][hash(entry.slug + i) % 4];
    text(ctx, `${title} · ${company}`, 60, y, { size: 13, weight: '700' });
    text(ctx, i === 0 ? '2022 — Present' : '2019 — 2021', W - 60, y, { size: 11, color: MUTED, align: 'right' });
    y += 22;
    for (let b = 0; b < 2; b++) {
      ctx.fillStyle = pal[1];
      ctx.fillRect(60, y - 8, 3, 12);
      y = wrappedText(ctx, pickFor(entry.slug + i + 't' + b, BULLETS), 76, y, W - 136, 16, { size: 12, color: '#374151' }) + 20;
    }
    y += 12;
  }

  text(ctx, 'PROJECTS', 60, y, { size: 14, weight: '700' });
  rule(ctx, 60, y + 8, 140);
  y += 28;
  ['open-source-cli — TypeScript utility downloaded 12k+ times', 'realtime-dashboard — React + WebSocket monitoring tool'].forEach((p) => {
    ctx.fillStyle = pal[0];
    ctx.fillRect(60, y - 8, 3, 12);
    text(ctx, p, 76, y, { size: 12, color: '#374151' });
    y += 22;
  });

  watermark(ctx);
}

// ---- Resume layout dispatcher ----
function pickResumeLayout(slug) {
  if (/photo|federal/.test(slug)) return resumeWithPhoto;
  if (/two-column|sidebar/.test(slug)) return resumeTwoColumnSidebar;
  if (/modern|creative|sales|marketing|hospitality|customer/.test(slug)) return resumeModernBlock;
  if (/ats-friendly|minimalist|nurse|teacher|finance|account|retail|military|career-change/.test(slug)) return resumeAtsPlain;
  if (/tech-engineer|data-analyst/.test(slug)) return resumeTechSplit;
  if (/executive|manager|project|trades|mechanic/.test(slug)) return resumeClassicCentered;
  if (/student|intern/.test(slug)) return resumeAtsPlain;
  if (/cover/.test(slug)) return renderCoverLetter;
  return resumeClassicCentered;
}

function renderCoverLetter(ctx, entry) {
  paper(ctx);
  const name = nameFor(entry.slug);
  const city = cityFor(entry.slug);

  text(ctx, name.full, 60, 90, { size: 26, weight: '700', serif: true });
  text(ctx, city + '  ·  ' + phoneFor(entry.slug) + '  ·  ' + emailFor(name), 60, 116, { size: 12, color: MUTED });
  rule(ctx, 60, 138, W - 60, BRAND, 2);

  let y = 180;
  text(ctx, 'May 14, 2026', 60, y, { size: 12, color: MUTED });
  y += 36;
  text(ctx, 'Hiring Team', 60, y, { size: 13, weight: '600' });
  text(ctx, 'Hartford & Co.', 60, y + 18, { size: 12, color: MUTED });
  text(ctx, 'San Francisco, CA', 60, y + 36, { size: 12, color: MUTED });
  y += 80;

  text(ctx, 'Dear Hiring Team,', 60, y, { size: 13 });
  y += 28;
  for (let p = 0; p < 3; p++) {
    y = wrappedText(ctx, pickFor(entry.slug + 'p' + p, SUMMARIES) + ' ' + pickFor(entry.slug + 'q' + p, BULLETS), 60, y, W - 120, 18, { size: 13, color: '#374151' }) + 28;
  }
  text(ctx, 'Sincerely,', 60, y, { size: 13 });
  y += 60;
  text(ctx, name.full, 60, y, { size: 16, serif: true, weight: '600' });

  watermark(ctx);
}

// ---- Non-resume renderers (lightly polished) ----

function renderSpreadsheet(ctx, entry, opts = {}) {
  paper(ctx);
  box(ctx, 0, 0, W, 60, BRAND);
  text(ctx, entry.title, 32, 38, { size: 20, color: '#ffffff', weight: '600' });

  const headers = opts.headers || ['Date', 'Description', 'Category', 'Type', 'Amount'];
  const sampleRows = opts.sampleRows || [
    ['01/02/26', 'Client invoice #1042', 'Sales', 'Income', '$4,500.00'],
    ['01/03/26', 'Office supplies', 'Office', 'Expense', '$128.40'],
    ['01/05/26', 'Software subscription', 'Software', 'Expense', '$49.00'],
    ['01/08/26', 'Consulting retainer', 'Services', 'Income', '$2,400.00'],
    ['01/10/26', 'Coffee with client', 'Meals', 'Expense', '$32.18'],
    ['01/12/26', 'Travel - flight', 'Travel', 'Expense', '$418.20'],
    ['01/15/26', 'Project milestone', 'Sales', 'Income', '$8,000.00'],
    ['01/18/26', 'Quarterly insurance', 'Insurance', 'Expense', '$612.00'],
  ];
  const colW = (W - 60) / headers.length;

  box(ctx, 30, 100, W - 60, 36, '#fff7ed');
  headers.forEach((h, i) => text(ctx, h, 30 + i * colW + 14, 124, { size: 13, weight: '700', color: '#92400e' }));
  rule(ctx, 30, 136, W - 30, '#fed7aa', 1);

  sampleRows.forEach((row, r) => {
    const y = 136 + r * 32;
    if (r % 2 === 1) box(ctx, 30, y, W - 60, 32, SOFT);
    row.forEach((cell, i) => {
      const isAmount = i === headers.length - 1 && cell.startsWith('$');
      text(ctx, cell, 30 + i * colW + 14, y + 22, { size: 12, color: isAmount ? (row[3] === 'Income' ? '#047857' : '#b91c1c') : INK, weight: isAmount ? '600' : '' });
    });
    rule(ctx, 30, y + 32, W - 30, '#f1f3f5', 1);
  });

  // Empty rows
  for (let r = sampleRows.length; r < 16; r++) {
    const y = 136 + r * 32;
    if (r % 2 === 1) box(ctx, 30, y, W - 60, 32, SOFT);
    rule(ctx, 30, y + 32, W - 30, '#f1f3f5', 1);
  }

  // Summary
  const sy = 720;
  box(ctx, 30, sy, W - 60, 200, '#fffbeb', '#fde68a');
  text(ctx, 'MONTHLY SUMMARY', 50, sy + 32, { size: 14, weight: '700', color: '#92400e' });
  [['Total income', '$14,900.00', '#047857'], ['Total expenses', '$1,239.78', '#b91c1c'], ['Net profit', '$13,660.22', INK]].forEach(([label, val, color], i) => {
    text(ctx, label, 50, sy + 72 + i * 32, { size: 14 });
    text(ctx, val, W - 50, sy + 72 + i * 32, { size: 14, weight: '700', color, align: 'right' });
  });

  text(ctx, 'FREE  ·  Auto-totals  ·  Excel + Google Sheets', W / 2, H - 18, { size: 13, color: MUTED, align: 'center' });
  watermark(ctx);
}

function renderInvoice(ctx, entry) {
  paper(ctx);
  const name = nameFor(entry.slug);

  text(ctx, 'INVOICE', 40, 70, { size: 38, weight: '800', color: BRAND });

  text(ctx, name.full + ' Design Studio', 40, 110, { size: 14, weight: '700' });
  ['123 Market Street', cityFor(entry.slug), emailFor(name)].forEach((line, i) => {
    text(ctx, line, 40, 132 + i * 18, { size: 12, color: MUTED });
  });

  const metaY = 110;
  [['Invoice #', `INV-${1000 + (hash(entry.slug) % 9000)}`], ['Date', 'May 14, 2026'], ['Due', 'Jun 13, 2026'], ['Terms', 'Net 30']].forEach(([label, val], i) => {
    text(ctx, label, W - 280, metaY + i * 24, { size: 12, weight: '700', color: MUTED });
    text(ctx, val, W - 40, metaY + i * 24, { size: 12, align: 'right', weight: '600' });
  });

  text(ctx, 'BILL TO', 40, 250, { size: 12, weight: '700', color: BRAND });
  text(ctx, 'Acme Corporation', 40, 274, { size: 14, weight: '700' });
  text(ctx, '500 Tech Park Dr', 40, 294, { size: 12, color: MUTED });
  text(ctx, 'San Jose, CA 95110', 40, 312, { size: 12, color: MUTED });

  box(ctx, 40, 380, W - 80, 40, BRAND);
  ['Description', 'Qty', 'Rate', 'Amount'].forEach((h, i) => {
    const xs = [60, 460, 560, 670];
    text(ctx, h, xs[i], 406, { size: 13, weight: '700', color: '#ffffff' });
  });

  const items = [
    ['Brand identity design — discovery & strategy', '1', '$2,400', '$2,400.00'],
    ['Logo & mark design — 3 directions', '1', '$1,800', '$1,800.00'],
    ['Type system & color palette', '1', '$900', '$900.00'],
    ['Stationery design (business cards, letterhead)', '1', '$600', '$600.00'],
    ['Brand guidelines PDF (20 pages)', '1', '$750', '$750.00'],
    ['Project management & revisions', '8 hrs', '$95/hr', '$760.00'],
  ];

  items.forEach((row, r) => {
    const y = 420 + r * 42;
    if (r % 2 === 1) box(ctx, 40, y, W - 80, 42, SOFT);
    const xs = [60, 460, 560, 670];
    row.forEach((cell, i) => text(ctx, cell, xs[i], y + 26, { size: 12, weight: i === 3 ? '600' : '', color: i === 3 ? INK : '#374151' }));
    rule(ctx, 40, y + 42, W - 40, '#e5e7eb', 1);
  });

  const ty = 720;
  text(ctx, 'Subtotal', 540, ty, { size: 13, color: MUTED });
  text(ctx, '$7,210.00', W - 40, ty, { size: 13, align: 'right' });
  text(ctx, 'Sales tax (8.5%)', 540, ty + 24, { size: 13, color: MUTED });
  text(ctx, '$612.85', W - 40, ty + 24, { size: 13, align: 'right' });
  rule(ctx, 540, ty + 44, W - 40);
  text(ctx, 'TOTAL DUE', 540, ty + 72, { size: 15, weight: '800' });
  text(ctx, '$7,822.85', W - 40, ty + 72, { size: 18, weight: '800', align: 'right', color: BRAND });

  text(ctx, 'Thank you for your business. Payment terms: Net 30 days from invoice date.', 40, H - 60, { size: 12, color: MUTED });
  text(ctx, entry.title, W / 2, H - 30, { size: 14, weight: '700', align: 'center', color: BRAND });
  watermark(ctx);
}

function renderPlannerGrid(ctx, entry) {
  paper(ctx);
  box(ctx, 0, 0, W, 80, BRAND);
  text(ctx, entry.title, 36, 50, { size: 24, weight: '700', color: '#ffffff' });

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const colW = (W - 60) / 7;
  days.forEach((d, i) => text(ctx, d, 30 + i * colW + colW / 2, 122, { size: 13, weight: '700', color: '#92400e', align: 'center' }));
  rule(ctx, 30, 134, W - 30, BRAND, 2);

  const hours = ['7 AM', '8', '9', '10', '11', '12 PM', '1', '2', '3', '4', '5', '6', '7'];
  const sampleEvents = [
    [0, 1, 'Standup', '#fef3c7', '#92400e'],
    [1, 4, 'Client call', '#dbeafe', '#1e3a8a'],
    [2, 7, 'Lunch w/ Casey', '#dcfce7', '#14532d'],
    [3, 2, 'Deep work', '#fef3c7', '#92400e'],
    [4, 5, 'Review session', '#fce7f3', '#831843'],
    [5, 9, 'Yoga', '#dcfce7', '#14532d'],
    [6, 10, 'Family time', '#fae8ff', '#581c87'],
  ];

  for (let r = 0; r < hours.length; r++) {
    const y = 154 + r * 52;
    text(ctx, hours[r], 30, y + 28, { size: 11, color: MUTED });
    rule(ctx, 70, y, W - 30, '#f3f4f6', 1);
  }
  sampleEvents.forEach(([dayIdx, hourIdx, label, bg, fg]) => {
    const cx = 80 + dayIdx * colW;
    const cy = 154 + hourIdx * 52 + 8;
    box(ctx, cx, cy, colW - 12, 36, bg, fg);
    text(ctx, label, cx + 10, cy + 22, { size: 11, color: fg, weight: '600' });
  });

  text(ctx, 'FREE printable  ·  Letter + A4  ·  Time blocks + priorities', W / 2, H - 18, { size: 13, color: MUTED, align: 'center' });
  watermark(ctx);
}

function renderLetter(ctx, entry) {
  paper(ctx);
  const name = nameFor(entry.slug);

  text(ctx, entry.title.toUpperCase(), W / 2, 130, { size: 22, weight: '800', align: 'center', serif: true });
  rule(ctx, 200, 156, W - 200, BRAND, 2);

  let y = 200;
  text(ctx, name.full, 60, y, { size: 14, weight: '600' });
  ['123 Market Street', cityFor(entry.slug), phoneFor(entry.slug), emailFor(name)].forEach((line, i) => {
    text(ctx, line, 60, y + 20 + i * 18, { size: 12, color: MUTED });
  });

  y = 340;
  text(ctx, 'Date: May 14, 2026', 60, y, { size: 12, color: MUTED });
  y += 28;
  text(ctx, 'Recipient Name', 60, y, { size: 13, weight: '600' });
  ['Recipient Title', 'Company Name', '500 Business Plaza', 'San Francisco, CA 94104'].forEach((line, i) => {
    text(ctx, line, 60, y + 18 + i * 18, { size: 12, color: MUTED });
  });

  y = 480;
  text(ctx, 'Dear Recipient,', 60, y, { size: 13 });
  y += 28;
  for (let p = 0; p < 3; p++) {
    y = wrappedText(ctx, pickFor(entry.slug + 'lp' + p, SUMMARIES) + ' ' + pickFor(entry.slug + 'lq' + p, BULLETS), 60, y, W - 120, 18, { size: 12, color: '#374151' }) + 24;
  }
  text(ctx, 'Sincerely,', 60, y, { size: 13 });
  y += 50;
  text(ctx, name.full, 60, y, { size: 18, weight: '500', serif: true, italic: true });

  watermark(ctx);
}

function renderEmailSig(ctx, entry) {
  paper(ctx);
  const name = nameFor(entry.slug);
  const pal = paletteFor(entry.slug);

  text(ctx, entry.title, W / 2, 110, { size: 24, weight: '800', align: 'center' });
  text(ctx, 'Copy / paste into Gmail or Outlook', W / 2, 144, { size: 13, color: MUTED, align: 'center' });

  // Card
  const cardX = 60, cardY = 230, cardW = W - 120, cardH = 280;
  box(ctx, cardX, cardY, cardW, cardH, '#ffffff', '#e5e7eb');

  // Photo column
  avatarCircle(ctx, cardX + 100, cardY + cardH / 2, 70, null, pal);

  // Vertical accent
  box(ctx, cardX + 210, cardY + 30, 3, cardH - 60, pal[0]);

  // Text column
  text(ctx, name.full, cardX + 240, cardY + 80, { size: 22, weight: '700' });
  text(ctx, titleForResume(entry.slug), cardX + 240, cardY + 108, { size: 13, color: MUTED });
  text(ctx, 'Acme Corporation', cardX + 240, cardY + 156, { size: 13, weight: '600', color: pal[0] });

  // Contact lines
  text(ctx, 'P  ' + phoneFor(entry.slug), cardX + 240, cardY + 192, { size: 12 });
  text(ctx, 'E  ' + emailFor(name), cardX + 240, cardY + 214, { size: 12 });
  text(ctx, 'W  acme.example.com', cardX + 240, cardY + 236, { size: 12, color: pal[0] });

  // Bottom: free badge
  box(ctx, 0, H - 100, W, 100, '#fffbeb');
  text(ctx, 'FREE · HTML + Google Docs versions · Renders in every email client', W / 2, H - 50, { size: 13, color: '#92400e', align: 'center' });
  watermark(ctx);
}

function renderBusinessDoc(ctx, entry) {
  paper(ctx);
  text(ctx, entry.title, 60, 100, { size: 28, weight: '800' });
  text(ctx, 'Prepared by Hartford & Co.   ·   May 14, 2026', 60, 132, { size: 13, color: MUTED, italic: true });
  rule(ctx, 60, 154, W - 60, BRAND, 3);

  const sections = ['EXECUTIVE SUMMARY', 'OBJECTIVES', 'APPROACH', 'NEXT STEPS'];
  let y = 200;
  for (const s of sections) {
    text(ctx, s, 60, y, { size: 14, weight: '700', color: BRAND });
    y = wrappedText(ctx, pickFor(entry.slug + s, SUMMARIES), 60, y + 26, W - 120, 18, { size: 12, color: '#374151' }) + 36;
  }

  watermark(ctx);
}

function renderEducation(ctx, entry) {
  paper(ctx);
  box(ctx, 0, 0, W, 80, BRAND);
  text(ctx, entry.title, 30, 50, { size: 22, weight: '700', color: '#ffffff' });

  [['Teacher', nameFor(entry.slug).full], ['Date', 'May 14, 2026'], ['Grade', '5th Grade'], ['Subject', 'Mathematics']].forEach(([label, val], i) => {
    const x = 30 + (i % 2) * (W / 2 - 20);
    const y = 130 + Math.floor(i / 2) * 60;
    text(ctx, label, x, y, { size: 12, weight: '700', color: MUTED });
    text(ctx, val, x, y + 24, { size: 14 });
    rule(ctx, x, y + 32, x + W / 2 - 80, '#9ca3af', 1);
  });

  const sections = [
    ['Objectives', 'Students will be able to solve two-step word problems involving fractions and decimals using strategies developed in class.'],
    ['Materials', 'Worksheets (printed), fraction tiles, whiteboards, exit-ticket slips, and the day-3 review packet.'],
    ['Lesson', 'Opening (5m): warm-up with a real-world fraction problem. Direct instruction (15m): model two-step strategy. Guided practice (15m): partner work on five problems. Closure (5m): one-question exit ticket.'],
    ['Assessment', 'Exit ticket scored 0-3. Students scoring below 2 will be flagged for the small-group review next morning.'],
  ];
  let y = 290;
  for (const [label, body] of sections) {
    text(ctx, label, 30, y, { size: 16, weight: '700', color: BRAND });
    box(ctx, 30, y + 12, W - 60, 110, SOFT, '#e5e7eb');
    wrappedText(ctx, body, 50, y + 38, W - 100, 18, { size: 12, color: '#374151' });
    y += 150;
  }

  watermark(ctx);
}

// ============================================================
//  Bookkeeping previews — distinct, dashboard-style per type
// ============================================================
const BK_ACCENTS = [
  ['#0d9488', '#14b8a6', '#5eead4', '#99f6e4'], // teal
  ['#2563eb', '#3b82f6', '#93c5fd', '#bfdbfe'], // blue
  ['#7c3aed', '#8b5cf6', '#c4b5fd', '#ddd6fe'], // violet
  ['#db2777', '#ec4899', '#f9a8d4', '#fbcfe8'], // pink
  ['#16a34a', '#22c55e', '#86efac', '#bbf7d0'], // green
  ['#ea580c', '#f97316', '#fdba74', '#fed7aa'], // orange
  ['#0891b2', '#06b6d4', '#67e8f9', '#a5f3fc'], // cyan
  ['#4f46e5', '#6366f1', '#a5b4fc', '#c7d2fe'], // indigo
];
const accentFor = (slug) => BK_ACCENTS[hash(slug + 'acc') % BK_ACCENTS.length];
const money = (n) => '$' + Math.round(n).toLocaleString('en-US');

function rrect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
}

function bkHeader(ctx, entry, accent) {
  box(ctx, 0, 0, W, 70, BRAND);
  box(ctx, 0, 70, W, 4, accent[0]);
  text(ctx, entry.title, 32, 38, { size: 21, color: '#ffffff', weight: '700' });
  text(ctx, entry.description, 32, 60, { size: 12.5, color: '#fff7ed' });
  // format tag
  ctx.font = '700 11px Inter, Arial, sans-serif';
  const tag = 'EXCEL · GOOGLE SHEETS';
  const tw = ctx.measureText(tag).width + 24;
  rrect(ctx, W - tw - 24, 22, tw, 24, 12, 'rgba(255,255,255,0.18)');
  text(ctx, tag, W - tw - 12, 38, { size: 11, color: '#ffffff', weight: '700' });
}

function kpiRow(ctx, x, y, w, tiles) {
  const gap = 14, n = tiles.length, tw = (w - gap * (n - 1)) / n, th = 80;
  tiles.forEach((t, i) => {
    const tx = x + i * (tw + gap);
    rrect(ctx, tx, y, tw, th, 12, '#ffffff', LINE);
    rrect(ctx, tx, y, 5, th, 3, t.color);
    text(ctx, t.label, tx + 18, y + 28, { size: 11, color: MUTED, weight: '600' });
    text(ctx, t.value, tx + 18, y + 60, { size: 23, color: INK, weight: '800' });
  });
  return y + th;
}

function fitText(ctx, str, maxW, size, weight) {
  ctx.font = `${weight || ''} ${size}px Inter, Helvetica, Arial, sans-serif`.trim();
  if (ctx.measureText(str).width <= maxW) return str;
  let s = str;
  while (s.length > 1 && ctx.measureText(s + '…').width > maxW) s = s.slice(0, -1);
  return s + '…';
}
function drawTable(ctx, x, y, w, headers, rows, opts = {}) {
  const colW = w / headers.length;
  const right = opts.right || [headers.length - 1];
  box(ctx, x, y, w, 34, '#fff7ed');
  headers.forEach((h, i) => {
    const r = right.includes(i);
    text(ctx, h, r ? x + (i + 1) * colW - 14 : x + i * colW + 14, y + 22, { size: 12, weight: '700', color: '#92400e', align: r ? 'right' : 'left' });
  });
  rule(ctx, x, y + 34, x + w, '#fed7aa', 1);
  rows.forEach((row, ri) => {
    const ry = y + 34 + ri * 31;
    if (ri % 2 === 1) box(ctx, x, ry, w, 31, SOFT);
    row.forEach((cell, i) => {
      const r = right.includes(i);
      const col = opts.colorFn ? opts.colorFn(cell, i, row) : INK;
      const str = fitText(ctx, String(cell), colW - 20, 11.5, r ? '600' : '');
      text(ctx, str, r ? x + (i + 1) * colW - 14 : x + i * colW + 14, ry + 21, { size: 11.5, color: col, weight: r ? '600' : '', align: r ? 'right' : 'left' });
    });
    rule(ctx, x, ry + 31, x + w, '#f1f3f5', 1);
  });
  const minRows = opts.minRows || rows.length;
  for (let ri = rows.length; ri < minRows; ri++) {
    const ry = y + 34 + ri * 31;
    if (ri % 2 === 1) box(ctx, x, ry, w, 31, SOFT);
    rule(ctx, x, ry + 31, x + w, '#f1f3f5', 1);
  }
  return y + 34 + Math.max(rows.length, minRows) * 31;
}

function donut(ctx, cx, cy, r, segs, title) {
  const total = segs.reduce((a, s) => a + s.v, 0) || 1;
  let a = -Math.PI / 2;
  segs.forEach((s) => {
    const a2 = a + (s.v / total) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a, a2); ctx.closePath();
    ctx.fillStyle = s.c; ctx.fill(); a = a2;
  });
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill();
  if (title) text(ctx, title, cx, cy + 5, { size: 12, color: MUTED, align: 'center', weight: '600' });
  segs.forEach((s, i) => {
    const ly = cy - r + 4 + i * 26;
    rrect(ctx, cx + r + 26, ly - 11, 13, 13, 3, s.c);
    text(ctx, s.label, cx + r + 48, ly, { size: 12, color: INK });
    text(ctx, Math.round((s.v / total) * 100) + '%', cx + r + 190, ly, { size: 12, color: MUTED, weight: '600', align: 'right' });
  });
}

function bars(ctx, x, y, w, h, vals, color, labels) {
  const max = Math.max(...vals) || 1, n = vals.length, gap = w / n, bw = gap * 0.56;
  rule(ctx, x, y + h, x + w, '#e5e7eb', 1);
  vals.forEach((v, i) => {
    const bh = (v / max) * (h - 8);
    const bx = x + i * gap + (gap - bw) / 2;
    rrect(ctx, bx, y + h - bh, bw, bh, 3, color);
    if (labels) text(ctx, labels[i], bx + bw / 2, y + h + 16, { size: 10, color: MUTED, align: 'center' });
  });
}

function footNote(ctx) {
  text(ctx, 'FREE  ·  Auto-totals & formulas  ·  Excel + Google Sheets', W / 2, H - 18, { size: 13, color: MUTED, align: 'center' });
}

// ---- Per-type table content ----
const EXP_POOLS = [
  ['Payroll', 'Rent', 'Software', 'Marketing', 'Supplies'],
  ['Materials', 'Labor', 'Fuel', 'Insurance', 'Permits'],
  ['COGS', 'Shipping', 'Platform fees', 'Ads', 'Returns'],
  ['Salaries', 'Utilities', 'Travel', 'Meals', 'Office'],
];
function bookSpec(entry) {
  const s = entry.slug, h = hash(s), accent = accentFor(s);
  const pool = EXP_POOLS[h % EXP_POOLS.length];
  const seg = (i) => ['#0d9488', '#2563eb', '#f59e0b', '#db2777', '#64748b'][i];
  const trend = Array.from({ length: 6 }, (_, i) => 6 + ((h >> i) % 9) + i);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const inc = 12000 + (h % 9000), exp = 4000 + (h % 4000);
  const base = {
    accent,
    kpis: [
      { label: 'Total income', value: money(inc), color: '#16a34a' },
      { label: 'Total expenses', value: money(exp), color: '#dc2626' },
      { label: 'Net profit', value: money(inc - exp), color: accent[0] },
    ],
    donut: pool.slice(0, 5).map((label, i) => ({ label, v: 30 - i * 4 + (h >> i) % 6, c: seg(i) })),
    bars: trend, barLabels: months, barColor: accent[0],
    right: [4], headers: ['Date', 'Description', 'Category', 'Type', 'Amount'],
    tableTitle: 'Transactions',
  };
  const rows = (defs) => defs;
  const map = {
    'mileage-log': { headers: ['Date', 'Odo Start', 'Odo End', 'Miles', 'Purpose'], right: [3], tableTitle: 'Trip log',
      rows: rows([['01/03', '40,210', '40,242', '32', 'Client visit'], ['01/05', '40,242', '40,318', '76', 'Job site'], ['01/08', '40,318', '40,361', '43', 'Supply run'], ['01/11', '40,361', '40,495', '134', 'Out-of-town job'], ['01/14', '40,495', '40,528', '33', 'Bank / post office'], ['01/18', '40,528', '40,612', '84', 'Client meeting'], ['01/22', '40,612', '40,659', '47', 'Vendor pickup']]),
      kpis: [{ label: 'Total miles', value: '1,284', color: accent[0] }, { label: 'IRS rate', value: '$0.67', color: '#2563eb' }, { label: 'Deduction', value: '$860', color: '#16a34a' }],
      donut: [{ label: 'Business', v: 78, c: accent[0] }, { label: 'Commute', v: 14, c: '#94a3b8' }, { label: 'Personal', v: 8, c: '#cbd5e1' }], donutTitle: 'Miles by use' },
    'inventory-tracker': { headers: ['SKU', 'Item', 'On hand', 'Reorder', 'Value'], right: [4], tableTitle: 'Inventory',
      rows: rows([['A-101', 'Canvas tote', '142', '50', '$1,704'], ['A-102', 'Ceramic mug', '38', '40', '$418'], ['B-210', 'Wax candle', '0', '25', '$0'], ['B-211', 'Gift box set', '67', '30', '$1,206'], ['C-330', 'Sticker pack', '210', '75', '$630'], ['C-331', 'Enamel pin', '54', '60', '$540'], ['D-440', 'Notebook A5', '88', '40', '$792']]),
      kpis: [{ label: 'SKUs', value: '64', color: accent[0] }, { label: 'Inventory value', value: '$18,420', color: '#16a34a' }, { label: 'Below reorder', value: '7', color: '#dc2626' }],
      donut: [{ label: 'In stock', v: 72, c: '#16a34a' }, { label: 'Low', v: 18, c: '#f59e0b' }, { label: 'Out', v: 10, c: '#dc2626' }], donutTitle: 'Stock status' },
    'invoice-tracker': { headers: ['Invoice', 'Client', 'Due', 'Status', 'Amount'], right: [4], tableTitle: 'Invoices',
      rows: rows([['INV-1042', 'Acme Co', 'Jun 10', 'Paid', '$4,500'], ['INV-1043', 'Bright LLC', 'Jun 14', 'Paid', '$1,200'], ['INV-1044', 'Nova Group', 'Jun 02', 'Overdue', '$2,800'], ['INV-1045', 'Pine & Co', 'Jun 20', 'Sent', '$960'], ['INV-1046', 'Vertex', 'Jun 22', 'Sent', '$3,400'], ['INV-1047', 'Lumen', 'May 28', 'Overdue', '$540'], ['INV-1048', 'Orbit', 'Jun 30', 'Draft', '$1,750']]),
      kpis: [{ label: 'Outstanding', value: '$9,450', color: accent[0] }, { label: 'Overdue', value: '$3,340', color: '#dc2626' }, { label: 'Paid (MTD)', value: '$5,700', color: '#16a34a' }],
      donut: [{ label: 'Paid', v: 50, c: '#16a34a' }, { label: 'Sent', v: 32, c: '#2563eb' }, { label: 'Overdue', v: 18, c: '#dc2626' }], donutTitle: 'By status',
      colorFn: (c, i) => i === 3 ? (c === 'Paid' ? '#16a34a' : c === 'Overdue' ? '#dc2626' : MUTED) : INK },
    'sales-tax-tracker': { headers: ['Period', 'State', 'Taxable', 'Rate', 'Tax due'], right: [2, 4], tableTitle: 'Taxable sales',
      rows: rows([['Q1', 'CA', '$24,500', '7.25%', '$1,776'], ['Q1', 'TX', '$8,200', '6.25%', '$513'], ['Q1', 'NY', '$5,400', '4.00%', '$216'], ['Q2', 'CA', '$31,800', '7.25%', '$2,306'], ['Q2', 'TX', '$9,950', '6.25%', '$622'], ['Q2', 'FL', '$4,100', '6.00%', '$246'], ['Q2', 'NY', '$6,700', '4.00%', '$268']]),
      kpis: [{ label: 'Taxable sales', value: '$90,650', color: accent[0] }, { label: 'Tax collected', value: '$5,947', color: '#16a34a' }, { label: 'Next filing', value: 'Jul 31', color: '#dc2626' }],
      donut: [{ label: 'California', v: 58, c: accent[0] }, { label: 'Texas', v: 20, c: '#2563eb' }, { label: 'New York', v: 13, c: '#f59e0b' }, { label: 'Florida', v: 9, c: '#db2777' }], donutTitle: 'Tax by state' },
    'payroll-register': { headers: ['Employee', 'Gross', 'Taxes', 'Deduct.', 'Net pay'], right: [1, 2, 3, 4], tableTitle: 'Pay period',
      rows: rows([['M. Rivera', '$3,200', '$612', '$180', '$2,408'], ['A. Chen', '$2,850', '$528', '$150', '$2,172'], ['J. Brooks', '$3,600', '$702', '$210', '$2,688'], ['S. Park', '$2,400', '$432', '$120', '$1,848'], ['D. Hayes', '$4,100', '$820', '$240', '$3,040'], ['R. Stone', '$2,950', '$551', '$160', '$2,239']]),
      kpis: [{ label: 'Gross payroll', value: '$19,100', color: accent[0] }, { label: 'Tax withheld', value: '$3,645', color: '#dc2626' }, { label: 'Net paid', value: '$14,395', color: '#16a34a' }],
      donut: [{ label: 'Net pay', v: 75, c: '#16a34a' }, { label: 'Taxes', v: 19, c: '#dc2626' }, { label: 'Deductions', v: 6, c: '#f59e0b' }], donutTitle: 'Payroll split' },
    'subscription-expense-tracker': { headers: ['Service', 'Billing', 'Renewal', 'Monthly', 'Annual'], right: [3, 4], tableTitle: 'Subscriptions',
      rows: rows([['Adobe CC', 'Monthly', 'Jul 12', '$55', '$660'], ['QuickBooks', 'Monthly', 'Jul 03', '$30', '$360'], ['Canva Pro', 'Annual', 'Nov 20', '$11', '$120'], ['Slack', 'Monthly', 'Jul 09', '$48', '$576'], ['Zoom', 'Annual', 'Sep 01', '$13', '$150'], ['Notion', 'Monthly', 'Jul 15', '$24', '$288'], ['Dropbox', 'Annual', 'Oct 04', '$10', '$120']]),
      kpis: [{ label: 'Subscriptions', value: '14', color: accent[0] }, { label: 'Monthly cost', value: '$246', color: '#dc2626' }, { label: 'Annualized', value: '$2,952', color: accent[0] }],
      donut: [{ label: 'Software', v: 48, c: accent[0] }, { label: 'Marketing', v: 24, c: '#2563eb' }, { label: 'Ops', v: 18, c: '#f59e0b' }, { label: 'Other', v: 10, c: '#94a3b8' }], donutTitle: 'By category' },
    'petty-cash-log': { headers: ['Date', 'Description', 'In', 'Out', 'Balance'], right: [2, 3, 4], tableTitle: 'Petty cash',
      rows: rows([['06/01', 'Opening float', '$200', '', '$200'], ['06/03', 'Postage', '', '$18', '$182'], ['06/05', 'Office snacks', '', '$34', '$148'], ['06/09', 'Parking', '', '$12', '$136'], ['06/12', 'Top-up', '$100', '', '$236'], ['06/15', 'Cleaning supplies', '', '$41', '$195'], ['06/18', 'Client gift', '', '$25', '$170']]),
      kpis: [{ label: 'Float', value: '$300', color: accent[0] }, { label: 'Spent (MTD)', value: '$130', color: '#dc2626' }, { label: 'On hand', value: '$170', color: '#16a34a' }],
      donut: [{ label: 'Office', v: 38, c: accent[0] }, { label: 'Postage', v: 22, c: '#2563eb' }, { label: 'Travel', v: 24, c: '#f59e0b' }, { label: 'Other', v: 16, c: '#94a3b8' }], donutTitle: 'Cash out' },
    'fixed-asset-register': { headers: ['Asset', 'In service', 'Cost', 'Life', 'Book value'], right: [2, 4], tableTitle: 'Fixed assets',
      rows: rows([['Laptop Pro', '01/2024', '$2,400', '5y', '$1,440'], ['Espresso machine', '03/2023', '$6,500', '7y', '$4,250'], ['Delivery van', '06/2022', '$28,000', '5y', '$11,200'], ['Camera kit', '09/2023', '$4,100', '5y', '$2,870'], ['Office furniture', '02/2024', '$3,200', '7y', '$2,743'], ['Server', '11/2023', '$5,400', '5y', '$4,140']]),
      kpis: [{ label: 'Assets', value: '12', color: accent[0] }, { label: 'Total cost', value: '$72,400', color: accent[0] }, { label: 'Book value', value: '$41,180', color: '#16a34a' }],
      donut: [{ label: 'Equipment', v: 46, c: accent[0] }, { label: 'Vehicles', v: 34, c: '#2563eb' }, { label: 'Furniture', v: 12, c: '#f59e0b' }, { label: 'Tech', v: 8, c: '#db2777' }], donutTitle: 'Asset mix' },
    'job-costing': { headers: ['Job', 'Quote', 'Materials', 'Labor', 'Margin'], right: [1, 2, 3, 4], tableTitle: 'Jobs',
      rows: rows([['Maple St reno', '$18,000', '$6,200', '$5,400', '37%'], ['Oak Ave deck', '$9,500', '$3,100', '$2,800', '38%'], ['Elm kitchen', '$24,000', '$9,800', '$7,200', '29%'], ['Pine fence', '$4,200', '$1,500', '$1,300', '33%'], ['Cedar bath', '$12,800', '$4,900', '$4,100', '30%'], ['Birch patio', '$7,600', '$2,600', '$2,200', '37%']]),
      kpis: [{ label: 'Jobs (MTD)', value: '9', color: accent[0] }, { label: 'Revenue', value: '$76,100', color: '#16a34a' }, { label: 'Avg margin', value: '34%', color: accent[0] }],
      donut: [{ label: 'Labor', v: 40, c: accent[0] }, { label: 'Materials', v: 38, c: '#2563eb' }, { label: 'Margin', v: 22, c: '#16a34a' }], donutTitle: 'Cost split' },
    'client-tracker': { headers: ['Client', 'Status', 'Last contact', 'LTV', 'Next step'], right: [3], tableTitle: 'Clients',
      rows: rows([['Acme Co', 'Active', 'Jun 12', '$24,000', 'Send proposal'], ['Bright LLC', 'Active', 'Jun 09', '$8,400', 'Monthly call'], ['Nova Group', 'Lead', 'Jun 05', '$0', 'Follow up'], ['Pine & Co', 'Active', 'May 30', '$15,200', 'Renewal'], ['Vertex', 'Paused', 'Apr 18', '$6,100', 'Re-engage'], ['Orbit', 'Lead', 'Jun 14', '$0', 'Demo call']]),
      kpis: [{ label: 'Active clients', value: '18', color: accent[0] }, { label: 'Pipeline', value: '$42k', color: '#2563eb' }, { label: 'Lifetime value', value: '$210k', color: '#16a34a' }],
      donut: [{ label: 'Active', v: 56, c: '#16a34a' }, { label: 'Lead', v: 28, c: '#2563eb' }, { label: 'Paused', v: 16, c: '#f59e0b' }], donutTitle: 'By status' },
  };
  const spec = { ...base, ...(map[s] || {}) };
  // industry tailoring for niche books with no explicit map
  if (!map[s]) {
    if (/seller|amazon|shopify|etsy|ecommerce/.test(s)) {
      spec.headers = ['Order', 'Revenue', 'Fees', 'Ship', 'Net']; spec.right = [1, 2, 3, 4]; spec.tableTitle = 'Orders';
      spec.rows = [['#1042', '$84.00', '$12.60', '$6.40', '$65.00'], ['#1043', '$129.00', '$19.40', '$8.20', '$101.40'], ['#1044', '$46.00', '$6.90', '$5.10', '$34.00'], ['#1045', '$212.00', '$31.80', '$11.00', '$169.20'], ['#1046', '$58.00', '$8.70', '$5.40', '$43.90'], ['#1047', '$164.00', '$24.60', '$9.30', '$130.10'], ['#1048', '$92.00', '$13.80', '$6.80', '$71.40']];
    } else if (/rental|landlord/.test(s)) {
      spec.headers = ['Property', 'Rent', 'Mortgage', 'Repairs', 'Net']; spec.right = [1, 2, 3, 4]; spec.tableTitle = 'Properties';
      spec.rows = [['123 Oak St', '$2,400', '$1,180', '$0', '$1,220'], ['88 Pine Ave', '$1,950', '$1,040', '$320', '$590'], ['12 Maple Ct', '$2,800', '$1,360', '$0', '$1,440'], ['305 Elm Rd', '$1,700', '$905', '$150', '$645'], ['47 Birch Ln', '$2,200', '$1,120', '$80', '$1,000'], ['9 Cedar Dr', '$3,100', '$1,540', '$0', '$1,560']];
    } else if (/trucking|owner-operator/.test(s)) {
      spec.headers = ['Load #', 'Revenue', 'Fuel', 'Repairs', 'Net']; spec.right = [1, 2, 3, 4]; spec.tableTitle = 'Loads';
      spec.rows = [['L-2207', '$2,850', '$640', '$120', '$2,090'], ['L-2208', '$1,940', '$510', '$0', '$1,430'], ['L-2209', '$3,420', '$780', '$240', '$2,400'], ['L-2210', '$2,180', '$590', '$0', '$1,590'], ['L-2211', '$2,760', '$700', '$95', '$1,965'], ['L-2212', '$1,580', '$430', '$0', '$1,150']];
    } else if (/restaurant|food-truck/.test(s)) {
      spec.headers = ['Day', 'Sales', 'Food %', 'Labor %', 'Net']; spec.right = [1, 4]; spec.tableTitle = 'Daily sales';
      spec.rows = [['Mon', '$1,840', '31%', '28%', '$420'], ['Tue', '$2,120', '29%', '27%', '$610'], ['Wed', '$1,990', '32%', '29%', '$480'], ['Thu', '$2,640', '30%', '26%', '$870'], ['Fri', '$3,980', '28%', '24%', '$1,640'], ['Sat', '$4,520', '27%', '23%', '$2,030']];
    } else if (/1099|self-employed/.test(s)) {
      spec.headers = ['Date', 'Payer / expense', 'Schedule C', 'Type', 'Amount']; spec.tableTitle = 'Income & write-offs';
      spec.rows = [['03/04', 'Acme Corp', 'Gross receipts', 'Income', '$3,200'], ['03/06', 'Adobe CC', 'Software', 'Expense', '$55'], ['03/09', 'Home office', 'Utilities', 'Expense', '$140'], ['03/12', 'Bright LLC', 'Gross receipts', 'Income', '$1,850'], ['03/15', 'Mileage', 'Car & truck', 'Expense', '$320'], ['03/18', 'Health ins.', 'Insurance', 'Expense', '$410'], ['03/22', 'Nova Group', 'Gross receipts', 'Income', '$2,400']];
    }
  }
  return spec;
}

const LEDGER_ROWS = [
  ['01/02', 'Client invoice #1042', 'Sales', 'Income', '$4,500'],
  ['01/03', 'Office supplies', 'Office', 'Expense', '$128'],
  ['01/05', 'Software subscription', 'Software', 'Expense', '$49'],
  ['01/08', 'Consulting retainer', 'Services', 'Income', '$2,400'],
  ['01/10', 'Client lunch', 'Meals', 'Expense', '$32'],
  ['01/12', 'Travel — flight', 'Travel', 'Expense', '$418'],
  ['01/15', 'Project milestone', 'Sales', 'Income', '$8,000'],
];
function tableColorFn(spec) {
  return spec.colorFn || ((c, i, row) => (i === spec.right[spec.right.length - 1] && row[3] ? (row[3] === 'Income' ? '#047857' : row[3] === 'Expense' ? '#b91c1c' : INK) : INK));
}
function moSeries(slug) {
  const h = hash(slug + 'mo'), months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const income = Array.from({ length: 6 }, (_, i) => 9 + ((h >> i) % 10) + Math.round(i * 0.8));
  const expense = Array.from({ length: 6 }, (_, i) => 3 + ((h >> (i + 3)) % 6));
  return { months, income, expense };
}
function groupedBars(ctx, x, y, w, h, a, b, labels, ca, cb) {
  const max = Math.max(...a, ...b) || 1, n = a.length, gap = w / n, bw = gap * 0.3;
  rule(ctx, x, y + h, x + w, '#e5e7eb', 1);
  for (let i = 0; i < n; i++) {
    const bx = x + i * gap + gap * 0.12;
    rrect(ctx, bx, y + h - (a[i] / max) * (h - 6), bw, (a[i] / max) * (h - 6), 3, ca);
    rrect(ctx, bx + bw + 5, y + h - (b[i] / max) * (h - 6), bw, (b[i] / max) * (h - 6), 3, cb);
    if (labels) text(ctx, labels[i], bx + bw, y + h + 16, { size: 10, color: MUTED, align: 'center' });
  }
}
function lineChart(ctx, x, y, w, h, vals, color) {
  const max = Math.max(...vals) || 1, min = Math.min(...vals), n = vals.length, rng = (max - min) || 1;
  rule(ctx, x, y + h, x + w, '#e5e7eb', 1);
  ctx.beginPath();
  vals.forEach((v, i) => { const px = x + (i / (n - 1)) * w, py = y + h - ((v - min) / rng) * (h - 12) - 6; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
  ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke();
  vals.forEach((v, i) => { const px = x + (i / (n - 1)) * w, py = y + h - ((v - min) / rng) * (h - 12) - 6; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fill(); });
}
function vtile(ctx, x, y, w, t) {
  rrect(ctx, x, y, w, 58, 10, '#ffffff', LINE);
  rrect(ctx, x, y, 5, 58, 3, t.color);
  text(ctx, t.label, x + 16, y + 22, { size: 10.5, color: MUTED, weight: '600' });
  text(ctx, t.value, x + 16, y + 46, { size: 19, color: INK, weight: '800' });
}
function catList(ctx, x, y, w, segs) {
  const total = segs.reduce((a, s) => a + s.v, 0) || 1; let yy = y;
  segs.slice(0, 4).forEach((s) => {
    text(ctx, s.label, x, yy + 9, { size: 11, color: INK });
    text(ctx, Math.round((s.v / total) * 100) + '%', x + w, yy + 9, { size: 11, color: MUTED, align: 'right', weight: '600' });
    rrect(ctx, x, yy + 16, w * (s.v / total), 8, 4, s.c);
    yy += 36;
  });
}

// ---- Five distinct dashboard layouts (assigned by slug) ----
function layoutDashboard(ctx, entry, spec) {
  let y = kpiRow(ctx, 30, 92, W - 60, spec.kpis) + 22;
  text(ctx, spec.tableTitle || 'Transactions', 30, y, { size: 14, weight: '700' }); y += 12;
  drawTable(ctx, 30, y, W - 60, spec.headers, spec.rows || LEDGER_ROWS, { right: spec.right, colorFn: tableColorFn(spec), minRows: 9 });
  const py = 700; rrect(ctx, 30, py, W - 60, 270, 14, '#ffffff', LINE);
  text(ctx, spec.donutTitle || 'Category breakdown', 56, py + 32, { size: 13, weight: '700' });
  donut(ctx, 130, py + 150, 78, spec.donut);
  text(ctx, 'Monthly trend', 470, py + 32, { size: 13, weight: '700' });
  bars(ctx, 470, py + 58, 250, 150, spec.bars, spec.barColor, spec.barLabels);
}
function layoutReport(ctx, entry, spec) {
  const s = moSeries(entry.slug);
  rrect(ctx, 30, 92, W - 60, 212, 14, '#ffffff', LINE);
  text(ctx, 'Income vs expenses', 56, 124, { size: 13, weight: '700' });
  rrect(ctx, W - 190, 110, 12, 12, 3, '#16a34a'); text(ctx, 'Income', W - 172, 120, { size: 11, color: MUTED });
  rrect(ctx, W - 110, 110, 12, 12, 3, '#ef4444'); text(ctx, 'Expenses', W - 92, 120, { size: 11, color: MUTED });
  groupedBars(ctx, 60, 150, W - 120, 112, s.income, s.expense, s.months, '#16a34a', '#ef4444');
  kpiRow(ctx, 30, 328, W - 60, spec.kpis);
  let y = 434; text(ctx, spec.tableTitle || 'Recent activity', 30, y, { size: 14, weight: '700' }); y += 12;
  drawTable(ctx, 30, y, W - 60, spec.headers, (spec.rows || LEDGER_ROWS).slice(0, 7), { right: spec.right, colorFn: tableColorFn(spec), minRows: 9 });
}
function layoutSplit(ctx, entry, spec) {
  const lw = 430;
  text(ctx, spec.tableTitle || 'Detail', 30, 116, { size: 14, weight: '700' });
  drawTable(ctx, 30, 128, lw, spec.headers, spec.rows || LEDGER_ROWS, { right: [spec.headers.length - 1], colorFn: tableColorFn(spec), minRows: 22 });
  const rx = 30 + lw + 24, rw = W - rx - 30;
  spec.kpis.forEach((t, i) => vtile(ctx, rx, 116 + i * 70, rw, t));
  let py = 116 + 3 * 70 + 12;
  rrect(ctx, rx, py, rw, 168, 12, '#ffffff', LINE);
  text(ctx, 'Monthly trend', rx + 16, py + 26, { size: 12.5, weight: '700' });
  bars(ctx, rx + 16, py + 44, rw - 32, 96, spec.bars, spec.barColor, spec.barLabels);
  py += 184;
  rrect(ctx, rx, py, rw, 196, 12, '#ffffff', LINE);
  text(ctx, spec.donutTitle || 'Top categories', rx + 16, py + 26, { size: 12.5, weight: '700' });
  catList(ctx, rx + 16, py + 44, rw - 32, spec.donut);
}
function layoutRegister(ctx, entry, spec) {
  rrect(ctx, 30, 92, W - 60, 52, 10, '#fffbeb', '#fde68a');
  const seg = (W - 60) / 3;
  spec.kpis.forEach((t, i) => {
    const x = 30 + i * seg + 22;
    if (i) rule(ctx, 30 + i * seg, 100, 30 + i * seg, '#fde68a', 1), ctx.beginPath();
    text(ctx, t.label, x, 116, { size: 11, color: MUTED, weight: '600' });
    text(ctx, t.value, x, 136, { size: 17, weight: '800', color: t.color });
  });
  text(ctx, spec.tableTitle || 'Register', 30, 176, { size: 14, weight: '700' });
  drawTable(ctx, 30, 188, W - 60, spec.headers, spec.rows || LEDGER_ROWS, { right: spec.right, colorFn: tableColorFn(spec), minRows: 23 });
}
function layoutMetrics(ctx, entry, spec) {
  const tiles = spec.kpis.concat([{ label: 'Avg / month', value: spec.kpis[0].value, color: '#64748b' }]).slice(0, 4);
  const halfW = (W - 60) * 0.5, tw = (halfW - 14) / 2, th = 78;
  tiles.forEach((t, i) => {
    const cx = 30 + (i % 2) * (tw + 14), cy = 92 + Math.floor(i / 2) * (th + 14);
    rrect(ctx, cx, cy, tw, th, 12, '#ffffff', LINE); rrect(ctx, cx, cy, 5, th, 3, t.color);
    text(ctx, t.label, cx + 16, cy + 26, { size: 10.5, color: MUTED, weight: '600' });
    text(ctx, t.value, cx + 16, cy + 58, { size: 20, weight: '800' });
  });
  const dx = 30 + halfW + 14, dw = W - 30 - dx;
  rrect(ctx, dx, 92, dw, 170, 12, '#ffffff', LINE);
  text(ctx, spec.donutTitle || 'Breakdown', dx + 16, 116, { size: 12, weight: '700' });
  donut(ctx, dx + 58, 188, 50, spec.donut.slice(0, 4));
  const s = moSeries(entry.slug);
  rrect(ctx, 30, 280, W - 60, 175, 12, '#ffffff', LINE);
  text(ctx, 'Net trend (6 mo)', 56, 310, { size: 13, weight: '700' });
  lineChart(ctx, 60, 328, W - 120, 100, s.income.map((v, i) => v - s.expense[i]), spec.barColor);
  let y = 488; text(ctx, spec.tableTitle || 'Recent', 30, y, { size: 13, weight: '700' }); y += 12;
  drawTable(ctx, 30, y, W - 60, spec.headers, (spec.rows || LEDGER_ROWS).slice(0, 6), { right: spec.right, colorFn: tableColorFn(spec), minRows: 8 });
}
const BOOK_LAYOUTS = [layoutDashboard, layoutReport, layoutSplit, layoutRegister, layoutMetrics];
// Structural slugs render via dedicated layouts; the rest rotate round-robin so
// adjacent cards always differ in both structure and accent color.
const BK_STRUCT = new Set(['profit-loss-statement', 'balance-sheet-template', 'accounts-receivable-aging', 'accounts-payable-aging', 'budget-vs-actual-tracker', 'chart-of-accounts', 'general-ledger']);
const BK_ORDER = entries.filter((e) => e.category === 'bookkeeping' && !BK_STRUCT.has(e.slug)).map((e) => e.slug);
function renderBookDashboard(ctx, entry) {
  paper(ctx);
  const spec = bookSpec(entry);
  const idx = Math.max(0, BK_ORDER.indexOf(entry.slug));
  const accent = BK_ACCENTS[(idx * 3 + 1) % BK_ACCENTS.length];
  spec.accent = accent;
  spec.barColor = accent[0];
  if (spec.kpis[spec.kpis.length - 1]) spec.kpis[spec.kpis.length - 1].color = accent[0];
  bkHeader(ctx, entry, accent);
  BOOK_LAYOUTS[idx % BOOK_LAYOUTS.length](ctx, entry, spec);
  footNote(ctx);
  watermark(ctx);
}

// ---- Dedicated structural layouts ----
function sectionRows(ctx, x, y, w, title, items, accent) {
  text(ctx, title, x, y, { size: 12.5, weight: '800', color: accent });
  rule(ctx, x, y + 8, x + w, accent, 2);
  let yy = y + 32;
  items.forEach(([label, val, opts = {}]) => {
    text(ctx, label, x + (opts.indent ? 16 : 0), yy, { size: 12.5, color: opts.bold ? INK : '#374151', weight: opts.bold ? '700' : '' });
    text(ctx, val, x + w, yy, { size: 12.5, align: 'right', weight: opts.bold ? '800' : '600', color: opts.color || INK });
    if (opts.rule) rule(ctx, x, yy + 8, x + w, LINE, 1);
    yy += opts.gap || 26;
  });
  return yy;
}
function renderPnL(ctx, entry) {
  paper(ctx);
  const accent = accentFor(entry.slug);
  bkHeader(ctx, entry, accent);
  kpiRow(ctx, 30, 92, W - 60, [
    { label: 'Total revenue', value: '$148,200', color: '#16a34a' },
    { label: 'Net income', value: '$52,640', color: accent[0] },
    { label: 'Net margin', value: '35.5%', color: '#2563eb' },
  ]);
  const x = 56, w = W - 112;
  let y = 210;
  y = sectionRows(ctx, x, y, w, 'REVENUE', [['Product sales', '$112,400'], ['Service revenue', '$35,800'], ['Total revenue', '$148,200', { bold: true, rule: true, color: '#047857' }]], accent[0]) + 14;
  y = sectionRows(ctx, x, y, w, 'COST OF GOODS SOLD', [['Materials', '$38,900'], ['Direct labor', '$24,200'], ['Total COGS', '$63,100', { bold: true, rule: true, color: '#b91c1c' }]], accent[0]) + 6;
  rrect(ctx, x, y, w, 38, 8, '#ecfdf5'); text(ctx, 'GROSS PROFIT', x + 14, y + 25, { size: 13, weight: '800' }); text(ctx, '$85,100', x + w - 14, y + 25, { size: 14, weight: '800', align: 'right', color: '#047857' }); y += 56;
  y = sectionRows(ctx, x, y, w, 'OPERATING EXPENSES', [['Payroll', '$18,400'], ['Rent', '$7,200'], ['Marketing', '$4,860'], ['Software & tools', '$2,000'], ['Total operating expenses', '$32,460', { bold: true, rule: true, color: '#b91c1c' }]], accent[0]) + 6;
  rrect(ctx, x, y, w, 44, 8, accent[3]); text(ctx, 'NET INCOME', x + 14, y + 29, { size: 14, weight: '800' }); text(ctx, '$52,640', x + w - 14, y + 29, { size: 17, weight: '800', align: 'right', color: accent[0] });
  footNote(ctx); watermark(ctx);
}
function renderBalanceSheet(ctx, entry) {
  paper(ctx);
  const accent = accentFor(entry.slug);
  bkHeader(ctx, entry, accent);
  text(ctx, 'As of June 30, 2026', 32, 96, { size: 12, color: MUTED });
  const colW = (W - 112 - 32) / 2, lx = 56, rx = 56 + colW + 32;
  let ly = 140;
  ly = sectionRows(ctx, lx, ly, colW, 'ASSETS', [['Cash & bank', '$42,800'], ['Accounts receivable', '$18,400'], ['Inventory', '$12,100'], ['Equipment (net)', '$31,500'], ['Total assets', '$104,800', { bold: true, rule: true, color: accent[0] }]], accent[0]);
  let ry = 140;
  ry = sectionRows(ctx, rx, ry, colW, 'LIABILITIES', [['Accounts payable', '$9,600'], ['Credit cards', '$3,400'], ['Equipment loan', '$22,000'], ['Total liabilities', '$35,000', { bold: true, rule: true, color: '#b91c1c' }]], accent[0]) + 18;
  ry = sectionRows(ctx, rx, ry, colW, 'EQUITY', [["Owner's capital", '$48,000'], ['Retained earnings', '$21,800'], ['Total equity', '$69,800', { bold: true, rule: true, color: '#047857' }]], accent[0]);
  const by = Math.max(ly, ry) + 40;
  rrect(ctx, 56, by, W - 112, 56, 10, '#ecfdf5', '#a7f3d0');
  text(ctx, 'Assets', 80, by + 34, { size: 13, weight: '700' });
  text(ctx, '$104,800   =   Liabilities $35,000   +   Equity $69,800', W - 80, by + 34, { size: 13, weight: '800', align: 'right', color: '#047857' });
  text(ctx, '✓ Balanced — the sheet validates automatically', 56, by + 92, { size: 12, color: MUTED });
  footNote(ctx); watermark(ctx);
}
function renderAging(ctx, entry, isAP) {
  paper(ctx);
  const accent = accentFor(entry.slug);
  bkHeader(ctx, entry, accent);
  const who = isAP ? 'Vendor' : 'Customer';
  kpiRow(ctx, 30, 92, W - 60, [
    { label: isAP ? 'Total payable' : 'Total outstanding', value: '$48,900', color: accent[0] },
    { label: 'Current', value: '$28,400', color: '#16a34a' },
    { label: '60+ days overdue', value: '$9,100', color: '#dc2626' },
  ]);
  const headers = [who, 'Current', '1–30', '31–60', '61–90', '90+', 'Total'];
  const rows = [
    ['Acme Co', '$8,400', '$0', '$0', '$0', '$0', '$8,400'],
    ['Bright LLC', '$0', '$3,200', '$0', '$0', '$0', '$3,200'],
    ['Nova Group', '$0', '$0', '$2,800', '$1,400', '$0', '$4,200'],
    ['Pine & Co', '$6,100', '$2,400', '$0', '$0', '$0', '$8,500'],
    ['Vertex', '$0', '$0', '$0', '$0', '$3,600', '$3,600'],
    ['Lumen', '$4,200', '$1,800', '$900', '$0', '$0', '$6,900'],
    ['Orbit', '$0', '$0', '$0', '$2,300', '$1,500', '$3,800'],
  ];
  drawTable(ctx, 30, 210, W - 60, headers, rows, {
    right: [1, 2, 3, 4, 5, 6],
    colorFn: (c, i) => (i === 4 || i === 5) && c !== '$0' ? '#dc2626' : (i === 6 ? INK : (c === '$0' ? '#cbd5e1' : '#374151')),
  });
  const py = 700;
  rrect(ctx, 30, py, W - 60, 250, 14, '#ffffff', LINE);
  text(ctx, 'Aging distribution', 56, py + 32, { size: 13, weight: '700' });
  const buckets = [['Current', 28400, '#16a34a'], ['1–30', 9400, '#84cc16'], ['31–60', 3700, '#f59e0b'], ['61–90', 3700, '#f97316'], ['90+', 5100, '#dc2626']];
  // colored bars by severity (green → red)
  const max = Math.max(...buckets.map((b) => b[1])) || 1, gap = 660 / buckets.length, x0 = 70, h = 140, y0 = py + 60, bw = gap * 0.5;
  rule(ctx, x0, y0 + h, x0 + 660, '#e5e7eb', 1);
  buckets.forEach((b, i) => {
    const bh = (b[1] / max) * (h - 8), bx = x0 + i * gap + (gap - bw) / 2;
    rrect(ctx, bx, y0 + h - bh, bw, bh, 3, b[2]);
    text(ctx, b[0], bx + bw / 2, y0 + h + 18, { size: 11, color: MUTED, align: 'center' });
    text(ctx, money(b[1]), bx + bw / 2, y0 + h - bh - 8, { size: 10, color: b[2], align: 'center', weight: '700' });
  });
  footNote(ctx); watermark(ctx);
}
function renderBudgetActual(ctx, entry) {
  paper(ctx);
  const accent = accentFor(entry.slug);
  bkHeader(ctx, entry, accent);
  kpiRow(ctx, 30, 92, W - 60, [
    { label: 'Budgeted', value: '$42,000', color: '#2563eb' },
    { label: 'Actual', value: '$38,640', color: accent[0] },
    { label: 'Variance', value: '+$3,360', color: '#16a34a' },
  ]);
  const headers = ['Category', 'Budget', 'Actual', 'Variance', '%'];
  const rows = [
    ['Payroll', '$18,000', '$17,400', '+$600', '+3%'],
    ['Rent', '$7,200', '$7,200', '$0', '0%'],
    ['Marketing', '$5,000', '$6,300', '−$1,300', '−26%'],
    ['Software', '$2,400', '$2,140', '+$260', '+11%'],
    ['Supplies', '$3,200', '$2,800', '+$400', '+13%'],
    ['Travel', '$3,000', '$1,600', '+$1,400', '+47%'],
    ['Utilities', '$3,200', '$1,200', '+$2,000', '+63%'],
  ];
  drawTable(ctx, 30, 210, W - 60, headers, rows, {
    right: [1, 2, 3, 4],
    colorFn: (c, i) => (i === 3 || i === 4) ? (String(c).startsWith('−') ? '#dc2626' : String(c).startsWith('+') ? '#16a34a' : MUTED) : INK,
  });
  const py = 690;
  rrect(ctx, 30, py, W - 60, 260, 14, '#ffffff', LINE);
  text(ctx, 'Budget vs actual', 56, py + 32, { size: 13, weight: '700' });
  const cats = ['Payroll', 'Rent', 'Mktg', 'SW', 'Supp', 'Travel'];
  const bud = [18000, 7200, 5000, 2400, 3200, 3000], act = [17400, 7200, 6300, 2140, 2800, 1600];
  const max = 18000, gap = 640 / cats.length, x0 = 60, h = 150, y0 = py + 56;
  rule(ctx, x0, y0 + h, x0 + 640, '#e5e7eb', 1);
  cats.forEach((c, i) => {
    const bx = x0 + i * gap + 10;
    rrect(ctx, bx, y0 + h - (bud[i] / max) * h, gap * 0.32, (bud[i] / max) * h, 3, '#93c5fd');
    rrect(ctx, bx + gap * 0.36, y0 + h - (act[i] / max) * h, gap * 0.32, (act[i] / max) * h, 3, accent[0]);
    text(ctx, c, bx + gap * 0.34, y0 + h + 18, { size: 10, color: MUTED, align: 'center' });
  });
  rrect(ctx, 560, py + 24, 12, 12, 3, '#93c5fd'); text(ctx, 'Budget', 578, py + 34, { size: 11, color: MUTED });
  rrect(ctx, 640, py + 24, 12, 12, 3, accent[0]); text(ctx, 'Actual', 658, py + 34, { size: 11, color: MUTED });
  footNote(ctx); watermark(ctx);
}
function renderCOA(ctx, entry) {
  paper(ctx);
  const accent = accentFor(entry.slug);
  bkHeader(ctx, entry, accent);
  const groups = [
    ['ASSETS', '#2563eb', [['1000', 'Cash — Operating'], ['1010', 'Cash — Savings'], ['1200', 'Accounts Receivable'], ['1400', 'Inventory'], ['1500', 'Equipment']]],
    ['LIABILITIES', '#dc2626', [['2000', 'Accounts Payable'], ['2100', 'Credit Card'], ['2400', 'Sales Tax Payable'], ['2700', 'Equipment Loan']]],
    ['EQUITY', '#7c3aed', [['3000', "Owner's Capital"], ['3100', "Owner's Draw"], ['3900', 'Retained Earnings']]],
    ['INCOME', '#16a34a', [['4000', 'Product Sales'], ['4100', 'Service Revenue'], ['4900', 'Other Income']]],
    ['EXPENSES', '#f59e0b', [['5000', 'COGS'], ['6000', 'Payroll'], ['6100', 'Rent'], ['6200', 'Marketing'], ['6300', 'Software']]],
  ];
  let y = 110;
  const x = 40, w = W - 80;
  groups.forEach(([name, color, accts]) => {
    rrect(ctx, x, y, w, 30, 6, color + '22');
    rrect(ctx, x, y, 5, 30, 2, color);
    text(ctx, name, x + 16, y + 20, { size: 12.5, weight: '800', color });
    text(ctx, `${accts.length} accounts`, x + w - 14, y + 20, { size: 11, color: MUTED, align: 'right' });
    y += 38;
    accts.forEach(([num, label], i) => {
      if (i % 2 === 1) box(ctx, x, y - 4, w, 26, SOFT);
      text(ctx, num, x + 16, y + 14, { size: 12, color: MUTED, weight: '600' });
      text(ctx, label, x + 90, y + 14, { size: 12.5, color: INK });
      y += 26;
    });
    y += 12;
  });
  footNote(ctx); watermark(ctx);
}
function renderGeneralLedger(ctx, entry) {
  paper(ctx);
  const accent = accentFor(entry.slug);
  bkHeader(ctx, entry, accent);
  kpiRow(ctx, 30, 92, W - 60, [
    { label: 'Total debits', value: '$24,860', color: accent[0] },
    { label: 'Total credits', value: '$24,860', color: '#2563eb' },
    { label: 'In balance', value: '✓ Yes', color: '#16a34a' },
  ]);
  const headers = ['Date', 'Account', 'Memo', 'Debit', 'Credit', 'Balance'];
  const rows = [
    ['06/01', '1000 Cash', 'Opening', '$8,000', '', '$8,000'],
    ['06/02', '1200 AR', 'Invoice #1042', '$4,500', '', '$12,500'],
    ['06/02', '4000 Sales', 'Invoice #1042', '', '$4,500', '$8,000'],
    ['06/05', '6100 Rent', 'June rent', '$2,200', '', '$10,200'],
    ['06/05', '1000 Cash', 'June rent', '', '$2,200', '$8,000'],
    ['06/08', '1000 Cash', 'Payment recd', '$4,500', '', '$12,500'],
    ['06/08', '1200 AR', 'Payment recd', '', '$4,500', '$8,000'],
    ['06/12', '6200 Mktg', 'Ad campaign', '$860', '', '$8,860'],
  ];
  drawTable(ctx, 30, 210, W - 60, headers, rows, {
    right: [3, 4, 5],
    colorFn: (c, i) => i === 3 ? (c ? '#16a34a' : INK) : i === 4 ? (c ? '#dc2626' : INK) : INK,
  });
  text(ctx, 'Every entry posts to two accounts — debits always equal credits.', 30, 690, { size: 12, color: MUTED });
  footNote(ctx); watermark(ctx);
}

function renderBookkeeping(ctx, entry) {
  const s = entry.slug;
  if (s === 'profit-loss-statement') return renderPnL(ctx, entry);
  if (s === 'balance-sheet-template') return renderBalanceSheet(ctx, entry);
  if (s === 'accounts-receivable-aging') return renderAging(ctx, entry, false);
  if (s === 'accounts-payable-aging') return renderAging(ctx, entry, true);
  if (s === 'budget-vs-actual-tracker') return renderBudgetActual(ctx, entry);
  if (s === 'chart-of-accounts') return renderCOA(ctx, entry);
  if (s === 'general-ledger') return renderGeneralLedger(ctx, entry);
  return renderBookDashboard(ctx, entry);
}

// ============================================================
//  Invoice & quote previews — multiple distinct designs
// ============================================================
const INV_PROFILES = {
  creative: { biz: 'Creative Studio', bill: 'Northwind Co.', billAddr: ['500 Market St', 'Austin, TX 78701'], note: 'Thank you! Payment due within 14 days.', sub: 6420,
    items: [['Brand identity — discovery & strategy', '1', '$2,400', '$2,400'], ['Logo & mark design — 3 directions', '1', '$1,800', '$1,800'], ['Type system & color palette', '1', '$900', '$900'], ['Brand guidelines PDF (20 pp)', '1', '$750', '$750'], ['Project management & revisions', '6 hrs', '$95', '$570']] },
  trades: { biz: 'Home Services LLC', bill: 'M. Rivera', billAddr: ['88 Pine Ave', 'Denver, CO 80202'], note: 'Payment due on completion. Parts warrantied 1 year.', sub: 1386,
    items: [['Service call & diagnostic', '1', '$95', '$95'], ['Labor', '5 hrs', '$120', '$600'], ['Parts & materials', '1', '$486', '$486'], ['Equipment & disposal', '1', '$120', '$120'], ['Permit fee', '1', '$85', '$85']] },
  pro: { biz: '& Associates', bill: 'Bright LLC', billAddr: ['12 Madison Ave', 'New York, NY 10010'], note: 'Net 30. Please reference the invoice number with payment.', sub: 3900,
    items: [['Consultation & intake', '2.0 hrs', '$250', '$500'], ['Research & analysis', '6.5 hrs', '$250', '$1,625'], ['Drafting & preparation', '4.0 hrs', '$250', '$1,000'], ['Review & revisions', '2.5 hrs', '$250', '$625'], ['Filing & admin', '1.0 hr', '$150', '$150']] },
  events: { biz: 'Events & Co.', bill: 'The Hartley Wedding', billAddr: ['Rosewood Estate', 'Napa, CA 94558'], note: 'Balance due 14 days before event. Deposit non-refundable.', sub: 4680,
    items: [['Coverage package — 8 hours', '1', '$2,800', '$2,800'], ['Second shooter', '1', '$650', '$650'], ['Engagement session', '1', '$450', '$450'], ['Album — 30 pages', '1', '$600', '$600'], ['Travel', '1', '$180', '$180']] },
  generic: { biz: 'Company', bill: 'Acme Corporation', billAddr: ['500 Tech Park Dr', 'San Jose, CA 95110'], note: 'Thank you for your business. Net 30 days.', sub: 2195,
    items: [['Professional services', '1', '$1,500', '$1,500'], ['Additional work', '3 hrs', '$120', '$360'], ['Materials', '1', '$240', '$240'], ['Expenses', '1', '$95', '$95']] },
};
function invProfile(slug) {
  if (/photo|wedding|dj|catering|event|music|massage|groomer|fitness/.test(slug)) return 'events';
  if (/plumber|electric|hvac|handyman|mechanic|landscap|clean|contractor|construction|detailing|auto/.test(slug)) return 'trades';
  if (/attorney|legal|accountant|consult|tutor|notary|tax|advisor|medical/.test(slug)) return 'pro';
  if (/design|graphic|web|brand|marketing|interior|creative/.test(slug)) return 'creative';
  return 'generic';
}
const usd = (n) => '$' + n.toLocaleString('en-US');
function invMeta(slug) { const h = hash(slug); return { no: 'INV-' + (1000 + h % 9000), date: 'Jun 2, 2026', due: 'Jul 2, 2026' }; }

function invItemsTable(ctx, x, y, w, items, accent, filled) {
  const ax = x + w - 14, rx = x + w - 110, qx = x + w - 200;
  if (filled) {
    rrect(ctx, x, y, w, 36, 6, accent[0]);
    text(ctx, 'Description', x + 14, y + 23, { size: 12, weight: '700', color: '#fff' });
    text(ctx, 'Qty', qx, y + 23, { size: 12, weight: '700', color: '#fff', align: 'right' });
    text(ctx, 'Rate', rx, y + 23, { size: 12, weight: '700', color: '#fff', align: 'right' });
    text(ctx, 'Amount', ax, y + 23, { size: 12, weight: '700', color: '#fff', align: 'right' });
  } else {
    text(ctx, 'DESCRIPTION', x + 14, y + 18, { size: 11, weight: '700', color: MUTED });
    text(ctx, 'QTY', qx, y + 18, { size: 11, weight: '700', color: MUTED, align: 'right' });
    text(ctx, 'RATE', rx, y + 18, { size: 11, weight: '700', color: MUTED, align: 'right' });
    text(ctx, 'AMOUNT', ax, y + 18, { size: 11, weight: '700', color: MUTED, align: 'right' });
    rule(ctx, x, y + 30, x + w, accent[0], 1.5);
  }
  const top = y + (filled ? 36 : 34);
  items.forEach((it, i) => {
    const ry = top + i * 40;
    if (filled && i % 2 === 1) box(ctx, x, ry, w, 40, SOFT);
    text(ctx, fitText(ctx, it[0], qx - x - 24, 12, ''), x + 14, ry + 25, { size: 12, color: '#374151' });
    text(ctx, it[1], qx, ry + 25, { size: 12, color: '#374151', align: 'right' });
    text(ctx, it[2], rx, ry + 25, { size: 12, color: '#374151', align: 'right' });
    text(ctx, it[3], ax, ry + 25, { size: 12, color: INK, weight: '600', align: 'right' });
    rule(ctx, x, ry + 40, x + w, '#eef0f2', 1);
  });
  return top + items.length * 40;
}
function invTotals(ctx, left, right, yTop, sub, accent, label = 'TOTAL DUE') {
  const tax = Math.round(sub * 0.085), total = sub + tax;
  text(ctx, 'Subtotal', left, yTop, { size: 13, color: MUTED });
  text(ctx, usd(sub), right, yTop, { size: 13, align: 'right' });
  text(ctx, 'Tax (8.5%)', left, yTop + 24, { size: 13, color: MUTED });
  text(ctx, usd(tax), right, yTop + 24, { size: 13, align: 'right' });
  rule(ctx, left, yTop + 40, right, '#e5e7eb', 1);
  rrect(ctx, left - 14, yTop + 52, right - left + 28, 46, 8, accent[3]);
  text(ctx, label, left, yTop + 81, { size: 14, weight: '800' });
  text(ctx, usd(total), right, yTop + 81, { size: 18, weight: '800', align: 'right', color: accent[0] });
}
function invFrom(ctx, x, y, entry, p, big) {
  const nm = nameFor(entry.slug);
  text(ctx, nm.last + ' ' + p.biz, x, y, { size: big ? 16 : 14, weight: '700' });
  [cityFor(entry.slug), emailFor(nm)].forEach((l, i) => text(ctx, l, x, y + 20 + i * 17, { size: 12, color: MUTED }));
}

function invModern(ctx, entry, p, accent) {
  paper(ctx);
  box(ctx, 0, 0, W, 10, accent[0]);
  ctx.fillStyle = accent[0]; ctx.beginPath(); ctx.arc(66, 96, 28, 0, Math.PI * 2); ctx.fill();
  text(ctx, p.biz[0], 66, 105, { size: 24, weight: '800', color: '#fff', align: 'center' });
  invFrom(ctx, 110, 90, entry, p, true);
  text(ctx, 'INVOICE', W - 40, 86, { size: 42, weight: '800', color: accent[0], align: 'right' });
  const m = invMeta(entry.slug);
  [['Invoice #', m.no], ['Date', m.date], ['Due', m.due]].forEach(([k, v], i) => { text(ctx, k, W - 230, 120 + i * 22, { size: 12, weight: '700', color: MUTED }); text(ctx, v, W - 40, 120 + i * 22, { size: 12, align: 'right', weight: '600' }); });
  text(ctx, 'BILL TO', 40, 250, { size: 11, weight: '800', color: accent[0] });
  text(ctx, p.bill, 40, 274, { size: 14, weight: '700' });
  p.billAddr.forEach((l, i) => text(ctx, l, 40, 294 + i * 17, { size: 12, color: MUTED }));
  const ty = invItemsTable(ctx, 40, 360, W - 80, p.items, accent, true);
  invTotals(ctx, W - 250, W - 40, ty + 26, p.sub, accent);
  text(ctx, p.note, 40, H - 50, { size: 12, color: MUTED });
  text(ctx, entry.title, 40, H - 26, { size: 12, weight: '700', color: accent[0] });
  watermark(ctx);
}
function invClassic(ctx, entry, p, accent) {
  paper(ctx);
  const m = invMeta(entry.slug), nm = nameFor(entry.slug);
  text(ctx, 'INVOICE', W / 2, 84, { size: 36, weight: '800', align: 'center', serif: true });
  rule(ctx, W / 2 - 60, 100, W / 2 + 60, accent[0], 2);
  text(ctx, nm.last + ' ' + p.biz, W / 2, 132, { size: 15, weight: '700', align: 'center', serif: true });
  text(ctx, cityFor(entry.slug) + '   ·   ' + emailFor(nm), W / 2, 154, { size: 12, color: MUTED, align: 'center' });
  text(ctx, 'BILLED TO', 60, 224, { size: 11, weight: '700', color: MUTED });
  text(ctx, p.bill, 60, 248, { size: 14, weight: '700' });
  p.billAddr.forEach((l, i) => text(ctx, l, 60, 268 + i * 17, { size: 12, color: MUTED }));
  [['Invoice #', m.no], ['Date', m.date], ['Due', m.due]].forEach(([k, v], i) => { text(ctx, k, W - 250, 232 + i * 22, { size: 12, color: MUTED }); text(ctx, v, W - 60, 232 + i * 22, { size: 12, align: 'right', weight: '600' }); });
  const ty = invItemsTable(ctx, 60, 340, W - 120, p.items, accent, false);
  invTotals(ctx, W - 280, W - 60, ty + 24, p.sub, accent, 'BALANCE DUE');
  text(ctx, p.note, W / 2, H - 44, { size: 12, color: MUTED, align: 'center', italic: true });
  watermark(ctx);
}
function invSidebar(ctx, entry, p, accent) {
  paper(ctx);
  const sw = 250, nm = nameFor(entry.slug), m = invMeta(entry.slug);
  box(ctx, 0, 0, sw, H, accent[0]);
  text(ctx, 'INVOICE', 28, 96, { size: 30, weight: '800', color: '#fff' });
  text(ctx, m.no, 28, 126, { size: 13, color: '#ffffffcc' });
  const tax = Math.round(p.sub * 0.085), total = p.sub + tax;
  text(ctx, 'AMOUNT DUE', 28, H - 210, { size: 12, color: '#ffffffcc', weight: '700' });
  text(ctx, usd(total), 28, H - 168, { size: 32, weight: '800', color: '#fff' });
  text(ctx, 'Due ' + m.due, 28, H - 138, { size: 12, color: '#ffffffcc' });
  text(ctx, nm.last + ' ' + p.biz, 28, H - 86, { size: 13, weight: '700', color: '#fff' });
  text(ctx, emailFor(nm), 28, H - 66, { size: 11.5, color: '#ffffffcc' });
  text(ctx, phoneFor(entry.slug), 28, H - 48, { size: 11.5, color: '#ffffffcc' });
  const x = sw + 30, w = W - sw - 60;
  text(ctx, 'BILL TO', x, 96, { size: 11, weight: '800', color: accent[0] });
  text(ctx, p.bill, x, 120, { size: 14, weight: '700' });
  p.billAddr.forEach((l, i) => text(ctx, l, x, 140 + i * 17, { size: 12, color: MUTED }));
  text(ctx, 'Date: ' + m.date, x + w - 150, 96, { size: 12, color: MUTED });
  const ty = invItemsTable(ctx, x, 210, w, p.items, accent, true);
  invTotals(ctx, x + w - 210, x + w, ty + 24, p.sub, accent);
  watermark(ctx);
}
function invMinimal(ctx, entry, p, accent) {
  paper(ctx);
  const nm = nameFor(entry.slug), m = invMeta(entry.slug);
  text(ctx, 'Invoice', 50, 84, { size: 19, weight: '700', color: MUTED });
  text(ctx, m.no, 50, 108, { size: 13, color: MUTED });
  const tax = Math.round(p.sub * 0.085), total = p.sub + tax;
  text(ctx, 'Amount due', W - 50, 74, { size: 13, color: MUTED, align: 'right' });
  text(ctx, usd(total), W - 50, 116, { size: 38, weight: '800', align: 'right', color: accent[0] });
  rule(ctx, 50, 156, W - 50, '#eceff1', 1);
  text(ctx, 'FROM', 50, 196, { size: 10, weight: '700', color: '#9ca3af' });
  text(ctx, nm.last + ' ' + p.biz, 50, 216, { size: 13, weight: '700' });
  text(ctx, emailFor(nm), 50, 234, { size: 12, color: MUTED });
  text(ctx, 'BILL TO', W / 2, 196, { size: 10, weight: '700', color: '#9ca3af' });
  text(ctx, p.bill, W / 2, 216, { size: 13, weight: '700' });
  text(ctx, p.billAddr[1], W / 2, 234, { size: 12, color: MUTED });
  const ty = invItemsTable(ctx, 50, 296, W - 100, p.items, accent, false);
  invTotals(ctx, W - 250, W - 50, ty + 28, p.sub, accent);
  text(ctx, p.note, 50, H - 40, { size: 12, color: MUTED });
  watermark(ctx);
}
function invQuote(ctx, entry, p, accent) {
  paper(ctx);
  box(ctx, 0, 0, W, 10, accent[0]);
  const nm = nameFor(entry.slug), m = invMeta(entry.slug);
  text(ctx, 'ESTIMATE', 40, 92, { size: 40, weight: '800', color: accent[0] });
  text(ctx, nm.last + ' ' + p.biz, W - 40, 74, { size: 15, weight: '700', align: 'right' });
  text(ctx, emailFor(nm), W - 40, 94, { size: 12, color: MUTED, align: 'right' });
  text(ctx, 'Quote ' + m.no.replace('INV', 'EST'), W - 40, 114, { size: 12, color: MUTED, align: 'right' });
  rrect(ctx, 40, 138, W - 80, 42, 8, accent[3]);
  text(ctx, 'Valid until Jul 16, 2026', 58, 165, { size: 13, weight: '700', color: accent[0] });
  text(ctx, 'Prepared for ' + p.bill, W - 58, 165, { size: 13, align: 'right', weight: '600' });
  const ty = invItemsTable(ctx, 40, 214, W - 80, p.items, accent, true);
  invTotals(ctx, W - 250, W - 40, ty + 24, p.sub, accent, 'ESTIMATED TOTAL');
  rule(ctx, 40, H - 104, 300, '#9ca3af', 1); text(ctx, 'Accepted by (signature)', 40, H - 88, { size: 11, color: MUTED });
  rule(ctx, W - 300, H - 104, W - 40, '#9ca3af', 1); text(ctx, 'Date', W - 300, H - 88, { size: 11, color: MUTED });
  text(ctx, 'This is an estimate, not a bill. Pricing valid for 14 days.', 40, H - 48, { size: 12, color: MUTED, italic: true });
  watermark(ctx);
}
function invReceipt(ctx, entry, p, accent) {
  paper(ctx);
  const nm = nameFor(entry.slug), m = invMeta(entry.slug), cw = 540, cx = (W - cw) / 2;
  text(ctx, 'RECEIPT', W / 2, 84, { size: 32, weight: '800', align: 'center' });
  text(ctx, nm.last + ' ' + p.biz, W / 2, 112, { size: 14, weight: '700', align: 'center' });
  text(ctx, emailFor(nm), W / 2, 132, { size: 12, color: MUTED, align: 'center' });
  ctx.save(); ctx.translate(W - 170, 220); ctx.rotate(-0.2);
  ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(-72, -28, 144, 56, 8); ctx.stroke();
  text(ctx, 'PAID', 0, 9, { size: 26, weight: '800', color: '#16a34a', align: 'center' }); ctx.restore();
  text(ctx, 'Receipt ' + m.no.replace('INV', 'RC'), cx, 206, { size: 12, color: MUTED });
  text(ctx, 'Date: ' + m.date, cx, 228, { size: 12, color: MUTED });
  const ty = invItemsTable(ctx, cx, 268, cw, p.items.slice(0, 4), accent, false);
  invTotals(ctx, cx + cw - 220, cx + cw, ty + 22, p.sub, accent, 'PAID IN FULL');
  text(ctx, 'Payment received in full — thank you!', W / 2, H - 50, { size: 13, color: '#16a34a', align: 'center', weight: '600' });
  watermark(ctx);
}
const INV_DESIGNS = [invModern, invClassic, invSidebar, invMinimal];
const INV_ORDER = entries.filter((e) => e.category === 'invoice').map((e) => e.slug);
function renderInvoiceCat(ctx, entry) {
  const s = entry.slug;
  const idx = Math.max(0, INV_ORDER.indexOf(s));
  const accent = BK_ACCENTS[(idx * 3 + 2) % BK_ACCENTS.length];
  const p = INV_PROFILES[invProfile(s)];
  if (/quote|estimate|quotation/.test(s)) return invQuote(ctx, entry, p, accent);
  if (/receipt/.test(s)) return invReceipt(ctx, entry, p, accent);
  if (/reminder|late-payment|past-due|credit-memo/.test(s)) return renderLetter(ctx, entry);
  return INV_DESIGNS[idx % INV_DESIGNS.length](ctx, entry, p, accent);
}

// ============================================================
//  Planner & tracker previews — distinct printable layouts
// ============================================================
function checkbox(ctx, x, y, on, color) {
  rrect(ctx, x, y, 16, 16, 4, on ? color : '#ffffff', on ? color : '#cbd5e1');
  if (on) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 4, y + 8.5); ctx.lineTo(x + 7, y + 11.5); ctx.lineTo(x + 12, y + 5); ctx.stroke(); }
}
function ruledLines(ctx, x, y, w, n, gap) { for (let i = 0; i < n; i++) rule(ctx, x, y + i * gap, x + w, '#e9edf1', 1); }
function plFoot(ctx) { text(ctx, 'FREE printable  ·  Letter + A4  ·  Fill in & print', W / 2, H - 18, { size: 13, color: MUTED, align: 'center' }); watermark(ctx); }
function plHead(ctx, entry, accent, sub) { box(ctx, 0, 0, W, 84, accent[0]); text(ctx, entry.title, 36, sub ? 42 : 50, { size: 25, weight: '800', color: '#fff' }); if (sub) text(ctx, sub, 36, 68, { size: 13, color: '#ffffffdd' }); }

function plDaily(ctx, entry, accent) {
  paper(ctx); plHead(ctx, entry, accent, 'Date  ____ / ____ / ______');
  const hours = ['6 AM', '7', '8', '9', '10', '11', '12 PM', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  text(ctx, 'SCHEDULE', 40, 128, { size: 12, weight: '800', color: accent[0] });
  hours.forEach((h, i) => { const y = 148 + i * 46; text(ctx, h, 40, y + 26, { size: 11, color: MUTED }); rule(ctx, 92, y, 440, '#eef0f2', 1); });
  rule(ctx, 92, 148 + 16 * 46, 440, '#eef0f2', 1);
  const rx = 470, rw = W - rx - 40;
  rrect(ctx, rx, 110, rw, 150, 12, '#fff', LINE); text(ctx, 'TOP 3 PRIORITIES', rx + 16, 136, { size: 12, weight: '800', color: accent[0] });
  for (let i = 0; i < 3; i++) { checkbox(ctx, rx + 16, 152 + i * 32, false, accent[0]); rule(ctx, rx + 42, 178 + i * 32, rx + rw - 16, '#eef0f2', 1); }
  rrect(ctx, rx, 278, rw, 250, 12, '#fff', LINE); text(ctx, 'TO-DO', rx + 16, 304, { size: 12, weight: '800', color: accent[0] });
  for (let i = 0; i < 7; i++) { checkbox(ctx, rx + 16, 320 + i * 28, i < 2, accent[0]); rule(ctx, rx + 42, 344 + i * 28, rx + rw - 16, '#eef0f2', 1); }
  rrect(ctx, rx, 546, rw, 88, 12, '#fff', LINE); text(ctx, 'WATER', rx + 16, 572, { size: 12, weight: '800', color: accent[0] });
  for (let i = 0; i < 8; i++) { const cxp = rx + 30 + i * ((rw - 50) / 7); ctx.beginPath(); ctx.arc(cxp, 604, 11, 0, Math.PI * 2); if (i < 3) { ctx.fillStyle = accent[2]; ctx.fill(); } ctx.strokeStyle = accent[0]; ctx.lineWidth = 2; ctx.stroke(); }
  rrect(ctx, rx, 652, rw, 286, 12, '#fff', LINE); text(ctx, 'NOTES', rx + 16, 678, { size: 12, weight: '800', color: accent[0] });
  ruledLines(ctx, rx + 16, 704, rw - 32, 8, 28);
  plFoot(ctx);
}
function plWeekly(ctx, entry, accent) {
  paper(ctx); plHead(ctx, entry, accent, 'Week of  ________________');
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const top = 104, colW = (W - 60) / 2, rowH = (H - top - 56) / 4;
  for (let i = 0; i < 7; i++) { const cx = 30 + (i % 2) * colW, cy = top + Math.floor(i / 2) * rowH; rrect(ctx, cx + 6, cy + 6, colW - 12, rowH - 12, 10, '#fff', LINE); rrect(ctx, cx + 6, cy + 6, colW - 12, 28, 8, accent[3]); text(ctx, days[i], cx + 20, cy + 25, { size: 12, weight: '800', color: accent[0] }); ruledLines(ctx, cx + 20, cy + 56, colW - 44, 4, 26); }
  const cx = 30 + colW, cy = top + 3 * rowH; rrect(ctx, cx + 6, cy + 6, colW - 12, rowH - 12, 10, accent[3]); text(ctx, 'NOTES & GOALS', cx + 20, cy + 26, { size: 12, weight: '800', color: accent[0] }); ruledLines(ctx, cx + 20, cy + 56, colW - 44, 4, 26);
  plFoot(ctx);
}
function plHabit(ctx, entry, accent) {
  paper(ctx); plHead(ctx, entry, accent, 'Month  ____________');
  const habits = ['Drink water', 'Exercise', 'Read 20 min', 'Meditate', 'No sugar', 'Journal', '8h sleep', '10k steps'];
  const days = 16, x0 = 196, top = 134, colW = (W - x0 - 30) / days, rowH = 46;
  for (let d = 0; d < days; d++) text(ctx, String(d + 1), x0 + d * colW + colW / 2, top - 10, { size: 9, color: MUTED, align: 'center' });
  habits.forEach((h, r) => { const y = top + r * rowH; if (r % 2 === 1) box(ctx, 30, y - 14, W - 60, rowH, '#f9fafb'); text(ctx, h, 46, y + 6, { size: 13, weight: '600' }); for (let d = 0; d < days; d++) { const cxp = x0 + d * colW + colW / 2, on = hash(entry.slug + r + 'x' + d) % 3 === 0; ctx.beginPath(); ctx.arc(cxp, y + 2, 9, 0, Math.PI * 2); if (on) { ctx.fillStyle = accent[0]; ctx.fill(); } else { ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.5; ctx.stroke(); } } });
  const sy = top + habits.length * rowH + 16; rrect(ctx, 30, sy, W - 60, 84, 12, accent[3]); text(ctx, 'Fill a circle each day you complete the habit — build the chain.', 50, sy + 34, { size: 13, weight: '600', color: accent[0] }); text(ctx, 'Best streak: 12 days     ·     This month: 78% complete', 50, sy + 60, { size: 12, color: INK });
  plFoot(ctx);
}
function plMeal(ctx, entry, accent) {
  paper(ctx); plHead(ctx, entry, accent, 'Week of  ________________');
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], meals = ['Breakfast', 'Lunch', 'Dinner'];
  const x0 = 110, top = 134, gw = W - x0 - 210, colW = gw / 3, rowH = (H - top - 70) / 7;
  meals.forEach((m, i) => text(ctx, m, x0 + i * colW + colW / 2, top - 8, { size: 12, weight: '700', color: accent[0], align: 'center' }));
  days.forEach((d, r) => { const y = top + r * rowH; rrect(ctx, 30, y, x0 - 44, rowH - 8, 8, accent[3]); text(ctx, d, 30 + (x0 - 44) / 2, y + rowH / 2 - 2, { size: 13, weight: '800', color: accent[0], align: 'center' }); for (let c = 0; c < 3; c++) rrect(ctx, x0 + c * colW, y, colW - 8, rowH - 8, 8, '#fff', LINE); });
  const gx = x0 + gw + 14, gw2 = W - gx - 30; rrect(ctx, gx, top, gw2, H - top - 80, 12, accent[0]); text(ctx, 'GROCERIES', gx + 16, top + 28, { size: 13, weight: '800', color: '#fff' });
  for (let i = 0; i < 15; i++) { rrect(ctx, gx + 16, top + 48 + i * 30, 14, 14, 3, null, '#ffffffaa'); rule(ctx, gx + 38, top + 62 + i * 30, gx + gw2 - 16, '#ffffff55', 1); }
  plFoot(ctx);
}
function plBudget(ctx, entry, accent) {
  paper(ctx); plHead(ctx, entry, accent, 'Monthly budget overview');
  kpiRow(ctx, 30, 102, W - 60, [{ label: 'Income', value: '$4,200', color: '#16a34a' }, { label: 'Expenses', value: '$3,140', color: '#dc2626' }, { label: 'Left to save', value: '$1,060', color: accent[0] }]);
  text(ctx, 'Budget by category', 30, 212, { size: 14, weight: '700' });
  drawTable(ctx, 30, 224, W - 60, ['Category', 'Budget', 'Spent', 'Left'], [['Housing', '$1,400', '$1,400', '$0'], ['Groceries', '$600', '$540', '$60'], ['Transport', '$300', '$280', '$20'], ['Utilities', '$280', '$265', '$15'], ['Fun', '$250', '$310', '−$60'], ['Savings', '$600', '$600', '$0']], { right: [1, 2, 3], colorFn: (c, i) => i === 3 ? (String(c).startsWith('−') ? '#dc2626' : '#16a34a') : INK, minRows: 7 });
  const py = 624; rrect(ctx, 30, py, W - 60, 300, 14, '#fff', LINE); text(ctx, 'Spending breakdown', 56, py + 30, { size: 13, weight: '700' }); donut(ctx, 140, py + 165, 80, [{ label: 'Housing', v: 44, c: accent[0] }, { label: 'Food', v: 19, c: '#2563eb' }, { label: 'Transport', v: 12, c: '#f59e0b' }, { label: 'Other', v: 25, c: '#94a3b8' }]); text(ctx, 'Monthly trend', 480, py + 30, { size: 13, weight: '700' }); bars(ctx, 480, py + 58, 250, 180, [8, 9, 7, 10, 9, 11], accent[0], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']);
  plFoot(ctx);
}
function plLog(ctx, entry, accent) {
  paper(ctx); plHead(ctx, entry, accent);
  kpiRow(ctx, 30, 102, W - 60, [{ label: 'This week', value: '5 / 7', color: accent[0] }, { label: 'Current streak', value: '12 days', color: '#16a34a' }, { label: 'Best streak', value: '21 days', color: '#2563eb' }]);
  text(ctx, 'Daily log', 30, 212, { size: 14, weight: '700' });
  drawTable(ctx, 30, 224, W - 60, ['Date', 'Entry', 'Rating', 'Notes'], [['Mon', 'Logged', '4 / 5', 'Felt good'], ['Tue', 'Logged', '3 / 5', 'A bit tired'], ['Wed', 'Logged', '5 / 5', 'Great day'], ['Thu', 'Logged', '4 / 5', ''], ['Fri', 'Logged', '3 / 5', 'Busy'], ['Sat', 'Logged', '5 / 5', 'Restful']], { right: [2], minRows: 9 });
  const py = 644; rrect(ctx, 30, py, W - 60, 280, 14, '#fff', LINE); text(ctx, '30-day trend', 56, py + 30, { size: 13, weight: '700' }); lineChart(ctx, 60, py + 64, W - 120, 170, [3, 4, 3, 5, 4, 4, 5, 4, 3, 5], accent[0]);
  plFoot(ctx);
}
function plChecklist(ctx, entry, accent) {
  paper(ctx); plHead(ctx, entry, accent);
  const secs = [['GET READY', ['Make a plan & timeline', 'Set your budget', 'Gather what you need', 'Tell the right people']], ['THE MAIN WORK', ['Go section by section', 'Label everything clearly', 'Keep essentials handy', 'Check off as you go']], ['WRAP UP', ['Do a final walkthrough', 'Tidy up loose ends', 'Double-check the list', 'Celebrate — done!']]];
  let y = 116;
  secs.forEach(([title, items]) => { rrect(ctx, 40, y, W - 80, 32, 8, accent[3]); rrect(ctx, 40, y, 5, 32, 2, accent[0]); text(ctx, title, 62, y + 21, { size: 13, weight: '800', color: accent[0] }); y += 50; items.forEach((it) => { checkbox(ctx, 56, y - 12, false, accent[0]); text(ctx, it, 86, y, { size: 13.5, color: '#374151' }); rule(ctx, 86, y + 18, W - 60, '#eef0f2', 1); y += 44; }); y += 18; });
  plFoot(ctx);
}
function plMonth(ctx, entry, accent) {
  paper(ctx); plHead(ctx, entry, accent, 'Month  ________________');
  const gw = 540, x = 30, top = 116, labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], colW = gw / 7;
  rrect(ctx, x, top, gw, 28, 6, accent[0]); labels.forEach((d, i) => text(ctx, d, x + i * colW + colW / 2, top + 19, { size: 11, weight: '700', color: '#fff', align: 'center' }));
  const rows = 5, cellH = (H - top - 28 - 80) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < 7; c++) { const cx = x + c * colW, cy = top + 28 + r * cellH; box(ctx, cx, cy, colW, cellH, (c === 0 || c === 6) ? '#fafafa' : '#fff', '#e5e7eb'); rrect(ctx, cx + 5, cy + 5, 16, 13, 3, null, '#dde1e6'); }
  const sx = x + gw + 16, sw = W - sx - 30;
  rrect(ctx, sx, top, sw, 176, 12, '#fff', LINE); text(ctx, 'GOALS', sx + 16, top + 26, { size: 12, weight: '800', color: accent[0] }); for (let i = 0; i < 5; i++) { checkbox(ctx, sx + 16, top + 40 + i * 28, false, accent[0]); rule(ctx, sx + 40, top + 62 + i * 28, sx + sw - 16, '#eef0f2', 1); }
  rrect(ctx, sx, top + 192, sw, 176, 12, '#fff', LINE); text(ctx, "THIS MONTH'S FOCUS", sx + 16, top + 218, { size: 12, weight: '800', color: accent[0] }); ruledLines(ctx, sx + 16, top + 240, sw - 32, 5, 28);
  rrect(ctx, sx, top + 384, sw, H - top - 384 - 80, 12, '#fff', LINE); text(ctx, 'NOTES', sx + 16, top + 410, { size: 12, weight: '800', color: accent[0] }); ruledLines(ctx, sx + 16, top + 432, sw - 32, 6, 28);
  plFoot(ctx);
}
const PL_ROUND = [plDaily, plWeekly, plChecklist, plLog, plMonth];
const PL_ORDER = entries.filter((e) => e.category === 'planner').map((e) => e.slug);
function renderPlanner(ctx, entry) {
  const s = entry.slug, idx = Math.max(0, PL_ORDER.indexOf(s)), accent = BK_ACCENTS[(idx * 3 + 4) % BK_ACCENTS.length];
  if (/daily-planner/.test(s)) return plDaily(ctx, entry, accent);
  if (/weekly-planner|weekly-todo|content-calendar/.test(s)) return plWeekly(ctx, entry, accent);
  if (/habit/.test(s)) return plHabit(ctx, entry, accent);
  if (/meal/.test(s)) return plMeal(ctx, entry, accent);
  if (/budget|money|saving|debt|sinking|expense|bill-payment/.test(s)) return plBudget(ctx, entry, accent);
  if (/checklist|packing|grocery|brain-dump|cleaning|moving|declutter|shower/.test(s)) return plChecklist(ctx, entry, accent);
  if (/monthly|family-calendar|christmas|yearly|birthday|party|garden|renovation|travel|road-trip|homeschool|study|academic|wedding|self-care|pregnancy/.test(s)) return plMonth(ctx, entry, accent);
  if (/tracker|log|journal|mood|sleep|water|medication|reading|workout|fasting|period|prayer|gratitude|dog|baby|newborn|potty|chore|password|goal|project/.test(s)) return plLog(ctx, entry, accent);
  return PL_ROUND[idx % PL_ROUND.length](ctx, entry, accent);
}

// ============================================================
//  Letters & contracts previews — distinct document layouts
// ============================================================
function letFoot(ctx) { text(ctx, 'FREE  ·  Word (.docx) + Google Docs  ·  Edit & print', W / 2, H - 18, { size: 13, color: MUTED, align: 'center' }); watermark(ctx); }
const DOC_FILLER = [
  'The parties agree to the terms set forth herein and acknowledge that this section governs the rights and obligations described below.',
  'Each party shall perform its responsibilities in good faith and in accordance with all applicable laws and regulations.',
  'This provision shall remain in effect for the duration of the agreement unless terminated earlier in accordance with the terms herein.',
  'Any notice required under this document shall be made in writing and delivered to the address provided by each party.',
  'The undersigned acknowledges that they have read, understood, and agree to be bound by the terms described in this document.',
  'In the event of a dispute, the parties shall first attempt to resolve the matter in good faith before pursuing further remedies.',
  'This document represents the entire understanding between the parties and supersedes any prior agreements on the subject matter.',
  'I am writing to formally address the matter described below and to request your timely attention and response.',
];
const pickDoc = (slug, i) => DOC_FILLER[hash(slug + 'd' + i) % DOC_FILLER.length];
function letFormal(ctx, entry, accent) {
  paper(ctx);
  const nm = nameFor(entry.slug);
  text(ctx, nm.full, 60, 84, { size: 18, weight: '700' });
  [cityFor(entry.slug), phoneFor(entry.slug), emailFor(nm)].forEach((l, i) => text(ctx, l, 60, 108 + i * 18, { size: 12, color: MUTED }));
  rule(ctx, 60, 176, W - 60, accent[0], 2);
  text(ctx, 'May 14, 2026', 60, 212, { size: 12, color: MUTED });
  let y = 252;
  text(ctx, 'Recipient Name', 60, y, { size: 13, weight: '600' });
  ['Title', 'Company Name', '500 Business Plaza', 'San Francisco, CA 94104'].forEach((l, i) => text(ctx, l, 60, y + 20 + i * 18, { size: 12, color: MUTED }));
  y = 382; text(ctx, 'Dear [Recipient],', 60, y, { size: 13 }); y += 30;
  for (let p = 0; p < 4; p++) y = wrappedText(ctx, pickDoc(entry.slug, p) + ' ' + pickDoc(entry.slug, p + 10), 60, y, W - 120, 19, { size: 12.5, color: '#374151' }) + 22;
  y += 8; text(ctx, 'Sincerely,', 60, y, { size: 13 }); text(ctx, nm.full, 60, y + 50, { size: 18, serif: true, italic: true });
  letFoot(ctx);
}
function letContract(ctx, entry, accent) {
  paper(ctx);
  text(ctx, entry.title.toUpperCase(), W / 2, 84, { size: 23, weight: '800', align: 'center' });
  rule(ctx, W / 2 - 90, 102, W / 2 + 90, accent[0], 2);
  text(ctx, 'This Agreement is entered into on May 14, 2026, by and between:', 60, 146, { size: 12.5, color: '#374151' });
  text(ctx, 'Party A', 60, 182, { size: 12.5, weight: '700' }); rule(ctx, 150, 184, 430, '#cbd5e1', 1);
  text(ctx, 'Party B', 60, 210, { size: 12.5, weight: '700' }); rule(ctx, 150, 212, 430, '#cbd5e1', 1);
  let y = 256;
  const clauses = ['Purpose & Scope', 'Term', 'Responsibilities', 'Compensation / Consideration', 'Confidentiality', 'Termination', 'Governing Law'];
  clauses.forEach((c, i) => { text(ctx, `${i + 1}.  ${c}`, 60, y, { size: 13, weight: '700', color: accent[0] }); y = wrappedText(ctx, pickDoc(entry.slug, i), 80, y + 22, W - 140, 18, { size: 12, color: '#374151' }) + 22; });
  const sy = H - 150;
  rule(ctx, 60, sy, 330, '#9ca3af', 1); text(ctx, 'Party A — Signature', 60, sy + 18, { size: 11, color: MUTED });
  text(ctx, 'Date', 60, sy + 46, { size: 11, color: MUTED }); rule(ctx, 100, sy + 50, 330, '#9ca3af', 1);
  rule(ctx, W - 330, sy, W - 60, '#9ca3af', 1); text(ctx, 'Party B — Signature', W - 330, sy + 18, { size: 11, color: MUTED });
  text(ctx, 'Date', W - 330, sy + 46, { size: 11, color: MUTED }); rule(ctx, W - 290, sy + 50, W - 60, '#9ca3af', 1);
  letFoot(ctx);
}
function letForm(ctx, entry, accent) {
  paper(ctx);
  box(ctx, 0, 0, W, 80, accent[0]); text(ctx, entry.title, 36, 50, { size: 24, weight: '800', color: '#fff' });
  const fields = ['Full Name', 'Date', 'Address', 'Phone', 'Email', 'Item / Description', 'Amount / Price', 'Reference / ID #', 'Conditions'];
  let y = 124;
  fields.forEach((label) => { text(ctx, label.toUpperCase(), 50, y, { size: 11, weight: '700', color: '#64748b' }); rrect(ctx, 50, y + 10, W - 100, 36, 6, '#fff', LINE); y += 60; });
  const sy = y + 6; text(ctx, 'SIGNATURE', 50, sy, { size: 11, weight: '700', color: '#64748b' }); rule(ctx, 50, sy + 40, 360, '#9ca3af', 1);
  text(ctx, 'DATE', W - 300, sy, { size: 11, weight: '700', color: '#64748b' }); rule(ctx, W - 300, sy + 40, W - 50, '#9ca3af', 1);
  letFoot(ctx);
}
function letNotice(ctx, entry, accent) {
  paper(ctx);
  text(ctx, entry.title.toUpperCase(), W / 2, 124, { size: 25, weight: '800', align: 'center' });
  rule(ctx, W / 2 - 110, 144, W / 2 + 110, accent[0], 2);
  text(ctx, 'Date:  May 14, 2026', 60, 204, { size: 12.5, color: MUTED });
  text(ctx, 'To:  _______________________________', 60, 238, { size: 13 });
  let y = 296;
  for (let p = 0; p < 3; p++) y = wrappedText(ctx, pickDoc(entry.slug, p) + ' ' + pickDoc(entry.slug, p + 20), 60, y, W - 120, 20, { size: 13, color: '#374151' }) + 26;
  y += 36; text(ctx, 'Sincerely,', 60, y, { size: 13 });
  rule(ctx, 60, y + 64, 330, '#9ca3af', 1); text(ctx, 'Signature', 60, y + 82, { size: 11, color: MUTED });
  letFoot(ctx);
}
const LET_ROUND = [letFormal, letContract];
const LET_ORDER = entries.filter((e) => e.category === 'letters').map((e) => e.slug);
function renderLetters(ctx, entry) {
  const s = entry.slug, idx = Math.max(0, LET_ORDER.indexOf(s)), accent = BK_ACCENTS[(idx * 3 + 5) % BK_ACCENTS.length];
  if (/nda|agreement|contract|non-compete|promissory|partnership|lease|sublease|roommate|addendum|power-of-attorney/.test(s)) return letContract(ctx, entry, accent);
  if (/bill-of-sale|rental-application|photo-release|verification|authorization|consent/.test(s)) return letForm(ctx, entry, accent);
  if (/notice|release-of-liability|two-weeks|eviction|cease|late-rent/.test(s)) return letNotice(ctx, entry, accent);
  return letFormal(ctx, entry, accent);
}

// ============================================================
//  Small business ops previews — distinct layouts
// ============================================================
function bizFoot(ctx) { text(ctx, 'FREE  ·  Editable  ·  Word / Excel + Google', W / 2, H - 18, { size: 13, color: MUTED, align: 'center' }); watermark(ctx); }
function bizDoc(ctx, entry, accent) {
  paper(ctx);
  text(ctx, entry.title, 60, 92, { size: 27, weight: '800' });
  text(ctx, 'Prepared by Hartford & Co.     ·     May 14, 2026', 60, 124, { size: 13, color: MUTED, italic: true });
  rule(ctx, 60, 146, W - 60, accent[0], 3);
  const sections = ['EXECUTIVE SUMMARY', 'OBJECTIVES', 'STRATEGY & APPROACH', 'KEY ACTIVITIES', 'TIMELINE & MILESTONES', 'MEASURES OF SUCCESS'];
  let y = 192;
  sections.forEach((s, i) => { text(ctx, s, 60, y, { size: 14, weight: '800', color: accent[0] }); y = wrappedText(ctx, pickDoc(entry.slug, i) + ' ' + pickDoc(entry.slug, i + 30), 60, y + 24, W - 120, 18, { size: 12, color: '#374151' }) + 30; });
  bizFoot(ctx);
}
function bizDash(ctx, entry, accent) {
  paper(ctx); plHead(ctx, entry, accent, 'Key metrics at a glance');
  kpiRow(ctx, 30, 102, W - 60, [{ label: 'MRR', value: '$48.2k', color: accent[0] }, { label: 'Customers', value: '1,284', color: '#2563eb' }, { label: 'Churn', value: '2.1%', color: '#dc2626' }]);
  text(ctx, 'Performance vs target', 30, 212, { size: 14, weight: '700' });
  drawTable(ctx, 30, 224, W - 60, ['Metric', 'Target', 'Actual', 'Status'], [['New MRR', '$8,000', '$9,400', 'Ahead'], ['Churn', '< 3%', '2.1%', 'Good'], ['CAC', '$220', '$198', 'Good'], ['LTV', '$2,400', '$2,610', 'Good'], ['Conversion', '4.0%', '3.6%', 'Behind'], ['NPS', '45', '52', 'Good']], { right: [1, 2], colorFn: (c, i) => i === 3 ? (c === 'Behind' ? '#dc2626' : '#16a34a') : INK, minRows: 7 });
  const py = 624; rrect(ctx, 30, py, W - 60, 300, 14, '#fff', LINE); text(ctx, 'Revenue split', 56, py + 30, { size: 13, weight: '700' }); donut(ctx, 140, py + 165, 80, [{ label: 'Subscriptions', v: 62, c: accent[0] }, { label: 'Services', v: 24, c: '#2563eb' }, { label: 'Add-ons', v: 14, c: '#f59e0b' }]); text(ctx, 'Growth trend', 480, py + 30, { size: 13, weight: '700' }); bars(ctx, 480, py + 58, 250, 180, [28, 32, 35, 39, 44, 48], accent[0], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']);
  bizFoot(ctx);
}
function bizTable(ctx, entry, accent) {
  paper(ctx); plHead(ctx, entry, accent, 'Pipeline & deals');
  kpiRow(ctx, 30, 102, W - 60, [{ label: 'Open deals', value: '24', color: accent[0] }, { label: 'Pipeline value', value: '$182k', color: '#16a34a' }, { label: 'Win rate', value: '31%', color: '#2563eb' }]);
  text(ctx, 'Deals', 30, 212, { size: 14, weight: '700' });
  drawTable(ctx, 30, 224, W - 60, ['Company', 'Stage', 'Owner', 'Value', 'Close'], [['Acme Co', 'Proposal', 'M. Rivera', '$24,000', 'Jun 30'], ['Bright LLC', 'Negotiation', 'A. Chen', '$12,400', 'Jun 22'], ['Nova Group', 'Discovery', 'J. Brooks', '$8,800', 'Jul 15'], ['Pine & Co', 'Won', 'S. Park', '$15,200', 'Jun 10'], ['Vertex', 'Proposal', 'D. Hayes', '$31,000', 'Jul 02'], ['Orbit', 'Discovery', 'R. Stone', '$6,100', 'Jul 20'], ['Lumen', 'Negotiation', 'M. Rivera', '$9,400', 'Jun 28']], { right: [3], minRows: 11 });
  bizFoot(ctx);
}
function bizMatrix(ctx, entry, accent) {
  paper(ctx); plHead(ctx, entry, accent, 'Four-quadrant analysis');
  const quads = [['STRENGTHS', '#16a34a'], ['WEAKNESSES', '#dc2626'], ['OPPORTUNITIES', '#2563eb'], ['THREATS', '#f59e0b']];
  const top = 110, gap = 16, qw = (W - 60 - gap) / 2, qh = (H - top - 70 - gap) / 2;
  quads.forEach((q, i) => { const x = 30 + (i % 2) * (qw + gap), y = top + Math.floor(i / 2) * (qh + gap); rrect(ctx, x, y, qw, qh, 12, '#ffffff', q[1]); rrect(ctx, x, y, qw, 34, 8, q[1]); text(ctx, q[0], x + 16, y + 23, { size: 13, weight: '800', color: '#fff' }); for (let l = 0; l < 5; l++) { ctx.fillStyle = q[1]; ctx.beginPath(); ctx.arc(x + 24, y + 60 + l * 32, 3.5, 0, Math.PI * 2); ctx.fill(); rule(ctx, x + 38, y + 64 + l * 32, x + qw - 18, '#e5e7eb', 1); } });
  bizFoot(ctx);
}
function bizSurvey(ctx, entry, accent) {
  paper(ctx); plHead(ctx, entry, accent, 'Please rate each item from 1 (low) to 5 (high)');
  const qs = ['Overall satisfaction', 'Quality of work / service', 'Communication & responsiveness', 'Value for the price', 'Likelihood to recommend', 'Met expectations'];
  let y = 138;
  qs.forEach((q, i) => { text(ctx, `${i + 1}.  ${q}`, 50, y, { size: 13.5, weight: '600' }); for (let r = 0; r < 5; r++) { const cx = W - 250 + r * 46; ctx.beginPath(); ctx.arc(cx, y - 5, 11, 0, Math.PI * 2); if (i % 5 === r) { ctx.fillStyle = accent[2]; ctx.fill(); } ctx.strokeStyle = accent[0]; ctx.lineWidth = 2; ctx.stroke(); text(ctx, String(r + 1), cx, y - 1, { size: 10, color: MUTED, align: 'center' }); } y += 58; });
  y += 8; rule(ctx, 50, y, W - 50, '#e5e7eb', 1); y += 26; text(ctx, 'Additional comments', 50, y, { size: 13, weight: '800', color: accent[0] }); ruledLines(ctx, 50, y + 26, W - 100, 5, 30);
  bizFoot(ctx);
}
function bizCanvas(ctx, entry, accent) {
  paper(ctx); plHead(ctx, entry, accent, 'Your whole plan on one page');
  const cells = ['Problem', 'Solution', 'Unique Value', 'Customer Segments', 'Channels', 'Revenue Streams', 'Cost Structure', 'Key Metrics', 'Unfair Advantage'];
  const gap = 14, cw = (W - 60 - gap * 2) / 3, top = 110, ch = (H - top - 70 - gap * 2) / 3;
  cells.forEach((c, i) => { const x = 30 + (i % 3) * (cw + gap), y = top + Math.floor(i / 3) * (ch + gap); rrect(ctx, x, y, cw, ch, 10, '#fff', LINE); rrect(ctx, x, y, cw, 28, 8, accent[3]); text(ctx, c, x + 12, y + 19, { size: 11.5, weight: '800', color: accent[0] }); ruledLines(ctx, x + 12, y + 50, cw - 24, 3, 24); });
  bizFoot(ctx);
}
const BIZ_ROUND = [bizDoc, bizDash, bizTable, bizCanvas];
const BIZ_ORDER = entries.filter((e) => e.category === 'business').map((e) => e.slug);
function renderBusiness(ctx, entry) {
  const s = entry.slug, idx = Math.max(0, BIZ_ORDER.indexOf(s)), accent = BK_ACCENTS[(idx * 3 + 6) % BK_ACCENTS.length];
  if (/swot|risk-assessment|competitor-analysis/.test(s)) return bizMatrix(ctx, entry, accent);
  if (/survey|feedback|nps|review|one-on-one|exit-interview|meeting-agenda|onboarding/.test(s)) return bizSurvey(ctx, entry, accent);
  if (/calculator|saas-metrics|acquisition|funnel|okr|kpi|dashboard|break-even|margin|roi|marketing-budget/.test(s)) return bizDash(ctx, entry, accent);
  if (/tracker|pipeline|lead|commission|vendor-comparison/.test(s)) return bizTable(ctx, entry, accent);
  if (/canvas|persona|value-prop/.test(s)) return bizCanvas(ctx, entry, accent);
  return bizDoc(ctx, entry, accent);
}

// ============================================================
//  Teachers & students previews — distinct classroom layouts
// ============================================================
function eduFoot(ctx) { text(ctx, 'FREE  ·  Printable + editable  ·  Word / PDF + Google', W / 2, H - 18, { size: 13, color: MUTED, align: 'center' }); watermark(ctx); }
function eduLesson(ctx, entry, accent) {
  paper(ctx);
  box(ctx, 0, 0, W, 80, accent[0]); text(ctx, entry.title, 36, 50, { size: 23, weight: '800', color: '#fff' });
  [['Teacher', nameFor(entry.slug).full], ['Date', 'May 14, 2026'], ['Grade', '5th Grade'], ['Subject', 'Mathematics']].forEach(([label, val], i) => { const x = 40 + (i % 2) * (W / 2 - 20); const y = 124 + Math.floor(i / 2) * 52; text(ctx, label.toUpperCase(), x, y, { size: 11, weight: '700', color: '#64748b' }); text(ctx, val, x, y + 22, { size: 14 }); rule(ctx, x, y + 30, x + W / 2 - 90, '#cbd5e1', 1); });
  const sections = [['OBJECTIVES', 'Students will be able to apply the lesson\'s key concept to solve real-world problems independently.'], ['MATERIALS', 'Printed worksheets, manipulatives, whiteboards, and the day\'s slide deck.'], ['LESSON SEQUENCE', 'Warm-up, direct instruction, guided practice in pairs, independent work, and a closing reflection.'], ['ASSESSMENT', 'Exit ticket scored 0–3; students below 2 are flagged for small-group review.']];
  let y = 248;
  sections.forEach(([t, b]) => { text(ctx, t, 40, y, { size: 14, weight: '800', color: accent[0] }); box(ctx, 40, y + 12, W - 80, 108, '#f9fafb', '#e5e7eb'); wrappedText(ctx, b, 58, y + 38, W - 116, 18, { size: 12, color: '#374151' }); y += 146; });
  eduFoot(ctx);
}
function eduGradebook(ctx, entry, accent) {
  paper(ctx);
  box(ctx, 0, 0, W, 70, accent[0]); text(ctx, entry.title, 36, 44, { size: 23, weight: '800', color: '#fff' });
  const cols = ['Student', 'HW 1', 'Quiz', 'Project', 'Test', 'Average'];
  const rows = [['Avery B.', '95', '88', '92', '90', 'A−'], ['Marcus C.', '78', '82', '85', '80', 'B−'], ['Sofia D.', '100', '96', '98', '99', 'A+'], ['Liam H.', '84', '79', '88', '83', 'B'], ['Nora P.', '91', '94', '90', '93', 'A'], ['Ethan R.', '72', '68', '75', '70', 'C'], ['Maya S.', '88', '90', '86', '89', 'B+'], ['Owen T.', '96', '92', '94', '95', 'A']];
  drawTable(ctx, 30, 100, W - 60, cols, rows, { right: [1, 2, 3, 4, 5], colorFn: (c, i) => i === 5 ? accent[0] : (i >= 1 && Number(c) < 75 ? '#dc2626' : INK), minRows: 14 });
  eduFoot(ctx);
}
function eduFlashcards(ctx, entry, accent) {
  paper(ctx);
  box(ctx, 0, 0, W, 70, accent[0]); text(ctx, entry.title, 36, 44, { size: 23, weight: '800', color: '#fff' });
  const cols = 2, rows = 4, gap = 16, cw = (W - 60 - gap) / 2, top = 100, ch = (H - top - 60 - gap * (rows - 1)) / rows;
  for (let i = 0; i < cols * rows; i++) { const x = 30 + (i % 2) * (cw + gap), y = top + Math.floor(i / 2) * (ch + gap); rrect(ctx, x, y, cw, ch, 12, '#fff', LINE); ctx.setLineDash([4, 4]); rule(ctx, x + 16, y + ch / 2, x + cw - 16, '#d1d5db', 1); ctx.setLineDash([]); text(ctx, 'Front', x + 16, y + 24, { size: 10, weight: '700', color: accent[0] }); text(ctx, 'Back', x + 16, y + ch / 2 + 22, { size: 10, weight: '700', color: MUTED }); }
  eduFoot(ctx);
}
function eduChart(ctx, entry, accent) {
  paper(ctx);
  box(ctx, 0, 0, W, 70, accent[0]); text(ctx, entry.title, 36, 44, { size: 23, weight: '800', color: '#fff' });
  text(ctx, 'Name  __________________      Week of  ____________', 30, 100, { size: 12.5, color: '#475569' });
  const cols = 5, rows = 6, gap = 12, top = 130, cw = (W - 60 - gap * (cols - 1)) / cols, ch = (H - top - 60 - gap * (rows - 1)) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const x = 30 + c * (cw + gap), y = top + r * (ch + gap); rrect(ctx, x, y, cw, ch, 10, (r + c) % 2 ? '#f9fafb' : '#fff', '#e5e7eb'); ctx.strokeStyle = accent[2]; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x + cw / 2, y + ch / 2, Math.min(cw, ch) * 0.28, 0, Math.PI * 2); ctx.stroke(); }
  eduFoot(ctx);
}
function eduSyllabus(ctx, entry, accent) {
  paper(ctx);
  text(ctx, entry.title, 60, 90, { size: 26, weight: '800' });
  text(ctx, 'Course  ·  Term Fall 2026  ·  Instructor: ' + nameFor(entry.slug).full, 60, 120, { size: 13, color: MUTED });
  rule(ctx, 60, 140, W - 60, accent[0], 3);
  drawTable(ctx, 30, 168, W - 60, ['Week', 'Topic', 'Reading', 'Due'], [['1', 'Introduction & overview', 'Ch. 1', '—'], ['2', 'Foundations', 'Ch. 2–3', 'HW 1'], ['3', 'Core concepts', 'Ch. 4', 'Quiz 1'], ['4', 'Application', 'Ch. 5', 'Project'], ['5', 'Deep dive', 'Ch. 6–7', 'HW 2'], ['6', 'Review', 'Notes', 'Midterm'], ['7', 'Advanced topics', 'Ch. 8', 'HW 3'], ['8', 'Synthesis', 'Ch. 9', 'Paper'], ['9', 'Presentations', '—', 'Slides'], ['10', 'Final review', 'All', 'Final']], { right: [], minRows: 12 });
  eduFoot(ctx);
}
const EDU_ROUND = [eduLesson, eduChart, eduSyllabus];
const EDU_ORDER = entries.filter((e) => e.category === 'education').map((e) => e.slug);
function renderEducationCat(ctx, entry) {
  const s = entry.slug, idx = Math.max(0, EDU_ORDER.indexOf(s)), accent = BK_ACCENTS[(idx * 3 + 7) % BK_ACCENTS.length];
  if (/gradebook|attendance|iep|report-card|progress-report|communication-log/.test(s)) return eduGradebook(ctx, entry, accent);
  if (/flashcard|exit-ticket/.test(s)) return eduFlashcards(ctx, entry, accent);
  if (/seating|behavior|sticker|reward|multiplication|graphic-organizer|chart/.test(s)) return eduChart(ctx, entry, accent);
  if (/syllabus|semester|exam-study|schedule|calendar/.test(s)) return eduSyllabus(ctx, entry, accent);
  return eduLesson(ctx, entry, accent);
}

// ============================================================
//  Email signature previews — distinct signature styles
// ============================================================
function sigHeader(ctx, entry) { text(ctx, entry.title, W / 2, 86, { size: 23, weight: '800', align: 'center' }); text(ctx, 'Copy & paste into Gmail, Outlook, or Apple Mail', W / 2, 116, { size: 13, color: MUTED, align: 'center' }); }
function sigFootBand(ctx) { box(ctx, 0, H - 90, W, 90, '#fffbeb'); text(ctx, 'FREE  ·  HTML + Google Docs versions  ·  Renders in every email client', W / 2, H - 45, { size: 13, color: '#92400e', align: 'center' }); watermark(ctx); }
function socialIcons(ctx, x, y, accent, r) {
  const items = [['in', '#0a66c2'], ['f', '#1877f2'], ['ig', '#e1306c'], ['x', '#111827'], ['@', accent[0]]];
  items.forEach((s, i) => { const cx = x + i * (r * 2 + 12) + r; ctx.fillStyle = s[1]; ctx.beginPath(); ctx.arc(cx, y, r, 0, Math.PI * 2); ctx.fill(); text(ctx, s[0], cx, y + r * 0.34, { size: r * 0.85, weight: '700', color: '#fff', align: 'center' }); });
}
function sigContact(ctx, x, y, nm, accent, gap) {
  text(ctx, 'P   ' + phoneFor('x' + nm.full), x, y, { size: 12 });
  text(ctx, 'E   ' + emailFor(nm), x, y + gap, { size: 12 });
  text(ctx, 'W   acme.example.com', x, y + gap * 2, { size: 12, color: accent[0] });
}
function sigPhoto(ctx, entry, accent) {
  paper(ctx); sigHeader(ctx, entry);
  const nm = nameFor(entry.slug), cx = 90, cy = 178, cw = W - 180, ch = 280;
  rrect(ctx, cx, cy, cw, ch, 16, '#fff', LINE);
  avatarCircle(ctx, cx + 104, cy + ch / 2, 64, null, [accent[0], accent[1]]);
  box(ctx, cx + 210, cy + 40, 3, ch - 80, accent[0]);
  text(ctx, nm.full, cx + 238, cy + 92, { size: 24, weight: '700' });
  text(ctx, titleForResume(entry.slug), cx + 238, cy + 120, { size: 13, color: MUTED });
  text(ctx, 'Acme Corporation', cx + 238, cy + 150, { size: 13, weight: '600', color: accent[0] });
  sigContact(ctx, cx + 238, cy + 186, nm, accent, 24);
  sigFootBand(ctx);
}
function sigBanner(ctx, entry, accent) {
  paper(ctx); sigHeader(ctx, entry);
  const nm = nameFor(entry.slug), cx = 90, cy = 178, cw = W - 180, ch = 300;
  rrect(ctx, cx, cy, cw, ch, 16, '#fff', LINE);
  rrect(ctx, cx, cy, cw, 96, 16, accent[0]); box(ctx, cx, cy + 80, cw, 16, accent[0]);
  text(ctx, nm.full, cx + 30, cy + 46, { size: 25, weight: '800', color: '#fff' });
  text(ctx, titleForResume(entry.slug) + '   ·   Acme Corporation', cx + 30, cy + 74, { size: 13, color: '#ffffffdd' });
  sigContact(ctx, cx + 30, cy + 140, nm, accent, 26);
  socialIcons(ctx, cx + 30, cy + 250, accent, 15);
  sigFootBand(ctx);
}
function sigMinimal(ctx, entry, accent) {
  paper(ctx); sigHeader(ctx, entry);
  const nm = nameFor(entry.slug), cx = 130, cy = 220;
  text(ctx, 'Best regards,', cx, cy, { size: 14, color: MUTED, italic: true });
  text(ctx, nm.full, cx, cy + 52, { size: 23, weight: '800' });
  text(ctx, titleForResume(entry.slug) + '   |   Acme Corporation', cx, cy + 80, { size: 13, color: MUTED });
  box(ctx, cx, cy + 100, 280, 3, accent[0]);
  text(ctx, phoneFor(entry.slug) + '     ·     ' + emailFor(nm), cx, cy + 134, { size: 12.5, color: '#374151' });
  text(ctx, 'acme.example.com', cx, cy + 158, { size: 12.5, color: accent[0] });
  sigFootBand(ctx);
}
function sigCorporate(ctx, entry, accent) {
  paper(ctx); sigHeader(ctx, entry);
  const nm = nameFor(entry.slug), cx = 90, cy = 188, cw = W - 180, ch = 250;
  rrect(ctx, cx, cy, cw, ch, 12, '#fff', LINE);
  rrect(ctx, cx + 30, cy + 55, 120, 120, 12, accent[0]); text(ctx, nm.initials, cx + 90, cy + 132, { size: 42, weight: '800', color: '#fff', align: 'center' });
  box(ctx, cx + 184, cy + 44, 2, ch - 88, '#e5e7eb');
  const tx = cx + 214;
  text(ctx, nm.full, tx, cy + 74, { size: 22, weight: '700' });
  text(ctx, titleForResume(entry.slug), tx, cy + 100, { size: 13, color: MUTED });
  text(ctx, 'ACME CORPORATION', tx, cy + 130, { size: 12, weight: '800', color: accent[0] });
  [['Tel', phoneFor(entry.slug)], ['Email', emailFor(nm)], ['Web', 'acme.example.com']].forEach(([k, v], i) => { text(ctx, k, tx, cy + 166 + i * 24, { size: 11, weight: '700', color: MUTED }); text(ctx, v, tx + 52, cy + 166 + i * 24, { size: 12 }); });
  sigFootBand(ctx);
}
function sigSocial(ctx, entry, accent) {
  paper(ctx); sigHeader(ctx, entry);
  const nm = nameFor(entry.slug), cx = 90, cy = 188, cw = W - 180, ch = 250;
  rrect(ctx, cx, cy, cw, ch, 16, '#fff', LINE);
  rrect(ctx, cx, cy, 8, ch, 4, accent[0]);
  text(ctx, nm.full, cx + 44, cy + 64, { size: 26, weight: '800' });
  text(ctx, titleForResume(entry.slug) + '   ·   Acme Corporation', cx + 44, cy + 94, { size: 13, color: MUTED });
  text(ctx, emailFor(nm) + '     ·     ' + phoneFor(entry.slug), cx + 44, cy + 130, { size: 12.5, color: '#374151' });
  text(ctx, 'Connect with me:', cx + 44, cy + 172, { size: 12, color: MUTED, weight: '600' });
  socialIcons(ctx, cx + 44, cy + 202, accent, 18);
  sigFootBand(ctx);
}
const SIG_ROUND = [sigPhoto, sigBanner, sigCorporate, sigSocial, sigMinimal];
const SIG_ORDER = entries.filter((e) => e.category === 'email').map((e) => e.slug);
function renderEmailCat(ctx, entry) {
  const s = entry.slug, idx = Math.max(0, SIG_ORDER.indexOf(s)), accent = BK_ACCENTS[(idx * 3 + 1) % BK_ACCENTS.length];
  if (/minimal|plain-text/.test(s)) return sigMinimal(ctx, entry, accent);
  if (/photo|healthcare|real-estate|realtor|teacher/.test(s)) return sigPhoto(ctx, entry, accent);
  if (/social|influencer|creative|marketing|agency|photographer|freelanc/.test(s)) return sigSocial(ctx, entry, accent);
  if (/executive|law|banking|finance|professional|founder|recruiter/.test(s)) return sigCorporate(ctx, entry, accent);
  return SIG_ROUND[idx % SIG_ROUND.length](ctx, entry, accent);
}

// ============================================================
//  Checklist / Finance / Wedding / Health previews
//  Reuse the planner building blocks with category-specific
//  accent rotations + keyword routing so each looks distinct.
// ============================================================
const CHK_ORDER = entries.filter((e) => e.category === 'checklist').map((e) => e.slug);
function renderChecklist(ctx, entry) {
  const s = entry.slug, idx = Math.max(0, CHK_ORDER.indexOf(s)), accent = BK_ACCENTS[(idx * 3 + 6) % BK_ACCENTS.length];
  if (/grocery|shopping/.test(s)) return plMeal(ctx, entry, accent);
  if (/routine|daily/.test(s)) return plDaily(ctx, entry, accent);
  if (/baby|household-binder|home-buyer|event-planning|back-to-school/.test(s)) return plMonth(ctx, entry, accent);
  return plChecklist(ctx, entry, accent);
}

const FIN_ORDER = entries.filter((e) => e.category === 'finance').map((e) => e.slug);
function renderFinance(ctx, entry) {
  const s = entry.slug, idx = Math.max(0, FIN_ORDER.indexOf(s)), accent = BK_ACCENTS[(idx * 3 + 7) % BK_ACCENTS.length];
  if (/budget|paycheck|50-30-20/.test(s)) return plBudget(ctx, entry, accent);
  if (/debt|net-worth|savings|emergency-fund|goals|sinking/.test(s)) return plLog(ctx, entry, accent);
  if (/bill-payment|subscription|no-spend/.test(s)) return plMonth(ctx, entry, accent);
  return plBudget(ctx, entry, accent);
}

const WED_ORDER = entries.filter((e) => e.category === 'wedding').map((e) => e.slug);
function renderWedding(ctx, entry) {
  const s = entry.slug, idx = Math.max(0, WED_ORDER.indexOf(s)), accent = BK_ACCENTS[(idx * 3 + 8) % BK_ACCENTS.length];
  if (/budget|meal/.test(s)) return plBudget(ctx, entry, accent);
  if (/guest-list|rsvp|vendor/.test(s)) return plLog(ctx, entry, accent);
  if (/timeline|day/.test(s)) return plDaily(ctx, entry, accent);
  if (/checklist|registry|vows/.test(s)) return plChecklist(ctx, entry, accent);
  return plMonth(ctx, entry, accent);
}

const HLT_ORDER = entries.filter((e) => e.category === 'health').map((e) => e.slug);
function renderHealth(ctx, entry) {
  const s = entry.slug, idx = Math.max(0, HLT_ORDER.indexOf(s)), accent = BK_ACCENTS[(idx * 3 + 9) % BK_ACCENTS.length];
  if (/meal/.test(s)) return plMeal(ctx, entry, accent);
  if (/workout-planner|fitness-goal/.test(s)) return plWeekly(ctx, entry, accent);
  if (/self-care|medication/.test(s)) return plChecklist(ctx, entry, accent);
  if (/water|sleep|step|food-diary/.test(s)) return plMonth(ctx, entry, accent);
  return plLog(ctx, entry, accent);
}

// ============================================================
//  Kids / Certificate / Social previews
// ============================================================
const KID_ORDER = entries.filter((e) => e.category === 'kids').map((e) => e.slug);
function renderKids(ctx, entry) {
  const s = entry.slug, idx = Math.max(0, KID_ORDER.indexOf(s)), accent = BK_ACCENTS[(idx * 3 + 2) % BK_ACCENTS.length];
  if (/chore|reward|sticker|behavior|potty|screen-time/.test(s)) return plHabit(ctx, entry, accent);
  if (/allowance|savings/.test(s)) return plBudget(ctx, entry, accent);
  if (/reading-log/.test(s)) return plLog(ctx, entry, accent);
  if (/routine/.test(s)) return plDaily(ctx, entry, accent);
  if (/command-center/.test(s)) return plWeekly(ctx, entry, accent);
  return plChecklist(ctx, entry, accent);
}

// Decorative certificate — distinct from every other layout.
function certAward(ctx, entry, accent) {
  paper(ctx);
  box(ctx, 0, 0, W, H, accent[3]);
  // Double border
  ctx.strokeStyle = accent[0]; ctx.lineWidth = 6; ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.strokeStyle = accent[1]; ctx.lineWidth = 2; ctx.strokeRect(54, 54, W - 108, H - 108);
  // Corner flourishes
  [[64, 64], [W - 64, 64], [64, H - 64], [W - 64, H - 64]].forEach(([cx, cy]) => { ctx.fillStyle = accent[0]; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill(); });
  const cy = 170;
  text(ctx, 'CERTIFICATE', W / 2, cy, { size: 44, weight: '800', align: 'center', color: accent[0] });
  const sub = /completion/.test(entry.slug) ? 'OF COMPLETION' : /participation/.test(entry.slug) ? 'OF PARTICIPATION' : /gift/.test(entry.slug) ? 'GIFT CERTIFICATE' : 'OF ACHIEVEMENT';
  text(ctx, sub, W / 2, cy + 36, { size: 17, weight: '700', align: 'center', color: MUTED });
  rule(ctx, W / 2 - 70, cy + 58, W / 2 + 70, accent[0], 2);
  text(ctx, 'This certificate is proudly presented to', W / 2, cy + 116, { size: 15, align: 'center', color: '#374151', italic: true });
  const nm = nameFor(entry.slug);
  text(ctx, nm.full, W / 2, cy + 176, { size: 42, align: 'center', serif: true, italic: true, color: INK });
  rule(ctx, W / 2 - 220, cy + 196, W / 2 + 220, '#cbd5e1', 1);
  let y = cy + 246;
  ['in recognition of outstanding effort and dedication,', 'and for successfully meeting every requirement with', 'excellence. Awarded with sincere congratulations.'].forEach((l) => { text(ctx, l, W / 2, y, { size: 14, align: 'center', color: '#4b5563' }); y += 26; });
  // Seal
  const sx = W / 2, sealY = y + 70; ctx.fillStyle = accent[0]; ctx.beginPath(); ctx.arc(sx, sealY, 46, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = accent[1]; ctx.beginPath(); ctx.arc(sx, sealY, 36, 0, Math.PI * 2); ctx.fill();
  // 5-point star (drawn, not a glyph — fonts may lack ★)
  ctx.fillStyle = '#fff'; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const r = i % 2 === 0 ? 20 : 8.5, a = -Math.PI / 2 + i * Math.PI / 5; const px = sx + r * Math.cos(a), py = sealY + r * Math.sin(a); i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
  ctx.closePath(); ctx.fill();
  for (let i = 0; i < 2; i++) { ctx.fillStyle = accent[0]; ctx.beginPath(); ctx.moveTo(sx - 8, sealY + 44); ctx.lineTo(sx - 22, sealY + 92 + i); ctx.lineTo(sx - 2, sealY + 78); ctx.fill(); ctx.beginPath(); ctx.moveTo(sx + 8, sealY + 44); ctx.lineTo(sx + 22, sealY + 92 + i); ctx.lineTo(sx + 2, sealY + 78); ctx.fill(); }
  // Signature + date lines
  const ly = H - 150;
  rule(ctx, 130, ly, 330, '#6b7280', 1); text(ctx, 'Date', 230, ly + 22, { size: 12, color: MUTED, align: 'center' });
  rule(ctx, W - 330, ly, W - 130, '#6b7280', 1); text(ctx, 'Signature', W - 230, ly + 22, { size: 12, color: MUTED, align: 'center' });
  watermark(ctx);
}
const CERT_ORDER = entries.filter((e) => e.category === 'certificate').map((e) => e.slug);
function renderCertificate(ctx, entry) {
  const idx = Math.max(0, CERT_ORDER.indexOf(entry.slug)), accent = BK_ACCENTS[(idx * 3 + 3) % BK_ACCENTS.length];
  return certAward(ctx, entry, accent);
}

const SOC_ORDER = entries.filter((e) => e.category === 'social').map((e) => e.slug);
function renderSocial(ctx, entry) {
  const s = entry.slug, idx = Math.max(0, SOC_ORDER.indexOf(s)), accent = BK_ACCENTS[(idx * 3 + 5) % BK_ACCENTS.length];
  if (/content-calendar|posting-schedule/.test(s)) return plMonth(ctx, entry, accent);
  if (/engagement|growth|audit|hashtag|idea-bank/.test(s)) return plLog(ctx, entry, accent);
  if (/post-planner|instagram|reels|pillar/.test(s)) return plWeekly(ctx, entry, accent);
  return plChecklist(ctx, entry, accent);
}

// ---- Dispatcher ----

function render(entry) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  if (entry.category === 'resume') {
    const fn = pickResumeLayout(entry.slug);
    fn(ctx, entry);
  } else if (entry.category === 'bookkeeping') {
    renderBookkeeping(ctx, entry);
  } else if (entry.category === 'invoice') {
    renderInvoiceCat(ctx, entry);
  } else if (entry.category === 'planner') {
    renderPlanner(ctx, entry);
  } else if (entry.category === 'letters') renderLetters(ctx, entry);
  else if (entry.category === 'business') {
    renderBusiness(ctx, entry);
  } else if (entry.category === 'education') {
    renderEducationCat(ctx, entry);
  } else if (entry.category === 'email') renderEmailCat(ctx, entry);
  else if (entry.category === 'checklist') renderChecklist(ctx, entry);
  else if (entry.category === 'finance') renderFinance(ctx, entry);
  else if (entry.category === 'wedding') renderWedding(ctx, entry);
  else if (entry.category === 'health') renderHealth(ctx, entry);
  else if (entry.category === 'kids') renderKids(ctx, entry);
  else if (entry.category === 'certificate') renderCertificate(ctx, entry);
  else if (entry.category === 'social') renderSocial(ctx, entry);
  else renderBusinessDoc(ctx, entry);

  return canvas.encode('png');
}

let count = 0;
for (const entry of entries) {
  const buf = await render(entry);
  fs.writeFileSync(path.join(outDir, `${entry.slug}.png`), buf);
  count++;
  if (count % 25 === 0) console.log(`Rendered ${count}/${entries.length}`);
}
console.log(`Done. ${count} previews regenerated in public/previews/`);
