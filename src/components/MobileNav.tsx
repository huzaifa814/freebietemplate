'use client';
import { useState } from 'react';
import Link from 'next/link';
import { siteConfig, navConfig } from '@/config/site';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-6 w-6">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 top-16 z-40 bg-black/20" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-16 z-50 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg">
            <nav className="container mx-auto px-4 py-2 flex flex-col">
              {navConfig.main.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="px-2 py-3 text-base font-medium text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-slate-800">
                  {item.title}
                </Link>
              ))}
              <Link href="/templates" onClick={() => setOpen(false)} className="my-3 px-4 py-3 rounded-lg text-white font-medium text-center" style={{ background: siteConfig.brandColor }}>
                Browse Templates →
              </Link>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
