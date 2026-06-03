'use client';
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { exportElementToPDF } from '@/lib/exporters';

// Shared building blocks for the in-browser editors.

export function Group({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
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

export function Input({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
    </label>
  );
}

export function TextArea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</span>
      <textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-amber-500 resize-y" />
    </label>
  );
}

// Editor shell: left form column + sticky download bar, right live preview.
// `renderPreview` receives the ref to attach to the printable sheet element.
export function EditorShell({
  filenameBase,
  previewWidth = 816,
  children,
  renderPreview,
}: {
  filenameBase: string;
  previewWidth?: number;
  children: ReactNode;
  renderPreview: (ref: RefObject<HTMLDivElement | null>) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState(false);

  async function downloadPDF() {
    if (!ref.current) return;
    setBusy(true);
    try { await exportElementToPDF(ref.current, `${filenameBase}.pdf`); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <div className="space-y-6 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto lg:pr-2">
        {children}
        <div className="space-y-2 pt-2 sticky bottom-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur pb-2 -mx-2 px-2 border-t border-gray-200 dark:border-slate-800">
          <button onClick={downloadPDF} disabled={busy} className="w-full px-4 py-3 rounded-lg text-white font-semibold disabled:opacity-50 transition" style={{ background: '#f59e0b' }}>
            {busy ? 'Generating…' : '⬇ Download PDF'}
          </button>
          <p className="text-xs text-center text-gray-400">Your edits autosave in this browser. The PDF prints clean — no watermark.</p>
        </div>
      </div>
      <div className="overflow-auto rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-100 dark:bg-slate-900 p-6">
        <div className="mx-auto shadow-lg bg-white" style={{ maxWidth: `${previewWidth}px` }}>
          {renderPreview(ref)}
        </div>
      </div>
    </div>
  );
}

// localStorage-backed state hook. Loads in an effect (after hydration) to avoid
// SSR/client mismatch, then debounce-saves on change.
export function usePersistentState<T>(key: string, initial: T): [T, (updater: (prev: T) => T) => void, boolean] {
  const [state, setState] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(key); if (raw) setState(JSON.parse(raw)); } catch { /* ignore */ }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    const id = setTimeout(() => { try { localStorage.setItem(key, JSON.stringify(state)); } catch { /* quota */ } }, 400);
    return () => clearTimeout(id);
  }, [state, loaded, key]);

  const update = (updater: (prev: T) => T) => setState(updater);
  return [state, update, loaded];
}
