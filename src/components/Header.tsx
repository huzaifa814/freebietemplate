import Link from 'next/link';
import { siteConfig, navConfig } from '@/config/site';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/70 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: siteConfig.brandColor }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h8M8 11h8M8 15h5" /></svg>
          </span>
          <span>{siteConfig.name}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navConfig.main.map((item) => (
            <Link key={item.href} href={item.href} className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition">
              {item.title}
            </Link>
          ))}
        </nav>
        <Link href="/templates" className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium text-sm hover:opacity-90 transition" style={{ background: siteConfig.brandColor }}>
          Browse Templates →
        </Link>
      </div>
    </header>
  );
}
