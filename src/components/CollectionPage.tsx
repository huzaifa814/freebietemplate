import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TemplateCard } from '@/components/TemplateCard';
import { JsonLd } from '@/components/JsonLd';
import { resolveCollection } from '@/lib/collections';
import type { Collection } from '@/config/collections';
import { siteConfig } from '@/config/site';

// Shared renderer for /for/[slug] and /seasonal/[slug].
export function CollectionPage({ collection }: { collection: Collection }) {
  const list = resolveCollection(collection);
  const base = collection.kind === 'profession' ? 'for' : 'seasonal';
  const crumbLabel = collection.kind === 'profession' ? 'For' : 'Seasonal';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
          { '@type': 'ListItem', position: 2, name: crumbLabel, item: `${siteConfig.url}/${base}` },
          { '@type': 'ListItem', position: 3, name: collection.heading, item: `${siteConfig.url}/${base}/${collection.slug}` },
        ],
      },
      {
        '@type': 'ItemList',
        name: collection.title,
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
          <Link href={`/${base}`} className="hover:underline">{crumbLabel}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 dark:text-gray-300">{collection.heading}</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold mb-3">{collection.heading}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mb-2">{collection.intro}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">{list.length} free templates · no signup · Word, Excel, Google Docs &amp; Sheets</p>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {list.map((t) => <TemplateCard key={t.slug} t={t} />)}
        </div>
      </main>
      <Footer />
    </>
  );
}
