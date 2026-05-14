import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
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
      </main>
      <Footer />
    </>
  );
}
