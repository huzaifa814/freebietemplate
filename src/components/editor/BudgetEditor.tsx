'use client';
import { type RefObject } from 'react';
import { Group, Input, EditorShell, usePersistentState } from './editorUI';

interface Row { name: string; planned: string; actual: string }
interface BudgetData { title: string; month: string; income: Row[]; expenses: Row[] }

const sample: BudgetData = {
  title: 'Monthly Budget', month: 'June 2026',
  income: [{ name: 'Paycheck', planned: '4200', actual: '4200' }, { name: 'Side income', planned: '300', actual: '250' }],
  expenses: [
    { name: 'Rent / Mortgage', planned: '1400', actual: '1400' },
    { name: 'Groceries', planned: '600', actual: '540' },
    { name: 'Transport', planned: '300', actual: '280' },
    { name: 'Utilities', planned: '280', actual: '265' },
    { name: 'Fun', planned: '250', actual: '310' },
    { name: 'Savings', planned: '600', actual: '600' },
  ],
};

const money = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const sum = (rows: Row[], k: 'planned' | 'actual') => rows.reduce((s, r) => s + (parseFloat(r[k]) || 0), 0);

export function BudgetEditor() {
  const [data, update] = usePersistentState<BudgetData>('freebietemplate.budget', sample);
  const set = <K extends keyof BudgetData>(k: K, v: BudgetData[K]) => update((d) => ({ ...d, [k]: v }));
  const setRow = (list: 'income' | 'expenses', i: number, k: keyof Row, v: string) =>
    update((d) => ({ ...d, [list]: d[list].map((r, ix) => ix === i ? { ...r, [k]: v } : r) }));
  const addRow = (list: 'income' | 'expenses') => update((d) => ({ ...d, [list]: [...d[list], { name: '', planned: '0', actual: '0' }] }));
  const delRow = (list: 'income' | 'expenses', i: number) => update((d) => ({ ...d, [list]: d[list].filter((_, ix) => ix !== i) }));

  const filenameBase = (data.title || 'budget').replace(/[^a-z0-9]+/gi, '-').toLowerCase();

  const editRows = (list: 'income' | 'expenses') => data[list].map((r, i) => (
    <div key={i} className="grid grid-cols-[1fr_56px_56px_22px] gap-1 items-center">
      <input value={r.name} placeholder="Name" onChange={(e) => setRow(list, i, 'name', e.target.value)} className="px-2 py-1.5 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs" />
      <input value={r.planned} inputMode="decimal" onChange={(e) => setRow(list, i, 'planned', e.target.value)} className="px-1 py-1.5 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-right" />
      <input value={r.actual} inputMode="decimal" onChange={(e) => setRow(list, i, 'actual', e.target.value)} className="px-1 py-1.5 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-right" />
      <button onClick={() => delRow(list, i)} className="text-red-600 hover:bg-red-50 rounded text-xs">×</button>
    </div>
  ));

  return (
    <EditorShell filenameBase={filenameBase} renderPreview={(ref) => <BudgetPreview data={data} innerRef={ref} />}>
      <Group title="Header">
        <Input label="Title" value={data.title} onChange={(v) => set('title', v)} />
        <Input label="Month" value={data.month} onChange={(v) => set('month', v)} />
      </Group>
      <Group title="Income" action={<button onClick={() => addRow('income')} className="text-xs text-amber-600 hover:underline">+ Row</button>}>
        <div className="grid grid-cols-[1fr_56px_56px_22px] gap-1 text-[10px] text-gray-400 px-1"><span>Source</span><span className="text-right">Plan</span><span className="text-right">Actual</span><span /></div>
        {editRows('income')}
      </Group>
      <Group title="Expenses" action={<button onClick={() => addRow('expenses')} className="text-xs text-amber-600 hover:underline">+ Row</button>}>
        <div className="grid grid-cols-[1fr_56px_56px_22px] gap-1 text-[10px] text-gray-400 px-1"><span>Category</span><span className="text-right">Plan</span><span className="text-right">Actual</span><span /></div>
        {editRows('expenses')}
      </Group>
    </EditorShell>
  );
}

function BudgetPreview({ data, innerRef }: { data: BudgetData; innerRef: RefObject<HTMLDivElement | null> }) {
  const incA = sum(data.income, 'actual'), expA = sum(data.expenses, 'actual');
  const left = incA - expA;
  const tbl = (rows: Row[]) => (
    <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
      <thead><tr style={{ background: '#fef3c7' }}>
        <th className="text-left py-1.5 px-3 font-bold">Item</th>
        <th className="text-right py-1.5 px-3 font-bold w-24">Planned</th>
        <th className="text-right py-1.5 px-3 font-bold w-24">Actual</th>
      </tr></thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
            <td className="py-1.5 px-3">{r.name || '—'}</td>
            <td className="py-1.5 px-3 text-right text-gray-500">{money(parseFloat(r.planned) || 0)}</td>
            <td className="py-1.5 px-3 text-right">{money(parseFloat(r.actual) || 0)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  return (
    <div ref={innerRef} className="bg-white text-gray-900 p-12" style={{ aspectRatio: '816 / 1056', fontFamily: 'Arial, sans-serif' }}>
      <h1 className="text-3xl font-extrabold">{data.title}</h1>
      <div className="text-gray-500 mb-8">{data.month}</div>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[['Income', incA, '#16a34a'], ['Expenses', expA, '#dc2626'], ['Left to save', left, '#f59e0b']].map(([label, val, c]) => (
          <div key={label as string} className="rounded-xl border p-4" style={{ borderColor: '#eee' }}>
            <div className="text-xs text-gray-500">{label as string}</div>
            <div className="text-2xl font-extrabold" style={{ color: c as string }}>{money(val as number)}</div>
          </div>
        ))}
      </div>
      <div className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: '#f59e0b' }}>Income</div>
      <div className="mb-6">{tbl(data.income)}</div>
      <div className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: '#f59e0b' }}>Expenses</div>
      {tbl(data.expenses)}
      <div className="text-center text-[10px] text-gray-300 mt-8">freebietemplate.com</div>
    </div>
  );
}
