import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { professionCollections } from '@/config/collections';
import { siteConfig } from '@/config/site';

export const metadata = {
  title: 'Templates by Profession',
  description: `Free template collections for teachers, freelancers, small business owners, real estate agents, students, and more — from ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.url}/for` },
};

export default function ForIndex() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Templates by Profession</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mb-10">Hand-picked free template bundles for your line of work — everything you need in one place.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {professionCollections.map((c) => (
            <Link key={c.slug} href={`/for/${c.slug}`} className="group rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:border-amber-500 hover:shadow-md transition">
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
