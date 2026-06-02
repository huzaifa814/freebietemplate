import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdSlot } from '@/components/AdSlot';
import { SimpleViewer } from '@/components/SimpleViewer';
import { siteConfig } from '@/config/site';

export const metadata = {
  title: 'Free Printable Blank Calendar (Undated) — PDF & Print',
  description: 'A free printable blank, undated monthly calendar. Fill in any month and year by hand. Sunday or Monday start, Letter or A4, print or download as PDF. No signup.',
  alternates: { canonical: `${siteConfig.url}/calendars/blank` },
};

export default function BlankCalendarPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6 no-print">
          <Link href="/calendars" className="hover:underline">Calendars</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 dark:text-gray-300">Blank Calendar</span>
        </nav>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Blank Calendar (Undated)</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 no-print">A reusable blank monthly grid — write in any month, year, and dates yourself. Print it or download a crisp PDF.</p>

        <SimpleViewer kind="blank" defaultWeekStart={0} defaultPaper="letter" />

        <AdSlot />

        <section className="prose dark:prose-invert max-w-none mb-10">
          <h2 className="text-2xl font-bold mb-3">How to use the blank calendar</h2>
          <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal pl-6">
            <li>Pick your week start (Sunday or Monday) and paper size above.</li>
            <li>Write the month and year on the lines at the top.</li>
            <li>Number the day boxes starting from the correct weekday, then print or download the PDF.</li>
          </ol>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6"><strong>License:</strong> Free for personal and commercial use. No attribution required.</p>
        </section>

        <section className="no-print">
          <h2 className="font-semibold mb-3">Looking for a dated calendar?</h2>
          <Link href="/calendars" className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-slate-700 hover:border-amber-500 hover:text-amber-600 transition">Browse calendars by country &amp; year →</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
