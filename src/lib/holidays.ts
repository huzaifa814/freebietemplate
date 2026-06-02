// Holiday data via the `date-holidays` library (~200 countries).
// SERVER/BUILD-TIME ONLY — never import this into a client component. Pages
// precompute holiday maps here and pass them to client components as props,
// so the library never ships in the browser bundle.
import Holidays from 'date-holidays';
import type { Holiday } from './calendar';

export type { Holiday };

export interface HolidayEntry {
  slug: string;
  name: string;
  month: number; // 0-based
  day: number;
  type: string;
  note?: string;
  major: boolean;
}

// our country code -> date-holidays ISO code
const DH_CODE: Record<string, string> = {
  us: 'US', uk: 'GB', ca: 'CA', au: 'AU', ie: 'IE', nz: 'NZ', in: 'IN',
  de: 'DE', fr: 'FR', es: 'ES', it: 'IT', nl: 'NL', mx: 'MX', br: 'BR', za: 'ZA', ph: 'PH',
};

const TYPES = new Set(['public', 'bank', 'optional', 'observance']);

const cache = new Map<string, Holidays>();
function instance(country: string): Holidays | null {
  const code = DH_CODE[country];
  if (!code) return null;
  let hd = cache.get(code);
  if (!hd) {
    hd = new Holidays(code);
    try { hd.setLanguages('en'); } catch { /* keep default language */ }
    cache.set(code, hd);
  }
  return hd;
}

export function slugify(name: string): string {
  return name
    .replace(/\([^)]*\)/g, '') // drop "(substitute day)" etc.
    .toLowerCase()
    .replace(/['’.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseDate(d: string): { month: number; day: number } {
  const [y, m, day] = d.slice(0, 10).split('-').map(Number);
  void y;
  return { month: m - 1, day };
}

/** All catalogued holidays for a country/year (deduped by slug). */
export function holidayCatalogForYear(country: string, year: number): HolidayEntry[] {
  const hd = instance(country);
  if (!hd) return [];
  const raw = hd.getHolidays(year) || [];
  const seen = new Set<string>();
  const out: HolidayEntry[] = [];
  for (const h of raw) {
    if (!TYPES.has(h.type)) continue;
    if (/substitute|in lieu/i.test(h.name)) continue;
    const slug = slugify(h.name);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    const { month, day } = parseDate(h.date);
    const note = (h as { note?: string }).note;
    out.push({ slug, name: h.name, month, day, type: h.type, note, major: h.type === 'public' || h.type === 'bank' });
  }
  return out;
}

/** Holidays that fall in a given month, keyed by day-of-month. */
export function holidaysForMonth(country: string, year: number, month: number): Record<number, Holiday> {
  const out: Record<number, Holiday> = {};
  for (const h of holidayCatalogForYear(country, year)) {
    if (h.month !== month) continue;
    if (!out[h.day] || (h.major && !out[h.day].major)) {
      out[h.day] = { day: h.day, name: h.name, major: h.major };
    }
  }
  return out;
}

/** Distinct holidays for a country across a year range — for the "when is X" hub. */
export function holidayList(country: string, sampleYear: number): HolidayEntry[] {
  return holidayCatalogForYear(country, sampleYear).sort((a, b) => a.month - b.month || a.day - b.day);
}

/** A single holiday's date for each year in the range (by slug). */
export function holidayDatesByYear(country: string, slug: string, years: number[]): { year: number; month: number; day: number; name: string }[] {
  const out: { year: number; month: number; day: number; name: string }[] = [];
  for (const y of years) {
    const found = holidayCatalogForYear(country, y).find((h) => h.slug === slug);
    if (found) out.push({ year: y, month: found.month, day: found.day, name: found.name });
  }
  return out;
}
