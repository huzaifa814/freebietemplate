import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TemplateCard } from '@/components/TemplateCard';
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
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {list.map((t) => <TemplateCard key={t.slug} t={t} />)}
              </div>
            </section>
          );
        })}
      </main>
      <Footer />
    </>
  );
}
