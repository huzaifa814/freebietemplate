import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdSlot } from '@/components/AdSlot';
import { siteConfig } from '@/config/site';
import { COUNTRIES, FIRST_YEAR, getCountry } from '@/config/calendars';
import { MONTHS, weekdayLabels } from '@/lib/calendar';
import { holidayList } from '@/lib/holidays';

export const dynamicParams = false;
const WD = weekdayLabels(0, true);

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ country: c.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const c = getCountry(country);
  if (!c) return {};
  return {
    title: `${c.adjective} Public Holidays ${FIRST_YEAR} — Dates & Free Calendars`,
    description: `Every ${c.name} public holiday and observance in ${FIRST_YEAR} with exact dates. Find out when each holiday falls and print a free calendar.`,
    alternates: { canonical: `${siteConfig.url}/calendars/${country}/when-is` },
  };
}

export default async function HolidaysIndex({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const c = getCountry(country);
  if (!c) return notFound();
  const list = holidayList(country, FIRST_YEAR);

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/calendars" className="hover:underline">Calendars</Link>
          <span className="mx-2">/</span>
          <Link href={`/calendars/${country}`} className="hover:underline">{c.flag} {c.adjective}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 dark:text-gray-300">Holidays</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold mb-3">{c.adjective} Public Holidays {FIRST_YEAR}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Exact dates for every {c.name} holiday and observance. Click any holiday to see its date for every year and print a free calendar.</p>

        <AdSlot />

        <ul className="divide-y divide-gray-200 dark:divide-slate-800 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
          {list.map((h) => (
            <li key={h.slug}>
              <Link href={`/calendars/${country}/when-is/${h.slug}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-amber-50/50 dark:hover:bg-slate-900/50 transition">
                <span className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold text-center leading-tight">{MONTHS[h.month].slice(0, 3)}<br />{h.day}</span>
                  <span>
                    <span className="font-medium">{h.name}</span>
                    {!h.major && <span className="ml-2 text-xs text-gray-400">observance</span>}
                  </span>
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{WD[new Date(FIRST_YEAR, h.month, h.day).getDay()].slice(0, 3)}, {MONTHS[h.month]} {h.day} →</span>
              </Link>
            </li>
          ))}
        </ul>

        <section className="mt-10 pt-8 border-t border-gray-200 dark:border-slate-800">
          <h2 className="font-semibold mb-3">Holidays in other countries</h2>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.filter((x) => x.code !== country).map((x) => (
              <Link key={x.code} href={`/calendars/${x.code}/when-is`} className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-slate-700 hover:border-amber-500 hover:text-amber-600 transition">{x.flag} {x.adjective}</Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
