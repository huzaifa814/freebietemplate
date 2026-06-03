import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TemplatesBrowser } from '@/components/TemplatesBrowser';
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
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mb-6">{templates.length} free templates across {categories.length} categories. Search, filter, or browse — click any template for download links and details.</p>

        <TemplatesBrowser templates={templates} categories={categories} />
      </main>
      <Footer />
    </>
  );
}
