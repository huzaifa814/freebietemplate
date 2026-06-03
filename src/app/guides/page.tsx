import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { guides } from '@/config/guides';
import { siteConfig } from '@/config/site';

export const metadata = {
  title: 'Guides & How-Tos',
  description: `Free how-to guides from ${siteConfig.name} — editing templates, budgeting, resumes, invoicing, wedding planning, and more.`,
  alternates: { canonical: `${siteConfig.url}/guides` },
};

export default function GuidesIndex() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Guides &amp; How-Tos</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mb-10">Short, practical guides to get the most out of our free templates — and to handle the everyday tasks they’re built for.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          {guides.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="group rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:border-amber-500 hover:shadow-md transition">
              <div className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2">{g.readMinutes} min read</div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">{g.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{g.description}</p>
              <span className="inline-block mt-3 text-sm font-medium" style={{ color: siteConfig.brandColor }}>Read guide →</span>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
