'use client';
import { type RefObject } from 'react';
import { Group, Input, EditorShell, usePersistentState } from './editorUI';

interface Section { title: string; items: string[] }
interface ChecklistData { title: string; subtitle: string; sections: Section[]; accent: string }

const sample: ChecklistData = {
  title: 'My Checklist', subtitle: 'Print and check off as you go',
  sections: [
    { title: 'Before you start', items: ['Make a plan & timeline', 'Set your budget', 'Gather what you need'] },
    { title: 'The main work', items: ['Go step by step', 'Check off as you go', 'Keep essentials handy'] },
    { title: 'Wrap up', items: ['Do a final review', 'Tidy loose ends', 'Celebrate — done!'] },
  ],
  accent: '#f59e0b',
};

const ACCENTS = ['#f59e0b', '#1d4ed8', '#15803d', '#9d174d', '#6d28d9', '#0f766e'];

export function ChecklistEditor() {
  const [data, update] = usePersistentState<ChecklistData>('freebietemplate.checklist', sample);
  const set = <K extends keyof ChecklistData>(k: K, v: ChecklistData[K]) => update((d) => ({ ...d, [k]: v }));
  const setSection = (si: number, patch: Partial<Section>) => update((d) => ({ ...d, sections: d.sections.map((s, i) => i === si ? { ...s, ...patch } : s) }));
  const setItem = (si: number, ii: number, v: string) => setSectionItems(si, (items) => items.map((it, ix) => ix === ii ? v : it));
  const setSectionItems = (si: number, fn: (items: string[]) => string[]) => update((d) => ({ ...d, sections: d.sections.map((s, i) => i === si ? { ...s, items: fn(s.items) } : s) }));

  const filenameBase = (data.title || 'checklist').replace(/[^a-z0-9]+/gi, '-').toLowerCase();

  return (
    <EditorShell filenameBase={filenameBase} renderPreview={(ref) => <ChecklistPreview data={data} innerRef={ref} />}>
      <Group title="Header">
        <Input label="Title" value={data.title} onChange={(v) => set('title', v)} />
        <Input label="Subtitle" value={data.subtitle} onChange={(v) => set('subtitle', v)} />
      </Group>
      <Group title="Accent color">
        <div className="flex gap-2">
          {ACCENTS.map((c) => (
            <button key={c} onClick={() => set('accent', c)} aria-label={`accent ${c}`} className={`h-8 w-8 rounded-full border-2 ${data.accent === c ? 'border-gray-800 dark:border-white' : 'border-transparent'}`} style={{ background: c }} />
          ))}
        </div>
      </Group>
      {data.sections.map((s, si) => (
        <Group key={si} title={`Section ${si + 1}`} action={
          <div className="flex gap-2">
            <button onClick={() => setSectionItems(si, (items) => [...items, ''])} className="text-xs text-amber-600 hover:underline">+ Item</button>
            <button onClick={() => update((d) => ({ ...d, sections: d.sections.filter((_, i) => i !== si) }))} className="text-xs text-red-600 hover:underline">Remove</button>
          </div>
        }>
          <Input label="Section title" value={s.title} onChange={(v) => setSection(si, { title: v })} />
          {s.items.map((it, ii) => (
            <div key={ii} className="flex gap-1 items-center">
              <input value={it} placeholder="Item" onChange={(e) => setItem(si, ii, e.target.value)} className="flex-1 px-2 py-1.5 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs" />
              <button onClick={() => setSectionItems(si, (items) => items.filter((_, ix) => ix !== ii))} className="text-red-600 hover:bg-red-50 rounded text-xs px-1">×</button>
            </div>
          ))}
        </Group>
      ))}
      <button onClick={() => update((d) => ({ ...d, sections: [...d.sections, { title: 'New section', items: ['', '', ''] }] }))} className="w-full py-2 rounded-lg border border-dashed border-gray-300 dark:border-slate-700 text-sm text-gray-500 hover:border-amber-500">+ Add section</button>
    </EditorShell>
  );
}

function ChecklistPreview({ data, innerRef }: { data: ChecklistData; innerRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={innerRef} className="bg-white text-gray-900 p-12" style={{ aspectRatio: '816 / 1056', fontFamily: 'Arial, sans-serif' }}>
      <div className="px-5 py-4 rounded-xl mb-8" style={{ background: data.accent }}>
        <h1 className="text-3xl font-extrabold text-white">{data.title}</h1>
        {data.subtitle && <div className="text-white/90 text-sm mt-1">{data.subtitle}</div>}
      </div>
      <div className="space-y-6">
        {data.sections.map((s, si) => (
          <div key={si}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-5 rounded" style={{ background: data.accent }} />
              <h2 className="text-base font-bold uppercase tracking-wide" style={{ color: data.accent }}>{s.title}</h2>
            </div>
            <div className="space-y-2.5">
              {s.items.map((it, ii) => (
                <div key={ii} className="flex items-center gap-3 pb-2" style={{ borderBottom: '1px solid #eef0f2' }}>
                  <div className="shrink-0 rounded" style={{ width: 16, height: 16, border: `2px solid ${data.accent}` }} />
                  <span className="text-sm text-gray-700">{it || ' '}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center text-[10px] text-gray-300 mt-8">freebietemplate.com</div>
    </div>
  );
}
