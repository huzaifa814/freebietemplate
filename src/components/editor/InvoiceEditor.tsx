'use client';
import { type RefObject } from 'react';
import { Group, Input, EditorShell, usePersistentState } from './editorUI';

interface LineItem { desc: string; qty: string; rate: string }
interface InvoiceData {
  fromName: string; fromEmail: string; fromAddr: string;
  billName: string; billAddr: string;
  number: string; date: string; due: string;
  items: LineItem[]; taxPct: string; notes: string; label: string;
}

const sample: InvoiceData = {
  fromName: 'Your Business Name', fromEmail: 'you@email.com', fromAddr: '123 Main St, City, ST 00000',
  billName: 'Client Name', billAddr: '456 Client Ave, City, ST 00000',
  number: 'INV-1001', date: '2026-06-03', due: '2026-06-17',
  items: [
    { desc: 'Design services', qty: '10', rate: '85' },
    { desc: 'Consulting', qty: '4', rate: '120' },
  ],
  taxPct: '0', notes: 'Thank you for your business! Payment due within 14 days.', label: 'INVOICE',
};

const money = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function InvoiceEditor({ docLabel = 'INVOICE' }: { docLabel?: string }) {
  const [data, update] = usePersistentState<InvoiceData>('freebietemplate.invoice', { ...sample, label: docLabel });
  const set = <K extends keyof InvoiceData>(k: K, v: InvoiceData[K]) => update((d) => ({ ...d, [k]: v }));
  const setItem = (i: number, k: keyof LineItem, v: string) => update((d) => ({ ...d, items: d.items.map((it, ix) => ix === i ? { ...it, [k]: v } : it) }));

  const filenameBase = (data.number || 'invoice').replace(/[^a-z0-9]+/gi, '-').toLowerCase();

  return (
    <EditorShell filenameBase={filenameBase} renderPreview={(ref) => <InvoicePreview data={data} innerRef={ref} />}>
      <Group title="From">
        <Input label="Business / name" value={data.fromName} onChange={(v) => set('fromName', v)} />
        <Input label="Email" value={data.fromEmail} onChange={(v) => set('fromEmail', v)} />
        <Input label="Address" value={data.fromAddr} onChange={(v) => set('fromAddr', v)} />
      </Group>
      <Group title="Bill to">
        <Input label="Client" value={data.billName} onChange={(v) => set('billName', v)} />
        <Input label="Address" value={data.billAddr} onChange={(v) => set('billAddr', v)} />
      </Group>
      <Group title="Details">
        <Input label="Invoice #" value={data.number} onChange={(v) => set('number', v)} />
        <Input label="Date" type="date" value={data.date} onChange={(v) => set('date', v)} />
        <Input label="Due date" type="date" value={data.due} onChange={(v) => set('due', v)} />
      </Group>
      <Group title="Line items" action={<button onClick={() => update((d) => ({ ...d, items: [...d.items, { desc: '', qty: '1', rate: '0' }] }))} className="text-xs text-amber-600 hover:underline">+ Item</button>}>
        {data.items.map((it, i) => (
          <div key={i} className="grid grid-cols-[1fr_44px_60px_22px] gap-1 items-center">
            <input value={it.desc} placeholder="Description" onChange={(e) => setItem(i, 'desc', e.target.value)} className="px-2 py-1.5 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs" />
            <input value={it.qty} inputMode="decimal" onChange={(e) => setItem(i, 'qty', e.target.value)} className="px-1 py-1.5 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-center" />
            <input value={it.rate} inputMode="decimal" onChange={(e) => setItem(i, 'rate', e.target.value)} className="px-1 py-1.5 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-right" />
            <button onClick={() => update((d) => ({ ...d, items: d.items.filter((_, ix) => ix !== i) }))} className="text-red-600 hover:bg-red-50 rounded text-xs">×</button>
          </div>
        ))}
        <div className="grid grid-cols-[1fr_44px_60px_22px] gap-1 text-[10px] text-gray-400 px-1"><span>Item</span><span className="text-center">Qty</span><span className="text-right">Rate</span><span /></div>
      </Group>
      <Group title="Tax & notes">
        <Input label="Tax %" value={data.taxPct} onChange={(v) => set('taxPct', v)} />
        <Input label="Notes / payment terms" value={data.notes} onChange={(v) => set('notes', v)} />
      </Group>
    </EditorShell>
  );
}

function InvoicePreview({ data, innerRef }: { data: InvoiceData; innerRef: RefObject<HTMLDivElement | null> }) {
  const rows = data.items.map((it) => ({ ...it, amount: (parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0) }));
  const subtotal = rows.reduce((s, r) => s + r.amount, 0);
  const tax = subtotal * ((parseFloat(data.taxPct) || 0) / 100);
  const total = subtotal + tax;
  return (
    <div ref={innerRef} className="bg-white text-gray-900 p-12" style={{ aspectRatio: '816 / 1056', fontFamily: 'Arial, sans-serif' }}>
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: '#f59e0b' }}>{data.label}</h1>
          <div className="text-sm text-gray-500 mt-1">{data.number}</div>
        </div>
        <div className="text-right text-sm">
          <div className="font-bold text-base">{data.fromName}</div>
          <div className="text-gray-500">{data.fromEmail}</div>
          <div className="text-gray-500">{data.fromAddr}</div>
        </div>
      </div>
      <div className="flex justify-between mb-8 text-sm">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#f59e0b' }}>Bill To</div>
          <div className="font-semibold">{data.billName}</div>
          <div className="text-gray-500">{data.billAddr}</div>
        </div>
        <div className="text-right text-gray-600">
          <div>Date: {data.date}</div>
          <div>Due: {data.due}</div>
        </div>
      </div>
      <table className="w-full text-sm mb-6" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#fef3c7' }}>
            <th className="text-left py-2 px-3 font-bold">Description</th>
            <th className="text-center py-2 px-3 font-bold w-16">Qty</th>
            <th className="text-right py-2 px-3 font-bold w-24">Rate</th>
            <th className="text-right py-2 px-3 font-bold w-28">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td className="py-2 px-3">{r.desc || '—'}</td>
              <td className="py-2 px-3 text-center">{r.qty}</td>
              <td className="py-2 px-3 text-right">{money(parseFloat(r.rate) || 0)}</td>
              <td className="py-2 px-3 text-right">{money(r.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end mb-10">
        <div className="w-64 text-sm">
          <div className="flex justify-between py-1"><span className="text-gray-500">Subtotal</span><span>{money(subtotal)}</span></div>
          {tax > 0 && <div className="flex justify-between py-1"><span className="text-gray-500">Tax ({data.taxPct}%)</span><span>{money(tax)}</span></div>}
          <div className="flex justify-between py-2 mt-1 border-t-2 font-bold text-lg" style={{ borderColor: '#f59e0b' }}><span>Total</span><span style={{ color: '#f59e0b' }}>{money(total)}</span></div>
        </div>
      </div>
      {data.notes && <div className="text-xs text-gray-500 border-t pt-3">{data.notes}</div>}
      <div className="text-center text-[10px] text-gray-300 mt-8">freebietemplate.com</div>
    </div>
  );
}
