'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { TemplateCard } from './TemplateCard';
import type { Template, Category } from '@/config/templates';
import { siteConfig } from '@/config/site';

interface Cat { id: Category; title: string; icon: string }

export function TemplatesBrowser({ templates, categories }: { templates: Template[]; categories: Cat[] }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<Category | 'all'>('all');

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of templates) m.set(t.category, (m.get(t.category) || 0) + 1);
    return m;
  }, [templates]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates.filter((t) => {
      if (active !== 'all' && t.category !== active) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [templates, query, active]);

  // When no search and "all", keep the grouped-by-category view (better for browsing/SEO).
  const grouped = !query.trim() && active === 'all';

  return (
    <div>
      {/* Search + filter controls */}
      <div className="sticky top-16 z-30 -mx-4 px-4 py-3 mb-8 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-gray-200/70 dark:border-slate-800">
        <div className="relative mb-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${templates.length} templates… (e.g. budget, wedding, invoice)`}
            aria-label="Search templates"
            className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-11 pr-4 py-3 text-base outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-none">
          <button
            onClick={() => setActive('all')}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium border transition ${active === 'all' ? 'text-white border-transparent' : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-700 hover:border-amber-500'}`}
            style={active === 'all' ? { background: siteConfig.brandColor } : undefined}
          >
            All ({templates.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium border transition flex items-center gap-1.5 ${active === c.id ? 'text-white border-transparent' : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-700 hover:border-amber-500'}`}
              style={active === c.id ? { background: siteConfig.brandColor } : undefined}
            >
              <span>{c.icon}</span> {c.title} ({counts.get(c.id) || 0})
            </button>
          ))}
        </div>
      </div>

      {grouped ? (
        categories.map((c) => {
          const list = templates.filter((t) => t.category === c.id);
          if (list.length === 0) return null;
          return (
            <section key={c.id} className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2"><span>{c.icon}</span> {c.title}</h2>
                <Link href={`/categories/${c.id}`} className="text-sm font-medium hover:underline" style={{ color: siteConfig.brandColor }}>See category →</Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {list.map((t) => <TemplateCard key={t.slug} t={t} />)}
              </div>
            </section>
          );
        })
      ) : (
        <section className="mb-12">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {filtered.length} {filtered.length === 1 ? 'template' : 'templates'}
            {query.trim() && <> for “{query.trim()}”</>}
          </p>
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <p className="text-lg mb-2">No templates match that search.</p>
              <button onClick={() => { setQuery(''); setActive('all'); }} className="font-medium hover:underline" style={{ color: siteConfig.brandColor }}>Clear filters</button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((t) => <TemplateCard key={t.slug} t={t} />)}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
