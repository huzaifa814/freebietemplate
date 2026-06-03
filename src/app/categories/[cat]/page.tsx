import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TemplateCard } from '@/components/TemplateCard';
import { JsonLd } from '@/components/JsonLd';
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
  const og = `/og/category/${c.id}.png`;
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: `${siteConfig.url}/categories/${c.id}` },
    openGraph: { title: c.title, description: c.description, images: [{ url: og, width: 1200, height: 630, alt: c.title }] },
    twitter: { card: 'summary_large_image', title: c.title, description: c.description, images: [og] },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params;
  const c = getCategory(cat as Category);
  if (!c) return notFound();
  const list = getTemplatesByCategory(cat as Category);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
          { '@type': 'ListItem', position: 2, name: 'Categories', item: `${siteConfig.url}/categories` },
          { '@type': 'ListItem', position: 3, name: c.title, item: `${siteConfig.url}/categories/${c.id}` },
        ],
      },
      {
        '@type': 'ItemList',
        name: c.title,
        numberOfItems: list.length,
        itemListElement: list.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.title, url: `${siteConfig.url}/templates/${t.slug}` })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
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
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mb-6">{c.description}</p>

        <a
          href={`/bundles/${c.id}.zip`}
          download
          className="inline-flex items-center gap-2 mb-10 px-5 py-3 rounded-xl text-white font-semibold shadow-md hover:opacity-90 transition"
          style={{ background: siteConfig.brandColor }}
        >
          <span className="text-xl">⬇</span>
          Download all {list.length} {c.title} templates (ZIP)
        </a>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {list.map((t) => <TemplateCard key={t.slug} t={t} />)}
        </div>
      </main>
      <Footer />
    </>
  );
}
