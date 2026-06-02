'use client';
import { useState } from 'react';
import { CalendarSheet } from './CalendarSheet';
import { downloadCalendarPdf } from '@/lib/calendarPdf';
import type { WeekStart, PaperSize, HolidayMap } from '@/lib/calendar';
import type { CalStyleId } from '@/config/calendars';

interface Props {
  year: number;
  month: number;
  style: CalStyleId;
  country: string;
  defaultWeekStart: WeekStart;
  defaultPaper: PaperSize;
  orientation: 'landscape' | 'portrait';
  holidays?: HolidayMap;
}

export function CalendarViewer({ year, month, style, country, defaultWeekStart, defaultPaper, orientation, holidays = {} }: Props) {
  const [ws, setWs] = useState<WeekStart>(defaultWeekStart);
  const [paper, setPaper] = useState<PaperSize>(defaultPaper);
  const [busy, setBusy] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [events, setEvents] = useState<Record<number, string>>({});
  const supportsWeekStart = style !== 'vertical';
  const supportsEvents = style === 'basic' || style === 'holidays';

  const onDownload = async () => {
    setBusy(true);
    try {
      await downloadCalendarPdf({ country, year, month, style, weekStart: ws, paper, holidays, events });
    } finally {
      setBusy(false);
    }
  };

  const printSize = `${paper === 'a4' ? 'A4' : 'Letter'} ${orientation}`;
  const printCss = `@media print{@page{size:${printSize};margin:0.4in}body *{visibility:hidden}#print-area,#print-area *{visibility:visible}#print-area{position:absolute;left:0;top:0;width:100%;border:none!important;box-shadow:none!important}.no-print{display:none!important}}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printCss }} />
      <div className="no-print flex flex-wrap gap-3 items-center mb-6">
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition" style={{ background: '#f59e0b' }}>
          🖨️ Print
        </button>
        <button onClick={onDownload} disabled={busy} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-amber-500/40 font-medium hover:bg-amber-500/5 transition disabled:opacity-60">
          {busy ? 'Preparing…' : '⬇️ Download PDF'}
        </button>

        {supportsWeekStart && (
          <Toggle label="Week starts" value={ws} options={[[0, 'Sun'], [1, 'Mon']]} onChange={(v) => setWs(v as WeekStart)} />
        )}
        <Toggle label="Paper" value={paper} options={[['letter', 'Letter'], ['a4', 'A4']]} onChange={(v) => setPaper(v as PaperSize)} />
        {supportsEvents && (
          <button
            onClick={() => setEditMode((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition ${editMode ? 'text-white border-transparent' : 'border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
            style={editMode ? { background: '#f59e0b' } : undefined}
          >
            ✏️ {editMode ? 'Done editing' : 'Add events'}
          </button>
        )}
      </div>

      {editMode && (
        <p className="no-print text-sm text-amber-700 dark:text-amber-400 mb-3">Click any day and type your event or note. It prints and saves into the PDF.</p>
      )}

      <div id="print-area" className={`rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden mx-auto ${orientation === 'portrait' ? 'max-w-md' : ''}`}>
        <CalendarSheet year={year} month={month} style={style} weekStart={ws} paper={paper} holidays={holidays} editable={editMode} events={events} onEdit={(d, t) => setEvents((e) => ({ ...e, [d]: t }))} />
      </div>
    </>
  );
}

function Toggle<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-gray-300 dark:border-slate-700 overflow-hidden text-sm">
      <span className="px-3 py-2 text-gray-500 dark:text-gray-400 border-r border-gray-300 dark:border-slate-700">{label}</span>
      {options.map(([v, lbl]) => (
        <button
          key={String(v)}
          onClick={() => onChange(v)}
          className={`px-4 py-2 font-medium transition ${value === v ? 'text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-800'}`}
          style={value === v ? { background: '#f59e0b' } : undefined}
        >
          {lbl}
        </button>
      ))}
    </div>
  );
}
