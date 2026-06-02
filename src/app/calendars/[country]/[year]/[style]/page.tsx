import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdSlot } from '@/components/AdSlot';
import { CalendarViewer } from '@/components/CalendarViewer';
import { siteConfig } from '@/config/site';
import { COUNTRIES, CAL_STYLES, getStyle, getCountry, styleYears } from '@/config/calendars';
import { MONTHS, MONTH_SLUGS } from '@/lib/calendar';

export const dynamicParams = false;

export function generateStaticParams() {
  const params: { country: string; year: string; style: string }[] = [];
  for (const c of COUNTRIES) for (const s of CAL_STYLES) for (const y of styleYears(s)) params.push({ country: c.code, year: String(y), style: s.id });
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ country: string; year: string; style: string }> }) {
  const { country, year, style } = await params;
  const s = getStyle(style);
  const c = getCountry(country);
  if (!s || !c) return {};
  return {
    title: `Free Printable ${year} ${c.adjective} ${s.title} — PDF & Print`,
    description: `${s.description} Free ${year} ${c.adjective} ${s.short.toLowerCase()} calendar — print or download as PDF, no signup.`,
    alternates: { canonical: `${siteConfig.url}/calendars/${country}/${year}/${style}` },
  };
}

export default async function YearStylePage({ params }: { params: Promise<{ country: string; year: string; style: string }> }) {
  const { country, year: yearStr, style } = await params;
  const year = Number(yearStr);
  const s = getStyle(style);
  const c = getCountry(country);
  if (!s || !c || !styleYears(s).includes(year)) return notFound();

  if (!s.perMonth) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-5xl">
          <Breadcrumb country={country} flag={c.flag} adj={c.adjective} year={year} styleTitle={s.title} />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{s.id === 'academic' ? `${year}–${year + 1} ${c.adjective} Academic Year Calendar` : `${year} ${c.adjective} Full-Year Calendar`}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 no-print">{s.description}</p>
          <CalendarViewer year={year} month={0} style={s.id} country={country} defaultWeekStart={c.weekStart} defaultPaper={c.paper} orientation="landscape" />
          <AdSlot />
          <OtherYears country={country} current={year} styleId="yearly" years={styleYears(s)} />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Breadcrumb country={country} flag={c.flag} adj={c.adjective} year={year} styleTitle={s.title} />
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{year} {c.adjective} {s.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{s.description}</p>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 mb-10">
          {MONTHS.map((m, i) => (
            <Link key={m} href={`/calendars/${country}/${year}/${style}/${MONTH_SLUGS[i]}`} className="group flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 hover:shadow-md transition">
              <span className="font-semibold">{m} {year}</span>
              <span className="text-xl text-amber-500 group-hover:translate-x-1 transition">→</span>
            </Link>
          ))}
        </div>

        <AdSlot />
        <OtherYears country={country} current={year} styleId={style} years={styleYears(s)} />
      </main>
      <Footer />
    </>
  );
}

function Breadcrumb({ country, flag, adj, year, styleTitle }: { country: string; flag: string; adj: string; year: number; styleTitle: string }) {
  return (
    <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
      <Link href="/calendars" className="hover:underline">Calendars</Link>
      <span className="mx-2">/</span>
      <Link href={`/calendars/${country}`} className="hover:underline">{flag} {adj}</Link>
      <span className="mx-2">/</span>
      <span className="text-gray-700 dark:text-gray-300">{year} {styleTitle}</span>
    </nav>
  );
}

function OtherYears({ country, current, styleId, years }: { country: string; current: number; styleId: string; years: number[] }) {
  const others = years.filter((y) => y !== current);
  if (others.length === 0) return null;
  return (
    <section className="mt-10 pt-8 border-t border-gray-200 dark:border-slate-800">
      <h2 className="font-semibold mb-3">Other years</h2>
      <div className="flex flex-wrap gap-2">
        {others.map((y) => (
          <Link key={y} href={`/calendars/${country}/${y}/${styleId}`} className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-slate-700 hover:border-amber-500 hover:text-amber-600 transition">{y}</Link>
        ))}
      </div>
    </section>
  );
}
