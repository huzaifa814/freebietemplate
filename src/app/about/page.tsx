import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { siteConfig } from '@/config/site';

export const metadata = { title: 'About', description: `About ${siteConfig.name} — free professional templates that Etsy sellers charge $10+ for.` };

export default function About() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">About {siteConfig.name}</h1>
        <div className="prose dark:prose-invert max-w-none space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>{siteConfig.name} is a free, ad-supported library of professional templates: resumes, bookkeeping spreadsheets, invoices, budgets, and planners. Every template here is the kind of thing you would normally pay $7–$18 for on Etsy.</p>

          <h2 className="text-2xl font-bold mt-8 mb-3">Why build a free version?</h2>
          <p>Etsy template shops are a $400M+ market. The product is usually great, but the pricing is built on the fact that people don&apos;t have time to make their own. We have time and an opinion about what a good template should look like — so we made our own, and we&apos;re giving them away.</p>

          <h2 className="text-2xl font-bold mt-8 mb-3">How are we paid?</h2>
          <p>A single banner ad on the template detail page. That&apos;s it. No subscriptions, no Pro tier, no email collection, no &quot;sign up to download.&quot; If ad-blockers cost us a few dollars, that&apos;s fine — the templates still load and you still get them.</p>

          <h2 className="text-2xl font-bold mt-8 mb-3">Can I use these commercially?</h2>
          <p>Yes. Every template is free for personal and commercial use, no attribution required. The one exception: don&apos;t take a template, slap your name on it, and resell it as your own. Use it for your business, your résumé, your clients — go nuts.</p>

          <h2 className="text-2xl font-bold mt-8 mb-3">Sister sites</h2>
          <p>{siteConfig.name} is part of a small portfolio of free, browser-first tools. Check out <a href="https://www.pdfshed.com" className="text-amber-600 dark:text-amber-400 hover:underline">PDFShed</a> for PDFs, <a href="https://www.pixshed.com" className="text-amber-600 dark:text-amber-400 hover:underline">PixShed</a> for images, <a href="https://www.simplycalcs.com" className="text-amber-600 dark:text-amber-400 hover:underline">SimplyCalcs</a> for calculators, and <a href="https://www.resumeshed.com" className="text-amber-600 dark:text-amber-400 hover:underline">ResumeShed</a> for resume building.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
