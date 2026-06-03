'use client';
import { useEffect } from 'react';

// Renders Google's official "Save to Drive" widget. It saves the public file
// URL straight into the visitor's Google Drive — no OAuth, no backend. From
// Drive they can open the .xlsx/.docx with Google Sheets/Docs.
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gapi?: { savetodrive?: { go?: (container?: string) => void } } & Record<string, any>;
  }
}

function loadPlatform(cb: () => void) {
  if (typeof window === 'undefined') return;
  if (window.gapi?.savetodrive) { cb(); return; }
  const existing = document.getElementById('gapi-platform-js');
  if (existing) { existing.addEventListener('load', cb); return; }
  const s = document.createElement('script');
  s.id = 'gapi-platform-js';
  s.src = 'https://apis.google.com/js/platform.js';
  s.async = true;
  s.defer = true;
  s.onload = cb;
  document.body.appendChild(s);
}

export function SaveToDriveButton({ src, filename }: { src: string; filename: string }) {
  useEffect(() => {
    loadPlatform(() => {
      try { window.gapi?.savetodrive?.go?.(); } catch { /* widget unavailable */ }
    });
  }, [src]);

  return (
    <div
      className="g-savetodrive"
      data-src={src}
      data-filename={filename}
      data-sitename="FreebieTemplate"
    />
  );
}
