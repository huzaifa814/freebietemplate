import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { templates, categories } from '@/config/templates';
import { siteConfig } from '@/config/site';

export const metadata = {
  title: 'All Templates',
  description: `Every free template on ${siteConfig.name} — resumes, bookkeeping, invoices, budgets, planners. Word, Excel, Google Docs, Sheets.`,
};

export default function TemplatesIndex() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">All Templates</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mb-10">{templates.length} free templates across {categories.length} categories. Click any template for download links and details.</p>

        {categories.map((c) => {
          const list = templates.filter((t) => t.category === c.id);
          if (list.length === 0) return null;
          return (
            <section key={c.id} className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2"><span>{c.icon}</span> {c.title}</h2>
                <Link href={`/categories/${c.id}`} className="text-sm font-medium hover:underline" style={{ color: siteConfig.brandColor }}>See category →</Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {list.map((t) => (
                  <Link key={t.slug} href={`/templates/${t.slug}`} className="group p-5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-2xl">{t.icon}</div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">Free · Etsy {t.etsyPrice}</span>
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">{t.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{t.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </main>
      <Footer />
    </>
  );
}
