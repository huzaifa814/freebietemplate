import Link from 'next/link';
import type { Template } from '@/config/templates';

export function TemplateCard({ t }: { t: Template }) {
  return (
    <Link
      href={`/templates/${t.slug}`}
      className="group rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 hover:shadow-md transition overflow-hidden flex flex-col"
    >
      <div className="relative aspect-[800/1035] bg-white overflow-hidden border-b border-gray-100 dark:border-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/previews/${t.slug}.png`}
          alt={`${t.title} preview`}
          className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-white/95 backdrop-blur text-amber-700 font-semibold shadow-sm">
          Free · Etsy {t.etsyPrice}
        </div>
      </div>
      <div className="p-4 flex-1">
        <div className="flex items-start gap-2 mb-1">
          <span className="text-lg shrink-0">{t.icon}</span>
          <h3 className="font-semibold text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition leading-snug">{t.title}</h3>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{t.description}</p>
      </div>
    </Link>
  );
}
