import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TemplateCard } from '@/components/TemplateCard';
import { siteConfig } from '@/config/site';
import { templates, categories } from '@/config/templates';

export default function HomePage() {
  const featured = templates.slice(0, 6);
  return (
    <>
      <Header />
      <main>
        <section className="container mx-auto px-4 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium mb-6">
            ⚡ Free · No Signup · The $10 Etsy templates, free
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto leading-tight">
            Free <span style={{ color: siteConfig.brandColor }}>Templates</span> Etsy Charges $10+ For
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            Resumes, bookkeeping spreadsheets, invoices, budgets, planners. Word, Excel, Google Docs, Google Sheets. Click <em>Make a Copy</em> and they&apos;re yours. No signup, no watermark.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/templates" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition" style={{ background: siteConfig.brandColor }}>Browse All Templates →</Link>
            <Link href="/categories/resume" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 dark:border-slate-700 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition">Resume Templates</Link>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {[
              { icon: '💸', title: '$0, not $10', body: 'Same quality as the Etsy bestsellers — without the price. Download the .docx/.xlsx or copy directly into Google Docs/Sheets.' },
              { icon: '🤖', title: 'ATS-Friendly Resumes', body: 'Resume designs tested in real applicant-tracking systems. No fancy graphics that get stripped. Just clean structure recruiters can read.' },
              { icon: '🔓', title: 'No Signup', body: 'No email collection, no account, no "sign up to download." Click the link, the template is yours.' },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Browse by Category</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {categories.map((c) => (
              <Link key={c.id} href={`/categories/${c.id}`} className="group p-6 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 hover:shadow-md transition">
                <div className="text-3xl mb-3">{c.icon}</div>
                <h3 className="font-semibold mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">{c.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{c.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Popular Templates</h2>
            <Link href="/templates" className="text-sm font-medium hover:underline" style={{ color: siteConfig.brandColor }}>View all →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {featured.map((t) => <TemplateCard key={t.slug} t={t} />)}
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 text-center">
          <div className="p-10 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Why is this free when Etsy sellers charge $10+?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">A small banner ad pays the hosting bill. That&apos;s the whole business model. No upsells, no Pro tier, no &quot;sign up to download.&quot;</p>
            <Link href="/about" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition" style={{ background: siteConfig.brandColor }}>Read the story →</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
