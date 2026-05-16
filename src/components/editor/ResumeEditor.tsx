'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ResumeData, sampleResume } from '@/lib/resumeSchema';
import { ResumePreview } from './ResumePreview';
import { exportElementToPDF, exportResumeToDocx } from '@/lib/exporters';

const STORAGE_KEY = 'freebietemplate.resume.minimalist';

export function ResumeEditor() {
  const [data, setData] = useState<ResumeData>(sampleResume);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<null | 'pdf' | 'docx'>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load draft from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  // Autosave draft
  useEffect(() => {
    if (!loaded) return;
    const id = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* quota */ }
    }, 400);
    return () => clearTimeout(id);
  }, [data, loaded]);

  const update = <K extends keyof ResumeData>(k: K, v: ResumeData[K]) => setData((d) => ({ ...d, [k]: v }));

  const filenameBase = useMemo(() => (data.name || 'resume').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'resume', [data.name]);

  async function onDownloadPDF() {
    if (!previewRef.current) return;
    setBusy('pdf');
    try { await exportElementToPDF(previewRef.current, `${filenameBase}.pdf`); }
    finally { setBusy(null); }
  }
  async function onDownloadDOCX() {
    setBusy('docx');
    try { await exportResumeToDocx(data, `${filenameBase}.docx`); }
    finally { setBusy(null); }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      {/* Left: editor form */}
      <div className="space-y-6 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto lg:pr-2">
        <FieldGroup title="Basics">
          <Input label="Full name" value={data.name} onChange={(v) => update('name', v)} />
          <Input label="Title / role" value={data.title} onChange={(v) => update('title', v)} />
          <Input label="City, State" value={data.city} onChange={(v) => update('city', v)} />
          <Input label="Phone" value={data.phone} onChange={(v) => update('phone', v)} />
          <Input label="Email" value={data.email} onChange={(v) => update('email', v)} type="email" />
          <Input label="LinkedIn" value={data.linkedin} onChange={(v) => update('linkedin', v)} placeholder="linkedin.com/in/you" />
        </FieldGroup>

        <FieldGroup title="Summary">
          <Textarea value={data.summary} onChange={(v) => update('summary', v)} rows={4} placeholder="2-3 sentences about who you are and what you're targeting." />
        </FieldGroup>

        <FieldGroup
          title="Experience"
          action={
            <button onClick={() => update('experience', [...data.experience, { title: '', company: '', location: '', start: '', end: '', bullets: [''] }])} className="text-xs text-amber-600 hover:underline">+ Add job</button>
          }
        >
          {data.experience.map((job, i) => (
            <div key={i} className="space-y-2 p-3 rounded-lg border border-gray-200 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <Input label="Title" value={job.title} onChange={(v) => update('experience', data.experience.map((j, ji) => ji === i ? { ...j, title: v } : j))} />
                <Input label="Company" value={job.company} onChange={(v) => update('experience', data.experience.map((j, ji) => ji === i ? { ...j, company: v } : j))} />
                <Input label="Location" value={job.location} onChange={(v) => update('experience', data.experience.map((j, ji) => ji === i ? { ...j, location: v } : j))} />
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Start" value={job.start} onChange={(v) => update('experience', data.experience.map((j, ji) => ji === i ? { ...j, start: v } : j))} placeholder="Jan 2022" />
                  <Input label="End" value={job.end} onChange={(v) => update('experience', data.experience.map((j, ji) => ji === i ? { ...j, end: v } : j))} placeholder="Present" />
                </div>
              </div>
              <BulletList
                bullets={job.bullets}
                onChange={(b) => update('experience', data.experience.map((j, ji) => ji === i ? { ...j, bullets: b } : j))}
              />
              <button onClick={() => update('experience', data.experience.filter((_, ji) => ji !== i))} className="text-xs text-red-600 hover:underline">Remove job</button>
            </div>
          ))}
        </FieldGroup>

        <FieldGroup
          title="Education"
          action={
            <button onClick={() => update('education', [...data.education, { degree: '', school: '', location: '', year: '' }])} className="text-xs text-amber-600 hover:underline">+ Add</button>
          }
        >
          {data.education.map((ed, i) => (
            <div key={i} className="space-y-2 p-3 rounded-lg border border-gray-200 dark:border-slate-800">
              <Input label="Degree" value={ed.degree} onChange={(v) => update('education', data.education.map((e, ei) => ei === i ? { ...e, degree: v } : e))} />
              <Input label="School" value={ed.school} onChange={(v) => update('education', data.education.map((e, ei) => ei === i ? { ...e, school: v } : e))} />
              <div className="grid grid-cols-2 gap-2">
                <Input label="Location" value={ed.location} onChange={(v) => update('education', data.education.map((e, ei) => ei === i ? { ...e, location: v } : e))} />
                <Input label="Year" value={ed.year} onChange={(v) => update('education', data.education.map((e, ei) => ei === i ? { ...e, year: v } : e))} />
              </div>
              <button onClick={() => update('education', data.education.filter((_, ei) => ei !== i))} className="text-xs text-red-600 hover:underline">Remove</button>
            </div>
          ))}
        </FieldGroup>

        <FieldGroup title="Skills (comma-separated)">
          <Textarea
            value={data.skills.join(', ')}
            onChange={(v) => update('skills', v.split(',').map((s) => s.trim()).filter(Boolean))}
            rows={3}
          />
        </FieldGroup>

        <div className="grid grid-cols-2 gap-2 pt-2 sticky bottom-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur pb-2 -mx-2 px-2 border-t border-gray-200 dark:border-slate-800">
          <button
            onClick={onDownloadPDF}
            disabled={busy !== null}
            className="px-4 py-3 rounded-lg text-white font-semibold disabled:opacity-50 transition"
            style={{ background: '#f59e0b' }}
          >
            {busy === 'pdf' ? 'Generating…' : '⬇ Download PDF'}
          </button>
          <button
            onClick={onDownloadDOCX}
            disabled={busy !== null}
            className="px-4 py-3 rounded-lg border-2 border-amber-500 text-amber-600 font-semibold disabled:opacity-50 transition hover:bg-amber-50 dark:hover:bg-amber-500/10"
          >
            {busy === 'docx' ? 'Generating…' : '⬇ Download Word'}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2 px-1">Drafts autosave to this browser. Clear browser data to wipe.</p>
      </div>

      {/* Right: live preview */}
      <div className="overflow-auto rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-100 dark:bg-slate-900 p-6">
        <div className="mx-auto shadow-lg" style={{ maxWidth: '816px', transform: 'scale(1)', transformOrigin: 'top center' }}>
          <ResumePreview data={data} innerRef={previewRef} />
        </div>
      </div>
    </div>
  );
}

// ---- Form primitives ----

function FieldGroup({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
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

function Input({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
      />
    </label>
  );
}

function Textarea({ value, onChange, rows = 3, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-y"
    />
  );
}

function BulletList({ bullets, onChange }: { bullets: string[]; onChange: (b: string[]) => void }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-gray-500 dark:text-gray-400">Bullet points</div>
      {bullets.map((b, i) => (
        <div key={i} className="flex gap-1">
          <textarea
            value={b}
            onChange={(e) => onChange(bullets.map((bb, bi) => bi === i ? e.target.value : bb))}
            rows={2}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-amber-500 resize-y"
          />
          <button onClick={() => onChange(bullets.filter((_, bi) => bi !== i))} className="px-2 text-red-600 hover:bg-red-50 rounded">×</button>
        </div>
      ))}
      <button onClick={() => onChange([...bullets, ''])} className="text-xs text-amber-600 hover:underline">+ Add bullet</button>
    </div>
  );
}
