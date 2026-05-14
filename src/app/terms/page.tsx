import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { siteConfig } from '@/config/site';

export const metadata = { title: 'Terms of Use', description: `Terms of use for ${siteConfig.name}.` };

export default function Terms() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-2">Terms of Use</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        <div className="prose dark:prose-invert max-w-none space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
          <h2 className="text-2xl font-bold mt-6 mb-2">License</h2>
          <p>All templates on {siteConfig.name} are licensed under a simple permissive license: <strong>you can use them for personal and commercial work, including for clients, with no attribution required.</strong> You may modify them freely.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">What you cannot do</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Resell our templates as your own product (on Etsy, Creative Market, Gumroad, etc.).</li>
            <li>Bundle our templates into a paid template pack.</li>
            <li>Pass off our templates as your original work in template marketplaces.</li>
          </ul>
          <p>Using a downloaded template inside your own consulting deliverable, resume, or company financials is completely fine — that is exactly what they are for.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">No warranty</h2>
          <p>Templates are provided as-is. We have tested them in current versions of Microsoft Office and Google Workspace, but if something does not look right in your specific version, we cannot guarantee a fix.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">Acceptable use</h2>
          <p>Don&apos;t use this site to scrape templates in bulk for redistribution. Don&apos;t use it to host malware (your template files come from us anyway). Be reasonable.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">Changes</h2>
          <p>We may update these terms occasionally. Continued use after changes means acceptance.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
