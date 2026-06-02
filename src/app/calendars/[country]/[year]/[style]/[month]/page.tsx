import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdSlot } from '@/components/AdSlot';
import { CalendarViewer } from '@/components/CalendarViewer';
import { siteConfig } from '@/config/site';
import { COUNTRIES, MONTH_YEARS, CAL_STYLES, getStyle, getCountry, isMonthYear, monthIndex } from '@/config/calendars';
import { MONTHS, MONTH_SLUGS } from '@/lib/calendar';
import { holidaysForMonth } from '@/lib/holidays';

export const dynamicParams = false;

export function generateStaticParams() {
  const params: { country: string; year: string; style: string; month: string }[] = [];
  for (const c of COUNTRIES) {
    for (const y of MONTH_YEARS) {
      for (const s of CAL_STYLES) {
        if (!s.perMonth) continue;
        for (const m of MONTH_SLUGS) params.push({ country: c.code, year: String(y), style: s.id, month: m });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ country: string; year: string; style: string; month: string }> }) {
  const { country, year, style, month } = await params;
  const s = getStyle(style);
  const c = getCountry(country);
  const mi = monthIndex(month);
  if (!s || !c || mi < 0) return {};
  const styleLabel = s.id === 'holidays' ? ' with Holidays' : s.id === 'vertical' ? ' (Vertical)' : '';
  return {
    title: `Free Printable ${MONTHS[mi]} ${year} ${c.adjective} Calendar${styleLabel}`,
    description: `Free printable ${MONTHS[mi]} ${year} ${c.adjective} calendar${styleLabel.toLowerCase()}. ${c.weekStart === 1 ? 'Monday' : 'Sunday'}-start. Print or download as PDF — fits Letter (8.5×11) paper. No signup.`,
    alternates: { canonical: `${siteConfig.url}/calendars/${country}/${year}/${style}/${month}` },
  };
}

export default async function CalendarMonthPage({ params }: { params: Promise<{ country: string; year: string; style: string; month: string }> }) {
  const { country, year: yearStr, style, month: monthSlug } = await params;
  const year = Number(yearStr);
  const s = getStyle(style);
  const c = getCountry(country);
  const mi = monthIndex(monthSlug);
  if (!s || !c || !s.perMonth || !isMonthYear(year) || mi < 0) return notFound();

  const monthName = MONTHS[mi];
  const prev = mi === 0 ? { y: year - 1, m: 11 } : { y: year, m: mi - 1 };
  const next = mi === 11 ? { y: year + 1, m: 0 } : { y: year, m: mi + 1 };
  const holidayMap = s.id === 'holidays' ? holidaysForMonth(country, year, mi) : {};
  const holidays = Object.values(holidayMap);
  const otherStyles = CAL_STYLES.filter((x) => x.perMonth && x.id !== s.id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Calendars', item: `${siteConfig.url}/calendars` },
      { '@type': 'ListItem', position: 2, name: c.name, item: `${siteConfig.url}/calendars/${country}` },
      { '@type': 'ListItem', position: 3, name: `${year} ${s.short}`, item: `${siteConfig.url}/calendars/${country}/${year}/${style}` },
      { '@type': 'ListItem', position: 4, name: `${monthName} ${year}`, item: `${siteConfig.url}/calendars/${country}/${year}/${style}/${monthSlug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6 no-print">
          <Link href="/calendars" className="hover:underline">Calendars</Link>
          <span className="mx-2">/</span>
          <Link href={`/calendars/${country}`} className="hover:underline">{c.flag} {c.adjective}</Link>
          <span className="mx-2">/</span>
          <Link href={`/calendars/${country}/${year}/${style}`} className="hover:underline">{year} {s.short}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 dark:text-gray-300">{monthName}</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {monthName} {year} {c.adjective} Calendar{s.id === 'holidays' ? ' with Holidays' : s.id === 'vertical' ? ' — Vertical' : ''}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 no-print">
          Free printable {monthName} {year} calendar. Print it or download a crisp PDF — Letter or A4, your choice.
        </p>

        <CalendarViewer year={year} month={mi} style={s.id} country={country} defaultWeekStart={c.weekStart} defaultPaper={c.paper} orientation={s.orientation} holidays={holidayMap} />

        <div className="flex items-center justify-between mt-6 no-print">
          {isMonthYear(prev.y) ? (
            <Link href={`/calendars/${country}/${prev.y}/${style}/${MONTH_SLUGS[prev.m]}`} className="text-sm font-medium hover:text-amber-600 transition">← {MONTHS[prev.m]} {prev.y}</Link>
          ) : <span />}
          {isMonthYear(next.y) ? (
            <Link href={`/calendars/${country}/${next.y}/${style}/${MONTH_SLUGS[next.m]}`} className="text-sm font-medium hover:text-amber-600 transition">{MONTHS[next.m]} {next.y} →</Link>
          ) : <span />}
        </div>

        <AdSlot />

        {holidays.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">{c.adjective} holidays in {monthName} {year}</h2>
            <ul className="space-y-2">
              {holidays.sort((a, b) => a.day - b.day).map((h) => (
                <li key={h.day} className="flex items-center gap-3 text-sm">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold">{h.day}</span>
                  <span className={h.major ? 'font-medium' : 'text-gray-600 dark:text-gray-400'}>{h.name}{h.major && <span className="ml-2 text-xs text-amber-600">Public holiday</span>}</span>
                </li>
              ))}
            </ul>
            {c.partialHolidays && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">Note: only fixed-date national holidays are shown. Festival dates that follow the lunar calendar (e.g. Diwali, Holi, Eid) vary each year and are not marked.</p>
            )}
          </section>
        )}

        <section className="prose dark:prose-invert max-w-none mb-10">
          <h2 className="text-2xl font-bold mb-3">How to print this calendar</h2>
          <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal pl-6">
            <li>Pick your <strong>paper size</strong> (Letter or A4) and <strong>week start</strong> above, then click <strong>Print</strong> — or <strong>Download PDF</strong> to save it first.</li>
            <li>In the print dialog, match the paper size to your choice and set orientation to <strong>{s.orientation === 'landscape' ? 'Landscape' : 'Portrait'}</strong>.</li>
            <li>Set margins to <strong>Default</strong> and scale to <strong>Fit to page</strong> (or 100%).</li>
            <li>Print — the calendar fills the sheet edge to edge.</li>
          </ol>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6"><strong>License:</strong> Free for personal and commercial use. No attribution required.</p>
        </section>

        <section className="mt-10 pt-8 border-t border-gray-200 dark:border-slate-800 no-print">
          <h2 className="font-semibold mb-3">Same month, other styles</h2>
          <div className="flex flex-wrap gap-2">
            {otherStyles.map((x) => (
              <Link key={x.id} href={`/calendars/${country}/${year}/${x.id}/${monthSlug}`} className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-slate-700 hover:border-amber-500 hover:text-amber-600 transition">{x.icon} {x.short}</Link>
            ))}
            <Link href={`/calendars/${country}/${year}/yearly`} className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-slate-700 hover:border-amber-500 hover:text-amber-600 transition">📆 Full {year}</Link>
          </div>
        </section>

        {/* Other countries, same month/style */}
        <section className="mt-8 no-print">
          <h2 className="font-semibold mb-3">Same calendar, other countries</h2>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.filter((x) => x.code !== country).map((x) => (
              <Link key={x.code} href={`/calendars/${x.code}/${year}/${style}/${monthSlug}`} className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-slate-700 hover:border-amber-500 hover:text-amber-600 transition">{x.flag} {x.adjective}</Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
