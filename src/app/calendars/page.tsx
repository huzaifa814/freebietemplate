import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { siteConfig } from '@/config/site';
import { COUNTRIES, CAL_STYLES } from '@/config/calendars';

export const metadata = {
  title: 'Free Printable Calendars (2026–2045) — PDF & Print',
  description: 'Free printable calendar templates from 2026 to 2045 — US, UK, Canada, Australia, Ireland, New Zealand & India. Basic, vertical, with holidays, and full-year. Sunday or Monday start. Print or download as PDF. No signup.',
  alternates: { canonical: `${siteConfig.url}/calendars` },
};

export default function CalendarsHub() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium mb-5">
            🗓️ Free · PDF + Print · Sunday or Monday start
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">Free Printable Calendars</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Pick your country for the right holidays and week start, then choose a style and month.
            Every calendar prints on Letter paper or downloads as a crisp PDF. No signup, no watermark — 2026 to 2045.
          </p>
        </section>

        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-5 text-center">Choose your country</h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {COUNTRIES.map((c) => (
              <Link key={c.code} href={`/calendars/${c.code}`} className="group flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 hover:shadow-md transition">
                <span className="text-3xl">{c.flag}</span>
                <span>
                  <span className="block font-semibold group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">{c.adjective}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">{c.weekStart === 1 ? 'Mon start' : 'Sun start'}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-5 text-center">Calendar styles</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {CAL_STYLES.map((s) => (
              <div key={s.id} className="p-6 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="text-3xl mb-2">{s.icon}</div>
                <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{s.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-5 text-center">No-date printables</h2>
          <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
            <Link href="/calendars/blank" className="group p-6 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 hover:shadow-md transition">
              <div className="text-3xl mb-2">⬜</div>
              <h3 className="font-semibold text-lg mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400">Blank Calendar</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Undated monthly grid — fill in any month yourself.</p>
            </Link>
            <Link href="/calendars/weekly-planner" className="group p-6 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 hover:shadow-md transition">
              <div className="text-3xl mb-2">🗒️</div>
              <h3 className="font-semibold text-lg mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400">Weekly Planner</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">One page per week with a row and lines for each day.</p>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
