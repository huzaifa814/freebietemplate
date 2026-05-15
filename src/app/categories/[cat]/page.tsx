import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TemplateCard } from '@/components/TemplateCard';
import { categories, getCategory, getTemplatesByCategory, Category } from '@/config/templates';
import { siteConfig } from '@/config/site';

export const dynamicParams = false;

export async function generateStaticParams() {
  return categories.map((c) => ({ cat: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params;
  const c = getCategory(cat as Category);
  if (!c) return {};
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: `${siteConfig.url}/categories/${c.id}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params;
  const c = getCategory(cat as Category);
  if (!c) return notFound();
  const list = getTemplatesByCategory(cat as Category);

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/categories" className="hover:underline">Categories</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 dark:text-gray-300">{c.title}</span>
        </nav>

        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl">{c.icon}</div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">{c.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{list.length} free {list.length === 1 ? 'template' : 'templates'}</p>
          </div>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mb-10">{c.description}</p>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {list.map((t) => <TemplateCard key={t.slug} t={t} />)}
        </div>
      </main>
      <Footer />
    </>
  );
}
