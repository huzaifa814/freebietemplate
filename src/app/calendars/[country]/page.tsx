import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { siteConfig } from '@/config/site';
import { COUNTRIES, CAL_YEARS, MONTH_YEARS, CAL_STYLES, getCountry, styleYears, FIRST_YEAR } from '@/config/calendars';
import { MONTHS, MONTH_SLUGS } from '@/lib/calendar';

export const dynamicParams = false;

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ country: c.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const c = getCountry(country);
  if (!c) return {};
  const lastYear = CAL_YEARS[CAL_YEARS.length - 1];
  return {
    title: `Free Printable ${c.adjective} Calendars (${FIRST_YEAR}–${lastYear}) — PDF & Print`,
    description: `Free printable ${c.name} calendar templates from ${FIRST_YEAR} to ${lastYear}. Basic, vertical, with ${c.adjective} holidays, and full-year. ${c.weekStart === 1 ? 'Monday' : 'Sunday'}-start, print or PDF. No signup.`,
    alternates: { canonical: `${siteConfig.url}/calendars/${country}` },
  };
}

export default async function CountryHub({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const c = getCountry(country);
  if (!c) return notFound();

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/calendars" className="hover:underline">Calendars</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 dark:text-gray-300">{c.name}</span>
        </nav>

        <section className="text-center mb-10">
          <div className="text-5xl mb-3">{c.flag}</div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Free Printable {c.adjective} Calendars</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-5">
            {c.weekStart === 1 ? 'Monday' : 'Sunday'}-start calendars with {c.adjective} holidays. Print or download a crisp PDF — no signup, no watermark.
          </p>
          <Link href={`/calendars/${country}/when-is`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-amber-500/40 text-amber-700 dark:text-amber-400 font-medium hover:bg-amber-500/5 transition">
            🎉 {c.adjective} holiday dates →
          </Link>
        </section>

        {/* Country switcher */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {COUNTRIES.map((x) => (
            <Link key={x.code} href={`/calendars/${x.code}`} className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${x.code === c.code ? 'border-amber-500 text-amber-600 bg-amber-500/5' : 'border-gray-300 dark:border-slate-700 hover:border-amber-500'}`}>
              {x.flag} {x.adjective}
            </Link>
          ))}
        </div>

        <section className="grid gap-4 sm:grid-cols-2 mb-12">
          {CAL_STYLES.map((s) => (
            <div key={s.id} className="p-6 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-3xl mb-2">{s.icon}</div>
              <h2 className="font-semibold text-lg mb-1">{s.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{s.description}</p>
              <div className="flex flex-wrap gap-2">
                {styleYears(s).slice(0, 6).map((y) => (
                  <Link key={y} href={`/calendars/${country}/${y}/${s.id}`} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-slate-700 hover:border-amber-500 hover:text-amber-600 transition">
                    {y}
                  </Link>
                ))}
                {s.id === 'yearly' && <span className="px-2 py-1.5 text-sm text-gray-400">+ {CAL_YEARS.length - 6} more below</span>}
              </div>
            </div>
          ))}
        </section>

        {MONTH_YEARS.map((y) => (
          <section key={y} className="mb-10">
            <h2 className="text-2xl font-bold mb-4">{y} {c.adjective} Calendars</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {MONTHS.map((m, i) => (
                <Link key={m} href={`/calendars/${country}/${y}/basic/${MONTH_SLUGS[i]}`} className="text-center px-2 py-3 rounded-lg border border-gray-200 dark:border-slate-800 text-sm hover:border-amber-500 hover:text-amber-600 transition">
                  {m.slice(0, 3)}
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* Full-year calendars across the whole published range */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">{c.adjective} Full-Year Calendars (through {CAL_YEARS[CAL_YEARS.length - 1]})</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {CAL_YEARS.map((y) => (
              <Link key={y} href={`/calendars/${country}/${y}/yearly`} className="text-center px-2 py-3 rounded-lg border border-gray-200 dark:border-slate-800 text-sm hover:border-amber-500 hover:text-amber-600 transition">
                {y}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
