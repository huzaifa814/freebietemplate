import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { siteConfig } from '@/config/site';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-24 text-center max-w-xl">
        <div className="text-7xl mb-6">📄</div>
        <h1 className="text-4xl font-bold mb-3">Template not found</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">We could not find that page. Try the template index — there are 12 free ones waiting.</p>
        <Link href="/templates" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition" style={{ background: siteConfig.brandColor }}>Browse all templates →</Link>
      </main>
      <Footer />
    </>
  );
}
