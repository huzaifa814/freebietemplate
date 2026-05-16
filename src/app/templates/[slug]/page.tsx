import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdSlot } from '@/components/AdSlot';
import { templates, getTemplate, getCategory } from '@/config/templates';
import { siteConfig } from '@/config/site';

export const dynamicParams = false;

export async function generateStaticParams() {
  return templates.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = getTemplate(slug);
  if (!t) return {};
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: `${siteConfig.url}/templates/${t.slug}` },
  };
}

const formatLabel: Record<string, string> = {
  docx: 'Word (.docx)',
  xlsx: 'Excel (.xlsx)',
  pdf: 'PDF',
  gdocs: 'Google Docs',
  gsheets: 'Google Sheets',
  html: 'HTML',
};

const EDITABLE_SLUGS = new Set(['minimalist-resume', 'modern-two-column-resume']);

export default async function TemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = getTemplate(slug);
  if (!t) return notFound();
  const cat = getCategory(t.category);
  const related = templates.filter((x) => x.category === t.category && x.slug !== t.slug).slice(0, 3);

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/templates" className="hover:underline">Templates</Link>
          <span className="mx-2">/</span>
          {cat && (<><Link href={`/categories/${cat.id}`} className="hover:underline">{cat.title}</Link><span className="mx-2">/</span></>)}
          <span className="text-gray-700 dark:text-gray-300">{t.title}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-2 mb-10">
          {/* Left: Preview image */}
          <div className="relative">
            <div className="sticky top-24 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/previews/${t.slug}.png`}
                alt={`Preview of ${t.title}`}
                width={800}
                height={1035}
                className="w-full h-auto block"
                loading="eager"
              />
            </div>
            <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
              Preview — your downloaded file is fully editable.
            </div>
          </div>

          {/* Right: Title, badge, download buttons */}
          <div>
            <div className="flex items-start gap-3 mb-4">
              <div className="text-4xl">{t.icon}</div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
                <p className="text-base text-gray-600 dark:text-gray-400">{t.description}</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-medium mb-6">
              💰 Free — sells for {t.etsyPrice} on Etsy
            </div>

            {EDITABLE_SLUGS.has(t.slug) && (
              <Link
                href={`/templates/${t.slug}/edit`}
                className="flex items-center justify-between mb-6 p-4 rounded-xl text-white font-semibold transition hover:opacity-90 shadow-md"
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
              >
                <span className="flex items-center gap-2">
                  <span className="text-2xl">✏️</span>
                  <span>
                    <div className="text-base">Edit in your browser</div>
                    <div className="text-xs font-normal opacity-90">Type, see live preview, download as PDF or Word</div>
                  </span>
                </span>
                <span className="text-2xl">→</span>
              </Link>
            )}

            <div className="grid gap-3 mb-6">
              {t.files.filter((f) => !f.href.includes('PLACEHOLDER_')).map((f) => (
                <a
                  key={f.href}
                  href={f.href}
                  target={f.format === 'gdocs' || f.format === 'gsheets' ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-4 rounded-xl border-2 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500 transition"
                >
                  <div>
                    <div className="font-semibold mb-1">{f.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{formatLabel[f.format] || f.format}</div>
                  </div>
                  <span className="text-2xl group-hover:translate-x-1 transition" style={{ color: siteConfig.brandColor }}>→</span>
                </a>
              ))}
            </div>

            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span><span>{f}</span></li>
              ))}
            </ul>
          </div>
        </div>

        <AdSlot />

        <section className="prose dark:prose-invert max-w-none mb-10">
          <h2 className="text-2xl font-bold mb-3">About this template</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t.longDescription}</p>

          <h2 className="text-2xl font-bold mt-8 mb-3">How to use it</h2>
          <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal pl-6">
            <li>Click the &quot;Make a copy&quot; button above (or download the file).</li>
            <li>Google will open the template in your account. Click <strong>File → Make a copy</strong> if it doesn&apos;t prompt automatically.</li>
            <li>Replace the placeholder text with your own. The layout, fonts, and formulas stay put.</li>
            <li>Export to PDF when you&apos;re ready to send or print.</li>
          </ol>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6"><strong>License:</strong> Free for personal and commercial use. No attribution required. Do not resell the template itself.</p>
        </section>

        {related.length > 0 && (
          <section className="mt-12 pt-10 border-t border-gray-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold mb-6">More {cat?.title}</h2>
            <div className="grid gap-4 sm:grid-cols-3">
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
