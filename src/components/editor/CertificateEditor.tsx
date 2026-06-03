'use client';
import { type RefObject } from 'react';
import { Group, Input, TextArea, EditorShell, usePersistentState } from './editorUI';

interface CertData {
  heading: string; subtitle: string; recipient: string; body: string;
  date: string; signLeft: string; signRight: string; accent: string;
}

const sample: CertData = {
  heading: 'CERTIFICATE', subtitle: 'OF ACHIEVEMENT', recipient: 'Recipient Name',
  body: 'in recognition of outstanding effort and dedication, and for successfully meeting every requirement with excellence.',
  date: 'June 3, 2026', signLeft: 'Date', signRight: 'Signature', accent: '#b45309',
};

const ACCENTS = ['#b45309', '#1d4ed8', '#15803d', '#9d174d', '#6d28d9', '#0f766e'];

export function CertificateEditor() {
  const [data, update] = usePersistentState<CertData>('freebietemplate.certificate', sample);
  const set = <K extends keyof CertData>(k: K, v: CertData[K]) => update((d) => ({ ...d, [k]: v }));
  const filenameBase = (data.recipient || 'certificate').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '-certificate';

  return (
    <EditorShell filenameBase={filenameBase} renderPreview={(ref) => <CertPreview data={data} innerRef={ref} />}>
      <Group title="Title">
        <Input label="Heading" value={data.heading} onChange={(v) => set('heading', v)} />
        <Input label="Subtitle" value={data.subtitle} onChange={(v) => set('subtitle', v)} />
      </Group>
      <Group title="Recipient">
        <Input label="Presented to" value={data.recipient} onChange={(v) => set('recipient', v)} />
        <TextArea label="Reason / body" value={data.body} onChange={(v) => set('body', v)} rows={3} />
      </Group>
      <Group title="Footer">
        <Input label="Date" value={data.date} onChange={(v) => set('date', v)} />
        <Input label="Left line label" value={data.signLeft} onChange={(v) => set('signLeft', v)} />
        <Input label="Right line label" value={data.signRight} onChange={(v) => set('signRight', v)} />
      </Group>
      <Group title="Accent color">
        <div className="flex gap-2">
          {ACCENTS.map((c) => (
            <button key={c} onClick={() => set('accent', c)} aria-label={`accent ${c}`} className={`h-8 w-8 rounded-full border-2 ${data.accent === c ? 'border-gray-800 dark:border-white' : 'border-transparent'}`} style={{ background: c }} />
          ))}
        </div>
      </Group>
    </EditorShell>
  );
}

function CertPreview({ data, innerRef }: { data: CertData; innerRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={innerRef} className="bg-white text-gray-900 flex items-center justify-center p-6" style={{ aspectRatio: '816 / 1056', fontFamily: 'Georgia, serif' }}>
      <div className="w-full h-full flex flex-col items-center justify-center text-center px-10" style={{ border: `6px solid ${data.accent}`, outline: `2px solid ${data.accent}`, outlineOffset: '6px' }}>
        <div className="text-5xl font-extrabold tracking-wide" style={{ color: data.accent, fontFamily: 'Arial, sans-serif' }}>{data.heading}</div>
        <div className="text-lg font-bold tracking-[0.2em] text-gray-500 mt-2" style={{ fontFamily: 'Arial, sans-serif' }}>{data.subtitle}</div>
        <div className="w-24 h-0.5 my-6" style={{ background: data.accent }} />
        <div className="text-base text-gray-600 italic">This certificate is proudly presented to</div>
        <div className="text-4xl italic my-4" style={{ color: '#1f2937' }}>{data.recipient}</div>
        <div className="w-80 h-px bg-gray-300 mb-6" />
        <p className="text-sm text-gray-600 max-w-md leading-relaxed">{data.body}</p>
        <div className="my-7 flex items-center justify-center" style={{ width: 84, height: 84 }}>
          <div className="rounded-full flex items-center justify-center" style={{ width: 84, height: 84, background: data.accent }}>
            <span className="text-white text-3xl" style={{ fontFamily: 'Arial, sans-serif' }}>★</span>
          </div>
        </div>
        <div className="flex justify-between w-full max-w-md mt-2" style={{ fontFamily: 'Arial, sans-serif' }}>
          <div className="text-center">
            <div className="w-40 border-t border-gray-500 pt-1 text-xs text-gray-500">{data.date || data.signLeft}</div>
          </div>
          <div className="text-center">
            <div className="w-40 border-t border-gray-500 pt-1 text-xs text-gray-500">{data.signRight}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
