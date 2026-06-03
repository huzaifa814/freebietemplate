import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { seasonalCollections } from '@/config/collections';
import { siteConfig } from '@/config/site';

export const metadata = {
  title: 'Seasonal & Holiday Templates',
  description: `Free seasonal template collections — New Year goals, Christmas, back-to-school, wedding season, summer, and tax season — from ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.url}/seasonal` },
};

export default function SeasonalIndex() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Seasonal &amp; Holiday Templates</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mb-10">Free template bundles for every time of year — plan ahead and stay organized through the seasons.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {seasonalCollections.map((c) => (
            <Link key={c.slug} href={`/seasonal/${c.slug}`} className="group rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:border-amber-500 hover:shadow-md transition">
              <h2 className="text-xl font-bold mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">{c.heading}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{c.intro}</p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
