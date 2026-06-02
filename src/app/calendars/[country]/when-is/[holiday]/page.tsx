import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdSlot } from '@/components/AdSlot';
import { siteConfig } from '@/config/site';
import { COUNTRIES, FIRST_YEAR, MONTH_YEARS, getCountry, isMonthYear } from '@/config/calendars';
import { MONTHS, MONTH_SLUGS, weekdayLabels } from '@/lib/calendar';
import { holidayList, holidayDatesByYear } from '@/lib/holidays';

export const dynamicParams = false;

// Years shown in the "when is" table.
const ANSWER_YEARS = Array.from({ length: 10 }, (_, i) => FIRST_YEAR - 2 + i); // 2024–2033
const WD = weekdayLabels(0, true); // Sunday-indexed full names

export function generateStaticParams() {
  const params: { country: string; holiday: string }[] = [];
  for (const c of COUNTRIES) for (const h of holidayList(c.code, FIRST_YEAR)) params.push({ country: c.code, holiday: h.slug });
  return params;
}

function longDate(year: number, month: number, day: number) {
  return `${WD[new Date(year, month, day).getDay()]}, ${MONTHS[month]} ${day}, ${year}`;
}

export async function generateMetadata({ params }: { params: Promise<{ country: string; holiday: string }> }) {
  const { country, holiday } = await params;
  const c = getCountry(country);
  const sample = c ? holidayList(country, FIRST_YEAR).find((h) => h.slug === holiday) : undefined;
  if (!c || !sample) return {};
  return {
    title: `When is ${sample.name} ${FIRST_YEAR} in the ${c.name}? Dates & Calendar`,
    description: `${sample.name} ${FIRST_YEAR} in the ${c.name} is ${longDate(FIRST_YEAR, sample.month, sample.day)}. See the date for every year ${ANSWER_YEARS[0]}–${ANSWER_YEARS[ANSWER_YEARS.length - 1]} and print a free calendar.`,
    alternates: { canonical: `${siteConfig.url}/calendars/${country}/when-is/${holiday}` },
  };
}

export default async function WhenIsPage({ params }: { params: Promise<{ country: string; holiday: string }> }) {
  const { country, holiday } = await params;
  const c = getCountry(country);
  const sample = c ? holidayList(country, FIRST_YEAR).find((h) => h.slug === holiday) : undefined;
  if (!c || !sample) return notFound();

  const rows = holidayDatesByYear(country, holiday, ANSWER_YEARS);
  const otherCountries = COUNTRIES.filter((x) => x.code !== country && holidayList(x.code, FIRST_YEAR).some((h) => h.slug === holiday));
  const upcoming = rows.find((r) => r.year >= FIRST_YEAR) || rows[0];
  const calYear = upcoming && isMonthYear(upcoming.year) ? upcoming.year : MONTH_YEARS[0];
  const calMonth = upcoming ? upcoming.month : 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [{
      '@type': 'Question',
      name: `When is ${sample.name} ${FIRST_YEAR} in the ${c.name}?`,
      acceptedAnswer: { '@type': 'Answer', text: `${sample.name} ${FIRST_YEAR} in the ${c.name} falls on ${longDate(FIRST_YEAR, sample.month, sample.day)}.` },
    }],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/calendars" className="hover:underline">Calendars</Link>
          <span className="mx-2">/</span>
          <Link href={`/calendars/${country}`} className="hover:underline">{c.flag} {c.adjective}</Link>
          <span className="mx-2">/</span>
          <Link href={`/calendars/${country}/when-is`} className="hover:underline">Holidays</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 dark:text-gray-300">{sample.name}</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold mb-3">When is {sample.name} in the {c.name}?</h1>
        {upcoming && (
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
            In {upcoming.year}, {sample.name} falls on <strong style={{ color: '#d97706' }}>{longDate(upcoming.year, upcoming.month, upcoming.day)}</strong>.
          </p>
        )}
        {sample.note && <p className="text-gray-600 dark:text-gray-400 mb-6">{sample.note}</p>}

        <div className="my-6">
          <Link href={`/calendars/${country}/${calYear}/holidays/${MONTH_SLUGS[calMonth]}`} className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-white font-medium hover:opacity-90 transition" style={{ background: '#f59e0b' }}>
            🖨️ Print the {MONTHS[calMonth]} {calYear} calendar →
          </Link>
        </div>

        <AdSlot />

        <h2 className="text-2xl font-bold mb-4">{sample.name} dates by year</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white" style={{ background: '#f59e0b' }}>
                <th className="text-left px-4 py-2 font-semibold">Year</th>
                <th className="text-left px-4 py-2 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.year} className={`${i % 2 ? 'bg-amber-50/40 dark:bg-slate-900/40' : ''} ${r.year === FIRST_YEAR ? 'font-semibold' : ''}`}>
                  <td className="px-4 py-2 border-t border-gray-200 dark:border-slate-800">{r.year}</td>
                  <td className="px-4 py-2 border-t border-gray-200 dark:border-slate-800">{longDate(r.year, r.month, r.day)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {otherCountries.length > 0 && (
          <section className="mt-10 pt-8 border-t border-gray-200 dark:border-slate-800">
            <h2 className="font-semibold mb-3">When is {sample.name} in other countries?</h2>
            <div className="flex flex-wrap gap-2">
              {otherCountries.map((x) => (
                <Link key={x.code} href={`/calendars/${x.code}/when-is/${holiday}`} className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-slate-700 hover:border-amber-500 hover:text-amber-600 transition">{x.flag} {x.adjective}</Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
