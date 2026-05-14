import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { siteConfig } from '@/config/site';

export const metadata = { title: 'Contact', description: `Get in touch with ${siteConfig.name}.` };

export default function Contact() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">Contact</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Template request, bug report, partnership, or just want to say hi — email works.</p>
        <a href={`mailto:${siteConfig.email}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition" style={{ background: siteConfig.brandColor }}>
          ✉️ {siteConfig.email}
        </a>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">We read every email and reply to most within 2 business days.</p>
      </main>
      <Footer />
    </>
  );
}
