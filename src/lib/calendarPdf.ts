// Client-side vector PDF generation for calendars (crisp at any zoom, tiny files).
// Dynamically imports jspdf so it stays out of the main bundle.
import { MONTHS, weekdayLabels, monthMatrix, daysInMonth, isWeekendColumn, academicMonths, type WeekStart, type PaperSize, type HolidayMap } from './calendar';
import type { CalStyleId } from '@/config/calendars';

const BRAND: [number, number, number] = [245, 158, 11];
const BRAND_DARK: [number, number, number] = [198, 119, 6];

type Doc = import('jspdf').jsPDF;

export interface PdfOpts {
  country: string;
  year: number;
  month: number;
  style: CalStyleId;
  weekStart: WeekStart;
  paper: PaperSize;
  holidays?: HolidayMap;
  events?: Record<number, string>;
}

/** Download a single-month or full-year calendar as a vector PDF. */
export async function downloadCalendarPdf({ country, year, month, style, weekStart, paper, holidays = {}, events = {} }: PdfOpts) {
  const { jsPDF } = await import('jspdf');
  const landscape = style !== 'vertical';
  const doc = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'pt', format: paper === 'a4' ? 'a4' : 'letter' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 36;

  if (style === 'yearly' || style === 'academic') {
    const academic = style === 'academic';
    drawMulti(doc, year, weekStart, academic, W, H, M);
    doc.save(`${country}-${year}${academic ? `-${year + 1}-academic` : '-full-year'}-calendar.pdf`);
    return;
  }

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(25, 25, 25);
  doc.setFontSize(28);
  doc.text(`${MONTHS[month]} ${year}`, W / 2, M + 18, { align: 'center' });
  doc.setFillColor(...BRAND);
  doc.rect(W / 2 - 18, M + 24, 36, 2.5, 'F');

  if (style === 'vertical') drawVertical(doc, year, month, W, H, M + 36);
  else drawGrid(doc, year, month, weekStart, style === 'holidays' ? holidays : {}, W, H, M + 36, false, events);

  brandFooter(doc, W, H);
  doc.save(`${country}-${MONTHS[month].toLowerCase()}-${year}-${style}-calendar.pdf`);
}

/** Undated blank month grid. */
export async function downloadBlankPdf({ weekStart, paper }: { weekStart: WeekStart; paper: PaperSize }) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: paper === 'a4' ? 'a4' : 'letter' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 36;
  const top = M + 30;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(25, 25, 25);
  doc.text('Month', M, M + 14);
  doc.setDrawColor(170, 170, 170);
  doc.setLineWidth(1);
  doc.line(M + 60, M + 16, W / 2 - 40, M + 16);
  doc.text('Year', W / 2 + 30, M + 14);
  doc.line(W / 2 + 75, M + 16, W - M, M + 16);

  drawGrid(doc, 0, 0, weekStart, {}, W, H, top, true);
  brandFooter(doc, W, H);
  doc.save(`blank-calendar-${paper}.pdf`);
}

/** Weekly planner with ruled lines. */
export async function downloadWeeklyPdf({ weekStart, paper }: { weekStart: WeekStart; paper: PaperSize }) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: paper === 'a4' ? 'a4' : 'letter' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 36;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(25, 25, 25);
  doc.text('Week of', M, M + 14);
  doc.setDrawColor(170, 170, 170);
  doc.setLineWidth(1);
  doc.line(M + 80, M + 16, W - M, M + 16);

  const top = M + 34;
  const bottom = H - 28;
  const labels = weekdayLabels(weekStart, true);
  const rowH = (bottom - top) / 7;
  const sidebar = 90;
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.6);
  labels.forEach((d, i) => {
    const y = top + i * rowH;
    doc.setFillColor(...BRAND);
    doc.rect(M, y, sidebar, rowH, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(d, M + sidebar / 2, y + rowH / 2 + 4, { align: 'center' });
    doc.rect(M, y, W - M * 2, rowH);
    // ruled lines
    doc.setDrawColor(225, 225, 225);
    for (let l = 1; l <= 2; l++) doc.line(M + sidebar + 8, y + (rowH * l) / 3, W - M - 8, y + (rowH * l) / 3);
    doc.setDrawColor(210, 210, 210);
  });
  brandFooter(doc, W, H);
  doc.save(`weekly-planner-${paper}.pdf`);
}

function brandFooter(doc: Doc, W: number, H: number) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(160, 160, 160);
  doc.text('freebietemplate.com', W / 2, H - 16, { align: 'center' });
}

function drawGrid(doc: Doc, year: number, month: number, weekStart: WeekStart, hol: HolidayMap, W: number, H: number, top: number, blank = false, events: Record<number, string> = {}) {
  const left = 36;
  const right = W - 36;
  const bottom = H - 28;
  const gridW = right - left;
  const headerH = 22;
  const cellW = gridW / 7;
  const weeks = blank ? Array.from({ length: 6 }, () => Array(7).fill(null) as (number | null)[]) : monthMatrix(year, month, weekStart);
  const gridTop = top + headerH;
  const cellH = (bottom - gridTop) / weeks.length;
  const labels = weekdayLabels(weekStart, true);

  doc.setFillColor(...BRAND);
  doc.rect(left, top, gridW, headerH, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  for (let c = 0; c < 7; c++) {
    doc.text(labels[c], left + c * cellW + cellW / 2, top + headerH / 2 + 4, { align: 'center' });
  }

  doc.setDrawColor(205, 205, 205);
  doc.setLineWidth(0.7);
  for (let r = 0; r < weeks.length; r++) {
    for (let c = 0; c < 7; c++) {
      const x = left + c * cellW;
      const y = gridTop + r * cellH;
      const day = weeks[r][c];
      if (blank) {
        doc.rect(x, y, cellW, cellH);
        doc.setDrawColor(225, 225, 225);
        doc.rect(x + 5, y + 5, 14, 14); // date box
        doc.setDrawColor(205, 205, 205);
        continue;
      }
      if (day && isWeekendColumn(c, weekStart)) {
        doc.setFillColor(252, 247, 235);
        doc.rect(x, y, cellW, cellH, 'F');
      }
      doc.rect(x, y, cellW, cellH);
      if (!day) continue;
      const weekend = isWeekendColumn(c, weekStart);
      if (weekend) doc.setTextColor(...BRAND_DARK);
      else doc.setTextColor(35, 35, 35);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(String(day), x + 6, y + 16);
      const h = hol[day];
      if (h) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        if (h.major) doc.setTextColor(...BRAND_DARK);
        else doc.setTextColor(120, 120, 120);
        const lines = doc.splitTextToSize(h.name, cellW - 10) as string[];
        doc.text(lines, x + 6, y + 28);
      }
      const ev = events[day];
      if (ev) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(55, 55, 55);
        const evLines = doc.splitTextToSize(ev, cellW - 10) as string[];
        doc.text(evLines, x + 6, y + (h ? 40 : 30));
      }
    }
  }
}

function drawVertical(doc: Doc, year: number, month: number, W: number, H: number, top: number) {
  const left = 36;
  const right = W - 36;
  const bottom = H - 28;
  const dim = daysInMonth(year, month);
  const rowH = (bottom - top) / dim;
  const short = weekdayLabels(0, false);

  doc.setDrawColor(215, 215, 215);
  doc.setLineWidth(0.6);
  for (let d = 1; d <= dim; d++) {
    const y = top + (d - 1) * rowH;
    const dow = new Date(year, month, d).getDay();
    if (dow === 0 || dow === 6) {
      doc.setFillColor(252, 247, 235);
      doc.rect(left, y, right - left, rowH, 'F');
    }
    doc.line(left, y, right, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(35, 35, 35);
    doc.text(String(d), left + 10, y + rowH / 2 + 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(130, 130, 130);
    doc.text(short[dow], left + 34, y + rowH / 2 + 4);
  }
  doc.line(left, bottom, right, bottom);
  doc.line(left, top, left, bottom);
  doc.line(right, top, right, bottom);
  brandFooter(doc, W, H);
}

function drawMulti(doc: Doc, year: number, weekStart: WeekStart, academic: boolean, W: number, H: number, M: number) {
  const heading = academic ? `${year}–${year + 1} Academic Year` : `${year}`;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_DARK);
  doc.setFontSize(academic ? 24 : 34);
  doc.text(heading, W / 2, M + 18, { align: 'center' });
  doc.setFillColor(...BRAND);
  doc.rect(W / 2 - 22, M + 24, 44, 2.5, 'F');

  const months = academic ? academicMonths(year) : MONTHS.map((_, m) => ({ month: m, year }));
  const top = M + 40;
  const cols = 3;
  const rows = 4;
  const gap = 16;
  const cellW = (W - M * 2 - gap * (cols - 1)) / cols;
  const cellH = (H - top - 28 - gap * (rows - 1)) / rows;

  months.forEach(({ month, year: my }, idx) => {
    const r = Math.floor(idx / cols);
    const c = idx % cols;
    drawMiniMonth(doc, my, month, weekStart, M + c * (cellW + gap), top + r * (cellH + gap), cellW, cellH, academic);
  });
  brandFooter(doc, W, H);
}

function drawMiniMonth(doc: Doc, year: number, month: number, weekStart: WeekStart, x: number, y: number, w: number, h: number, showYear = false) {
  const titleH = 17;
  const headerH = 13;
  const colW = w / 7;
  const weeks = monthMatrix(year, month, weekStart);
  const initials = weekdayLabels(weekStart, false).map((s) => s[0]);

  // month header bar
  doc.setFillColor(...BRAND);
  doc.rect(x, y, w, titleH, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(showYear ? `${MONTHS[month]} ${year}` : MONTHS[month], x + w / 2, y + titleH - 5, { align: 'center' });

  // weekday initials band
  const wkY = y + titleH;
  doc.setFillColor(253, 246, 232);
  doc.rect(x, wkY, w, headerH, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(...BRAND_DARK);
  for (let c = 0; c < 7; c++) {
    doc.text(initials[c], x + c * colW + colW / 2, wkY + 9, { align: 'center' });
  }

  // day grid
  const gridTop = wkY + headerH;
  const rowH = (h - titleH - headerH) / weeks.length;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  for (let r = 0; r < weeks.length; r++) {
    for (let c = 0; c < 7; c++) {
      const day = weeks[r][c];
      if (!day) continue;
      const cx = x + c * colW + colW / 2;
      const cy = gridTop + r * rowH + rowH / 2 + 3;
      const we = isWeekendColumn(c, weekStart);
      doc.setTextColor(we ? 217 : 75, we ? 119 : 75, we ? 6 : 75);
      doc.text(String(day), cx, cy, { align: 'center' });
    }
  }

  // card outline
  doc.setDrawColor(245, 224, 178);
  doc.setLineWidth(0.6);
  doc.rect(x, y, w, h);
}
