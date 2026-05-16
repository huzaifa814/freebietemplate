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
const entryRe = /t\('([^']+)',\s*'([^']+)',\s*'([^']+)',[\s\S]*?,\s*'(resume|bookkeeping|invoice|planner|letters|business|education|email)',/g;
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

// ---- Dispatcher ----

function render(entry) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  if (entry.category === 'resume') {
    const fn = pickResumeLayout(entry.slug);
    fn(ctx, entry);
  } else if (entry.category === 'bookkeeping') {
    const headers = entry.slug === 'mileage-log' ? ['Date', 'Odo Start', 'Odo End', 'Miles', 'Purpose'] : ['Date', 'Description', 'Category', 'Type', 'Amount'];
    renderSpreadsheet(ctx, entry, { headers });
  } else if (entry.category === 'invoice') {
    if (/quote|estimate|reminder|receipt|letter/i.test(entry.slug)) renderLetter(ctx, entry);
    else renderInvoice(ctx, entry);
  } else if (entry.category === 'planner') {
    if (/tracker|log|budget|debt|sinking|goal|saving|workout|reading|habit|fasting|water|medication|gift|mood|sleep|period|newborn|baby/i.test(entry.slug)) {
      const headers = ['Date', 'Item', 'Status', 'Notes', 'Value'];
      renderSpreadsheet(ctx, entry, { headers });
    } else {
      renderPlannerGrid(ctx, entry);
    }
  } else if (entry.category === 'letters') renderLetter(ctx, entry);
  else if (entry.category === 'business') {
    if (/calculator|tracker|pipeline|metric|funnel|matrix|okr/i.test(entry.slug)) {
      renderSpreadsheet(ctx, entry, { headers: ['Item', 'Owner', 'Value', 'Status', 'Notes'] });
    } else renderBusinessDoc(ctx, entry);
  } else if (entry.category === 'education') {
    if (entry.slug === 'gradebook' || entry.slug === 'attendance-tracker' || entry.slug === 'iep-tracker' || entry.slug === 'exam-study-schedule') {
      renderSpreadsheet(ctx, entry, { headers: ['Student', 'HW1', 'Quiz1', 'Midterm', 'Average'] });
    } else renderEducation(ctx, entry);
  } else if (entry.category === 'email') renderEmailSig(ctx, entry);
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
