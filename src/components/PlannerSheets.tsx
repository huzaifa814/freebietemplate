import { weekdayLabels, sheetAspect, type WeekStart, type PaperSize } from '@/lib/calendar';

function Footer() {
  return <div className="text-center text-[10px] tracking-wide text-gray-400 pt-2">freebietemplate.com</div>;
}

/** Undated month grid — blank boxes for any month. */
export function BlankSheet({ weekStart, paper }: { weekStart: WeekStart; paper: PaperSize }) {
  const labels = weekdayLabels(weekStart, true);
  return (
    <div className="cal-sheet bg-white text-gray-900 flex flex-col" style={{ aspectRatio: sheetAspect(paper, 'landscape') }}>
      <div className="flex items-end gap-3 px-4 pt-4 pb-3">
        <span className="text-lg md:text-2xl font-bold">Month</span>
        <span className="flex-1 border-b-2 border-gray-300 mb-1" />
        <span className="text-lg md:text-2xl font-bold">Year</span>
        <span className="w-20 md:w-28 border-b-2 border-gray-300 mb-1" />
      </div>
      <div className="grid grid-cols-7 text-white text-xs md:text-sm font-semibold tracking-wide" style={{ background: '#f59e0b' }}>
        {labels.map((d) => <div key={d} className="text-center py-1.5">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 flex-1 border-l border-t border-gray-300" style={{ gridTemplateRows: 'repeat(6, 1fr)' }}>
        {Array.from({ length: 42 }).map((_, i) => (
          <div key={i} className="border-r border-b border-gray-300 p-1.5">
            <span className="inline-block w-5 h-5 rounded border border-gray-200" />
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}

/** Weekly planner — one row per day with ruled writing lines. */
export function WeeklySheet({ weekStart, paper }: { weekStart: WeekStart; paper: PaperSize }) {
  const labels = weekdayLabels(weekStart, true);
  return (
    <div className="cal-sheet bg-white text-gray-900 flex flex-col" style={{ aspectRatio: sheetAspect(paper, 'portrait') }}>
      <div className="flex items-end gap-3 px-4 pt-4 pb-3">
        <span className="text-lg md:text-2xl font-bold">Week of</span>
        <span className="flex-1 border-b-2 border-gray-300 mb-1" />
      </div>
      <div className="flex-1 flex flex-col border border-gray-300">
        {labels.map((d) => (
          <div key={d} className="flex-1 flex border-b border-gray-200 last:border-b-0 min-h-0">
            <div className="w-20 md:w-28 shrink-0 flex items-center justify-center text-white font-semibold text-xs md:text-sm" style={{ background: '#f59e0b' }}>{d}</div>
            <div className="flex-1 flex flex-col justify-evenly px-3 py-1">
              <span className="border-b border-gray-200" />
              <span className="border-b border-gray-200" />
              <span className="border-b border-gray-200" />
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}
