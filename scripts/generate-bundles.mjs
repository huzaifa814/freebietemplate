// Builds one ZIP per category containing all of that category's download files.
// Output: public/bundles/<category>.zip — served as a "download all" link on
// each category page. Uses a fixed file date so re-runs are byte-identical
// (no git churn).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const filesDir = path.join(root, 'public', 'files');
const outDir = path.join(root, 'public', 'bundles');
fs.mkdirSync(outDir, { recursive: true });

const FIXED_DATE = new Date('2026-01-01T00:00:00Z'); // deterministic → no byte churn

// Parse { slug, title, category, ext } from the catalog.
const catalogSrc = fs.readFileSync(path.join(root, 'src/config/templates.ts'), 'utf8');
const entryRe = /t\('([^']+)',\s*'([^']+)',[\s\S]*?,\s*'([a-z]+)',[\s\S]*?(xlsxFiles|docxFiles|pdfFiles|emailSigFiles)\(/g;
const extFor = { xlsxFiles: 'xlsx', docxFiles: 'docx', pdfFiles: 'pdf', emailSigFiles: 'html' };
const byCat = new Map();
for (const m of catalogSrc.matchAll(entryRe)) {
  const [, slug, title, category, helper] = m;
  if (!byCat.has(category)) byCat.set(category, []);
  byCat.get(category).push({ slug, title, ext: extFor[helper] });
}

let total = 0;
for (const [category, items] of byCat) {
  const zip = new JSZip();
  let added = 0;
  for (const it of items) {
    const fp = path.join(filesDir, `${it.slug}.${it.ext}`);
    if (!fs.existsSync(fp)) { console.warn(`  missing file: ${it.slug}.${it.ext}`); continue; }
    zip.file(`${it.slug}.${it.ext}`, fs.readFileSync(fp), { date: FIXED_DATE });
    added++;
  }
  const readme = [
    `${category.toUpperCase()} TEMPLATES — freebietemplate.com`,
    ``,
    `${added} free templates, completely free for personal and commercial use.`,
    `No attribution required. Do not resell the templates themselves.`,
    ``,
    `Get more free templates at https://freebietemplate.com/categories/${category}`,
  ].join('\n');
  zip.file('README.txt', readme, { date: FIXED_DATE });
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  fs.writeFileSync(path.join(outDir, `${category}.zip`), buf);
  console.log(`  ${category}.zip — ${added} files, ${(buf.length / 1024).toFixed(0)} KB`);
  total++;
}
console.log(`Done. ${total} category bundles written to public/bundles/`);
