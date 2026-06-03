import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdSlot } from '@/components/AdSlot';
import { JsonLd } from '@/components/JsonLd';
import { guides, getGuide } from '@/config/guides';
import { getTemplate } from '@/config/templates';
import { siteConfig } from '@/config/site';

export const dynamicParams = false;

export async function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return {};
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: `${siteConfig.url}/guides/${g.slug}` },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return notFound();
  const related = g.relatedSlugs.map((s) => getTemplate(s)).filter((t): t is NonNullable<typeof t> => Boolean(t));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: `${siteConfig.url}/guides` },
          { '@type': 'ListItem', position: 3, name: g.title, item: `${siteConfig.url}/guides/${g.slug}` },
        ],
      },
      g.howto
        ? {
            '@type': 'HowTo',
            name: g.title,
            description: g.description,
            step: g.sections.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.h, text: s.p.join(' ') })),
          }
        : {
            '@type': 'Article',
            headline: g.title,
            description: g.description,
            datePublished: g.updated,
            dateModified: g.updated,
            author: { '@type': 'Organization', name: siteConfig.name },
            publisher: { '@type': 'Organization', name: siteConfig.name },
            mainEntityOfPage: `${siteConfig.url}/guides/${g.slug}`,
          },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/guides" className="hover:underline">Guides</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 dark:text-gray-300">{g.title}</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold mb-3">{g.title}</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-8">{g.readMinutes} min read · Updated {new Date(g.updated).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>

        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">{g.intro}</p>

        <div className="space-y-8">
          {g.sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-2xl font-bold mb-3">{s.h}</h2>
              {s.p.map((para, i) => (
                <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{para}</p>
              ))}
            </section>
          ))}
        </div>

        <div className="my-10"><AdSlot /></div>

        {related.length > 0 && (
          <section className="mt-10 pt-8 border-t border-gray-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold mb-6">Templates for this guide</h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
              {related.map((r) => (
                <Link key={r.slug} href={`/templates/${r.slug}`} className="group rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 hover:shadow-md transition overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/previews/${r.slug}.png`} alt={r.title} className="w-full aspect-[800/1035] object-cover object-top bg-white" loading="lazy" />
                  <div className="p-3">
                    <h3 className="font-semibold text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition line-clamp-2">{r.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
