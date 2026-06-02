'use client';
import { useState } from 'react';
import { BlankSheet, WeeklySheet } from './PlannerSheets';
import { downloadBlankPdf, downloadWeeklyPdf } from '@/lib/calendarPdf';
import type { WeekStart, PaperSize } from '@/lib/calendar';

export function SimpleViewer({ kind, defaultWeekStart = 1, defaultPaper = 'letter' }: { kind: 'blank' | 'weekly'; defaultWeekStart?: WeekStart; defaultPaper?: PaperSize }) {
  const [ws, setWs] = useState<WeekStart>(defaultWeekStart);
  const [paper, setPaper] = useState<PaperSize>(defaultPaper);
  const [busy, setBusy] = useState(false);
  const orientation = kind === 'weekly' ? 'portrait' : 'landscape';

  const onDownload = async () => {
    setBusy(true);
    try {
      if (kind === 'blank') await downloadBlankPdf({ weekStart: ws, paper });
      else await downloadWeeklyPdf({ weekStart: ws, paper });
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
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition" style={{ background: '#f59e0b' }}>🖨️ Print</button>
        <button onClick={onDownload} disabled={busy} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-amber-500/40 font-medium hover:bg-amber-500/5 transition disabled:opacity-60">{busy ? 'Preparing…' : '⬇️ Download PDF'}</button>
        <Toggle label="Week starts" value={ws} options={[[0, 'Sun'], [1, 'Mon']]} onChange={(v) => setWs(v as WeekStart)} />
        <Toggle label="Paper" value={paper} options={[['letter', 'Letter'], ['a4', 'A4']]} onChange={(v) => setPaper(v as PaperSize)} />
      </div>
      <div id="print-area" className={`rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden mx-auto ${orientation === 'portrait' ? 'max-w-md' : ''}`}>
        {kind === 'blank' ? <BlankSheet weekStart={ws} paper={paper} /> : <WeeklySheet weekStart={ws} paper={paper} />}
      </div>
    </>
  );
}

function Toggle<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-gray-300 dark:border-slate-700 overflow-hidden text-sm">
      <span className="px-3 py-2 text-gray-500 dark:text-gray-400 border-r border-gray-300 dark:border-slate-700">{label}</span>
      {options.map(([v, lbl]) => (
        <button key={String(v)} onClick={() => onChange(v)} className={`px-4 py-2 font-medium transition ${value === v ? 'text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-800'}`} style={value === v ? { background: '#f59e0b' } : undefined}>{lbl}</button>
      ))}
    </div>
  );
}
