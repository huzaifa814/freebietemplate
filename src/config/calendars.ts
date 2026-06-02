import { MONTH_SLUGS, type WeekStart, type PaperSize } from '@/lib/calendar';

export const FIRST_YEAR = 2026;

/** Full range for year-level pages (full-year calendars + style indexes). */
export const CAL_YEARS: number[] = Array.from({ length: 20 }, (_, i) => FIRST_YEAR + i); // 2026–2045

/** Subset that also gets month-level pages (real near-term search demand). */
export const MONTH_YEARS: number[] = Array.from({ length: 6 }, (_, i) => FIRST_YEAR + i); // 2026–2031

export type CalStyleId = 'basic' | 'vertical' | 'holidays' | 'yearly' | 'academic';

export interface CalStyle {
  id: CalStyleId;
  title: string;
  short: string;
  description: string;
  orientation: 'landscape' | 'portrait';
  icon: string;
  perMonth: boolean; // true = one printable per month; false = single full-year sheet
}

export const CAL_STYLES: CalStyle[] = [
  { id: 'basic', title: 'Basic Monthly Calendars', short: 'Basic', description: 'Clean month grid with large writing boxes. Prints landscape on Letter (8.5×11) paper.', orientation: 'landscape', icon: '🗓️', perMonth: true },
  { id: 'vertical', title: 'Vertical Calendars', short: 'Vertical', description: 'Portrait list layout — one row per day with room for notes, tasks, and appointments.', orientation: 'portrait', icon: '📋', perMonth: true },
  { id: 'holidays', title: 'Calendars with Holidays', short: 'Holidays', description: 'Month grid with public holidays and popular observances marked on the day.', orientation: 'landscape', icon: '🎉', perMonth: true },
  { id: 'yearly', title: 'Full-Year Calendar', short: 'Year-at-a-glance', description: 'All 12 months on a single landscape page — perfect for a wall or planner cover.', orientation: 'landscape', icon: '📆', perMonth: false },
  { id: 'academic', title: 'Academic Year Calendar', short: 'Academic', description: 'The August–July school year on a single page — for students, teachers, and parents.', orientation: 'landscape', icon: '🎓', perMonth: false },
];

export interface Country {
  code: string; // path segment, e.g. 'us'
  name: string;
  adjective: string; // e.g. 'US', 'UK', 'Canadian' — used in titles
  flag: string;
  weekStart: WeekStart; // conventional first day of the week
  paper: PaperSize; // conventional default paper size
  partialHolidays?: boolean; // holiday set omits major variable (lunar) holidays
}

export const COUNTRIES: Country[] = [
  { code: 'us', name: 'United States', adjective: 'US', flag: '🇺🇸', weekStart: 0, paper: 'letter' },
  { code: 'uk', name: 'United Kingdom', adjective: 'UK', flag: '🇬🇧', weekStart: 1, paper: 'a4' },
  { code: 'ca', name: 'Canada', adjective: 'Canadian', flag: '🇨🇦', weekStart: 0, paper: 'letter' },
  { code: 'au', name: 'Australia', adjective: 'Australian', flag: '🇦🇺', weekStart: 1, paper: 'a4' },
  { code: 'ie', name: 'Ireland', adjective: 'Irish', flag: '🇮🇪', weekStart: 1, paper: 'a4' },
  { code: 'nz', name: 'New Zealand', adjective: 'New Zealand', flag: '🇳🇿', weekStart: 1, paper: 'a4' },
  { code: 'in', name: 'India', adjective: 'Indian', flag: '🇮🇳', weekStart: 0, paper: 'a4', partialHolidays: true },
  { code: 'de', name: 'Germany', adjective: 'German', flag: '🇩🇪', weekStart: 1, paper: 'a4' },
  { code: 'fr', name: 'France', adjective: 'French', flag: '🇫🇷', weekStart: 1, paper: 'a4' },
  { code: 'es', name: 'Spain', adjective: 'Spanish', flag: '🇪🇸', weekStart: 1, paper: 'a4' },
  { code: 'it', name: 'Italy', adjective: 'Italian', flag: '🇮🇹', weekStart: 1, paper: 'a4' },
  { code: 'nl', name: 'Netherlands', adjective: 'Dutch', flag: '🇳🇱', weekStart: 1, paper: 'a4' },
  { code: 'mx', name: 'Mexico', adjective: 'Mexican', flag: '🇲🇽', weekStart: 1, paper: 'letter' },
  { code: 'br', name: 'Brazil', adjective: 'Brazilian', flag: '🇧🇷', weekStart: 0, paper: 'a4' },
  { code: 'za', name: 'South Africa', adjective: 'South African', flag: '🇿🇦', weekStart: 0, paper: 'a4' },
];

export const DEFAULT_COUNTRY = 'us';

export function getStyle(id: string): CalStyle | undefined {
  return CAL_STYLES.find((s) => s.id === id);
}
export function getCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}
/** A full-year ('yearly') page or style index exists for this year. */
export function isYearlyYear(y: number): boolean {
  return CAL_YEARS.includes(y);
}
/** Month-level pages (and per-month style indexes) exist for this year. */
export function isMonthYear(y: number): boolean {
  return MONTH_YEARS.includes(y);
}
/** Years for which a given style is published. */
export function styleYears(style: CalStyle): number[] {
  return style.perMonth ? MONTH_YEARS : CAL_YEARS;
}
export function monthIndex(slug: string): number {
  return MONTH_SLUGS.indexOf(slug);
}
