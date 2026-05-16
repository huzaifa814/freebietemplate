'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CoverLetterData, sampleCoverLetter } from '@/lib/coverLetterSchema';
import { CoverLetterPreview } from './CoverLetterPreview';
import { exportElementToPDF, exportCoverLetterToDocx, buildCoverLetterDocxBlob } from '@/lib/exporters';
import { SignInBadge, DriveSaveButton } from './SignInAndDrive';

const STORAGE_KEY = 'freebietemplate.cover-letter';

export function CoverLetterEditor() {
  const [data, setData] = useState<CoverLetterData>(sampleCoverLetter);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<null | 'pdf' | 'docx' | 'ai'>(null);
  const [aiIdx, setAiIdx] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const id = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* quota */ }
    }, 400);
    return () => clearTimeout(id);
  }, [data, loaded]);

  const update = <K extends keyof CoverLetterData>(k: K, v: CoverLetterData[K]) => setData((d) => ({ ...d, [k]: v }));

  const filenameBase = useMemo(() => (data.senderName || 'cover-letter').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() + '-cover-letter', [data.senderName]);

  async function onDownloadPDF() {
    if (!previewRef.current) return;
    setBusy('pdf');
    try { await exportElementToPDF(previewRef.current, `${filenameBase}.pdf`); }
    finally { setBusy(null); }
  }
  async function onDownloadDOCX() {
    setBusy('docx');
    try { await exportCoverLetterToDocx(data, `${filenameBase}.docx`); }
    finally { setBusy(null); }
  }

  async function rewriteParagraph(idx: number) {
    const p = data.paragraphs[idx]?.trim();
    if (!p) return;
    setBusy('ai');
    setAiIdx(idx);
    try {
      const resp = await fetch('https://templateshed-api.huzaifaa4.workers.dev/rewrite', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bullet: p, role: data.senderTitle }),
      });
      const result = await resp.json();
      if (result.improved && typeof result.improved === 'string') {
        update('paragraphs', data.paragraphs.map((pp, pi) => pi === idx ? result.improved : pp));
      } else {
        alert(result.error || 'Rewrite failed.');
      }
    } catch {
      alert('Could not reach the rewriter.');
    } finally {
      setBusy(null);
      setAiIdx(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      {/* Left: form */}
      <div className="space-y-6 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto lg:pr-2">
        <Group title="Your details">
          <Input label="Full name" value={data.senderName} onChange={(v) => update('senderName', v)} />
          <Input label="Title (optional)" value={data.senderTitle} onChange={(v) => update('senderTitle', v)} />
          <Input label="City, State" value={data.senderCity} onChange={(v) => update('senderCity', v)} />
          <Input label="Phone" value={data.senderPhone} onChange={(v) => update('senderPhone', v)} />
          <Input label="Email" value={data.senderEmail} onChange={(v) => update('senderEmail', v)} />
        </Group>

        <Group title="Date">
          <Input label="Date" value={data.date} onChange={(v) => update('date', v)} />
        </Group>

        <Group title="Recipient">
          <Input label="Name" value={data.recipientName} onChange={(v) => update('recipientName', v)} />
          <Input label="Title (optional)" value={data.recipientTitle} onChange={(v) => update('recipientTitle', v)} />
          <Input label="Company" value={data.recipientCompany} onChange={(v) => update('recipientCompany', v)} />
          <Input label="Address" value={data.recipientAddress} onChange={(v) => update('recipientAddress', v)} />
        </Group>

        <Group title="Greeting">
          <Input label="Salutation" value={data.greeting} onChange={(v) => update('greeting', v)} placeholder="Dear Hiring Team," />
        </Group>

        <Group title="Body" action={
          <button onClick={() => update('paragraphs', [...data.paragraphs, ''])} className="text-xs text-amber-600 hover:underline">+ Paragraph</button>
        }>
          {data.paragraphs.map((p, i) => (
            <div key={i} className="space-y-1">
              <div className="text-xs text-gray-500 dark:text-gray-400">Paragraph {i + 1} · ✨ improves with AI</div>
              <div className="flex gap-1">
                <textarea
                  value={p}
                  onChange={(e) => update('paragraphs', data.paragraphs.map((pp, pi) => pi === i ? e.target.value : pp))}
                  rows={5}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-amber-500 resize-y"
                />
                <div className="flex flex-col gap-1">
                  <button type="button" onClick={() => rewriteParagraph(i)} disabled={busy !== null || !p.trim()} className="px-2 py-1 text-xs rounded bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 disabled:opacity-40">
                    {busy === 'ai' && aiIdx === i ? '…' : '✨'}
                  </button>
                  <button type="button" onClick={() => update('paragraphs', data.paragraphs.filter((_, pi) => pi !== i))} className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs">×</button>
                </div>
              </div>
            </div>
          ))}
        </Group>

        <Group title="Closing">
          <Input label="Closing phrase" value={data.closing} onChange={(v) => update('closing', v)} placeholder="Sincerely," />
        </Group>

        <div className="space-y-2 pt-2 sticky bottom-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur pb-2 -mx-2 px-2 border-t border-gray-200 dark:border-slate-800">
          <div className="flex justify-end"><SignInBadge /></div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={onDownloadPDF} disabled={busy !== null} className="px-4 py-3 rounded-lg text-white font-semibold disabled:opacity-50 transition" style={{ background: '#f59e0b' }}>
              {busy === 'pdf' ? 'Generating…' : '⬇ Download PDF'}
            </button>
            <button onClick={onDownloadDOCX} disabled={busy !== null} className="px-4 py-3 rounded-lg border-2 border-amber-500 text-amber-600 font-semibold disabled:opacity-50 transition hover:bg-amber-50 dark:hover:bg-amber-500/10">
              {busy === 'docx' ? 'Generating…' : '⬇ Download Word'}
            </button>
          </div>
          <DriveSaveButton
            getBlob={() => buildCoverLetterDocxBlob(data)}
            filename={`${filenameBase}.docx`}
            mimeType="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            disabled={busy !== null}
          />
        </div>
      </div>

      {/* Right: preview */}
      <div className="overflow-auto rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-100 dark:bg-slate-900 p-6">
        <div className="mx-auto shadow-lg" style={{ maxWidth: '816px' }}>
          <CoverLetterPreview data={data} innerRef={previewRef} />
        </div>
      </div>
    </div>
  );
}

function Group({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">{title}</h3>
        {action}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</span>
      <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
    </label>
  );
}
