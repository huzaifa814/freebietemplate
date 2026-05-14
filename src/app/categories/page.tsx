import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { categories, templates } from '@/config/templates';
import { siteConfig } from '@/config/site';

export const metadata = {
  title: 'Categories',
  description: `Browse ${siteConfig.name} templates by category — resumes, bookkeeping, invoices, planners.`,
};

export default function CategoriesIndex() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Template Categories</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mb-10">Pick a category to see every free template in it.</p>
        <div className="grid gap-6 sm:grid-cols-2">
          {categories.map((c) => {
            const count = templates.filter((t) => t.category === c.id).length;
            return (
              <Link key={c.id} href={`/categories/${c.id}`} className="group p-6 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-4xl">{c.icon}</div>
                  <div>
                    <h2 className="font-bold text-xl group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">{c.title}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{count} {count === 1 ? 'template' : 'templates'}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{c.description}</p>
              </Link>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}
