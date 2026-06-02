// Pure, dependency-free calendar math. Holiday data lives in ./holidays.

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

export const MONTH_SLUGS = MONTHS.map((m) => m.toLowerCase());

const WEEKDAYS_LONG_SUN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS_SHORT_SUN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export type WeekStart = 0 | 1; // 0 = Sunday, 1 = Monday
export type PaperSize = 'letter' | 'a4';

/** A holiday on a given day-of-month. Lives here so client code can use the type. */
export interface Holiday {
  day: number;
  name: string;
  major: boolean;
}
/** Month holiday map keyed by day-of-month — the serializable shape passed to client components. */
export type HolidayMap = Record<number, Holiday>;

/** CSS aspect-ratio string for a sheet of the given paper + orientation. */
export function sheetAspect(paper: PaperSize, orientation: 'landscape' | 'portrait'): string {
  const [w, h] = paper === 'a4' ? [297, 210] : [11, 8.5];
  return orientation === 'landscape' ? `${w} / ${h}` : `${h} / ${w}`;
}

/** Weekday labels rotated to begin on the chosen weekStart. */
export function weekdayLabels(weekStart: WeekStart, long = true): string[] {
  const base = long ? WEEKDAYS_LONG_SUN : WEEKDAYS_SHORT_SUN;
  return [...base.slice(weekStart), ...base.slice(0, weekStart)];
}

/** Number of days in a given month (month is 0-based). */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Weekday (0=Sun..6=Sat) of the 1st of the month. */
export function firstWeekday(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/** Build a matrix of weeks for the given week start; empty cells are null. */
export function monthMatrix(year: number, month: number, weekStart: WeekStart = 0): (number | null)[][] {
  const total = daysInMonth(year, month);
  const lead = (firstWeekday(year, month) - weekStart + 7) % 7;
  const cells: (number | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Is the column index (0-6, in weekStart order) a weekend (Sat/Sun)? */
export function isWeekendColumn(col: number, weekStart: WeekStart): boolean {
  const dow = (col + weekStart) % 7;
  return dow === 0 || dow === 6;
}

/**
 * Date of the nth weekday of a month. weekday: 0=Sun..6=Sat.
 * n: 1-based (1 = first). n = -1 => last occurrence. Returns day-of-month.
 */
export function nthWeekdayDate(year: number, month: number, weekday: number, n: number): number {
  if (n > 0) {
    const first = firstWeekday(year, month);
    const offset = (weekday - first + 7) % 7;
    return 1 + offset + (n - 1) * 7;
  }
  const dim = daysInMonth(year, month);
  const lastDow = new Date(year, month, dim).getDay();
  const offset = (lastDow - weekday + 7) % 7;
  return dim - offset;
}

/** Last weekday on or before a given day-of-month. */
export function weekdayOnOrBefore(year: number, month: number, weekday: number, onOrBeforeDay: number): number {
  let d = onOrBeforeDay;
  while (new Date(year, month, d).getDay() !== weekday) d--;
  return d;
}

/** Gregorian Easter Sunday (Meeus/Jones/Butcher). Returns 0-based month + day. */
export function easter(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month: month - 1, day };
}

/** Academic-year month sequence: August (startYear) through July (startYear+1). */
export function academicMonths(startYear: number): { month: number; year: number }[] {
  const out: { month: number; year: number }[] = [];
  for (let m = 7; m < 12; m++) out.push({ month: m, year: startYear });
  for (let m = 0; m < 7; m++) out.push({ month: m, year: startYear + 1 });
  return out;
}

/** Offset a (year, month0, day) by delta days; returns normalized parts. */
export function dateOffset(year: number, month: number, day: number, delta: number): { year: number; month: number; day: number } {
  const dt = new Date(year, month, day + delta);
  return { year: dt.getFullYear(), month: dt.getMonth(), day: dt.getDate() };
}
