import { MONTHS, weekdayLabels, monthMatrix, daysInMonth, isWeekendColumn, sheetAspect, academicMonths, type WeekStart, type PaperSize, type HolidayMap } from '@/lib/calendar';
import type { CalStyleId } from '@/config/calendars';

// Pure/shared component (no server-only APIs, no library imports) so it can
// render inside the client-side CalendarViewer as well as in static pages.
// Holiday data arrives as a prop (precomputed server-side).

export type EventMap = Record<number, string>;

interface Props {
  year: number;
  month: number;
  style: CalStyleId;
  weekStart?: WeekStart;
  paper?: PaperSize;
  holidays?: HolidayMap;
  editable?: boolean;
  events?: EventMap;
  onEdit?: (day: number, text: string) => void;
}

export function CalendarSheet({ year, month, style, weekStart = 0, paper = 'letter', holidays = {}, editable = false, events = {}, onEdit }: Props) {
  if (style === 'yearly' || style === 'academic') return <MultiMonthSheet year={year} weekStart={weekStart} paper={paper} academic={style === 'academic'} />;
  if (style === 'vertical') return <VerticalSheet year={year} month={month} paper={paper} />;
  return <GridSheet year={year} month={month} weekStart={weekStart} paper={paper} holidays={style === 'holidays' ? holidays : {}} editable={editable} events={events} onEdit={onEdit} />;
}

function SheetFooter() {
  return <div className="text-center text-[10px] tracking-wide text-gray-400 pt-2">freebietemplate.com</div>;
}

function SheetTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center pt-3 pb-2">
      <h2 className="font-bold text-2xl md:text-3xl">{children}</h2>
      <div className="mx-auto mt-1.5 h-0.5 w-14 rounded-full" style={{ background: '#f59e0b' }} />
    </div>
  );
}

function GridSheet({ year, month, weekStart, paper, holidays, editable, events, onEdit }: { year: number; month: number; weekStart: WeekStart; paper: PaperSize; holidays: HolidayMap; editable: boolean; events: EventMap; onEdit?: (day: number, text: string) => void }) {
  const weeks = monthMatrix(year, month, weekStart);
  const hol = holidays;
  const labels = weekdayLabels(weekStart, true);
  const labelsShort = weekdayLabels(weekStart, false);
  return (
    <div className="cal-sheet bg-white text-gray-900 flex flex-col" style={{ aspectRatio: sheetAspect(paper, 'landscape') }}>
      <SheetTitle>{MONTHS[month]} {year}</SheetTitle>
      <div className="grid grid-cols-7 text-white text-[11px] sm:text-sm font-semibold tracking-wide" style={{ background: '#f59e0b' }}>
        {labels.map((d, i) => (
          <div key={d} className="text-center py-1.5">
            <span className="sm:hidden">{labelsShort[i]}</span>
            <span className="hidden sm:inline">{d}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 border-l border-t border-gray-300">
        {weeks.flat().map((day, i) => {
          const weekend = isWeekendColumn(i % 7, weekStart);
          const h = day ? hol[day] : undefined;
          return (
            <div key={i} className={`border-r border-b border-gray-300 p-1 ${weekend ? 'bg-amber-50/70' : ''}`}>
              {day && <span className={`font-bold text-sm md:text-base ${weekend ? 'text-amber-600' : ''}`}>{day}</span>}
              {h && (
                <div className={`text-[8px] md:text-[10px] leading-tight mt-0.5 ${h.major ? 'text-amber-700 font-medium' : 'text-gray-500'}`}>
                  {h.name}
                </div>
              )}
              {day && editable && (
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => onEdit?.(day, e.currentTarget.textContent || '')}
                  className="text-[9px] md:text-[11px] leading-tight mt-0.5 outline-none min-h-[1.4em] rounded focus:bg-amber-100/50 cursor-text text-gray-700"
                />
              )}
              {day && !editable && events[day] && (
                <div className="text-[9px] md:text-[11px] leading-tight mt-0.5 whitespace-pre-wrap text-gray-700">{events[day]}</div>
              )}
            </div>
          );
        })}
      </div>
      <SheetFooter />
    </div>
  );
}

function VerticalSheet({ year, month, paper }: { year: number; month: number; paper: PaperSize }) {
  const dim = daysInMonth(year, month);
  const short = weekdayLabels(0, false);
  const days = Array.from({ length: dim }, (_, i) => i + 1);
  return (
    <div className="cal-sheet bg-white text-gray-900 flex flex-col" style={{ aspectRatio: sheetAspect(paper, 'portrait') }}>
      <SheetTitle>{MONTHS[month]} {year}</SheetTitle>
      <div className="flex-1 border border-gray-300">
        {days.map((d) => {
          const dow = new Date(year, month, d).getDay();
          const weekend = dow === 0 || dow === 6;
          return (
            <div key={d} className={`flex items-center gap-3 border-b border-gray-200 px-3 ${weekend ? 'bg-amber-50/70' : ''}`} style={{ height: `${100 / dim}%` }}>
              <span className={`font-bold text-sm md:text-base w-6 text-right ${weekend ? 'text-amber-600' : ''}`}>{d}</span>
              <span className="text-[10px] md:text-xs text-gray-400 w-8">{short[dow]}</span>
            </div>
          );
        })}
      </div>
      <SheetFooter />
    </div>
  );
}

function MultiMonthSheet({ year, weekStart, paper, academic }: { year: number; weekStart: WeekStart; paper: PaperSize; academic: boolean }) {
  const initials = weekdayLabels(weekStart, false).map((s) => s[0]);
  const months = academic ? academicMonths(year) : MONTHS.map((_, m) => ({ month: m, year }));
  const heading = academic ? `${year}–${year + 1}` : `${year}`;
  return (
    <div className="cal-sheet bg-white text-gray-900 flex flex-col px-3 pb-2" style={{ aspectRatio: sheetAspect(paper, 'landscape') }}>
      <div className="text-center pt-3 pb-2">
        <span className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: '#d97706' }}>{heading}</span>
        {academic && <span className="ml-2 text-sm md:text-base font-semibold text-amber-700">Academic Year</span>}
        <div className="mx-auto mt-1 h-0.5 w-16 rounded-full" style={{ background: '#f59e0b' }} />
      </div>
      <div className="grid grid-cols-3 gap-2.5 md:gap-3 flex-1">
        {months.map(({ month: m, year: my }) => {
          const weeks = monthMatrix(my, m, weekStart);
          return (
            <div key={`${my}-${m}`} className="flex flex-col rounded-lg overflow-hidden ring-1 ring-amber-200/80">
              <div className="text-center text-xs md:text-sm font-bold text-white py-1 tracking-wide" style={{ background: '#f59e0b' }}>
                {MONTHS[m]}{academic && <span className="opacity-80 font-normal"> {my}</span>}
              </div>
              <div className="grid grid-cols-7 text-[9px] md:text-[11px] font-semibold bg-amber-50 text-amber-700">
                {initials.map((d, i) => <div key={i} className="text-center py-0.5">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 text-[10px] md:text-xs flex-1">
                {weeks.flat().map((day, i) => {
                  const weekend = isWeekendColumn(i % 7, weekStart);
                  return <div key={i} className={`flex items-center justify-center leading-tight ${weekend ? 'text-amber-600 font-semibold' : 'text-gray-700'}`}>{day ?? ''}</div>;
                })}
              </div>
            </div>
          );
        })}
      </div>
      <SheetFooter />
    </div>
  );
}
