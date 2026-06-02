import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdSlot } from '@/components/AdSlot';
import { SimpleViewer } from '@/components/SimpleViewer';
import { siteConfig } from '@/config/site';

export const metadata = {
  title: 'Free Printable Weekly Planner — PDF & Print',
  description: 'A free printable weekly planner with a row and writing lines for every day. Sunday or Monday start, Letter or A4, print or download as PDF. No signup.',
  alternates: { canonical: `${siteConfig.url}/calendars/weekly-planner` },
};

export default function WeeklyPlannerPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6 no-print">
          <Link href="/calendars" className="hover:underline">Calendars</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 dark:text-gray-300">Weekly Planner</span>
        </nav>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Weekly Planner</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 no-print">A clean one-page weekly planner — a labeled row and ruled lines for every day. Print it or download a crisp PDF.</p>

        <SimpleViewer kind="weekly" defaultWeekStart={1} defaultPaper="letter" />

        <AdSlot />

        <section className="prose dark:prose-invert max-w-none mb-10">
          <h2 className="text-2xl font-bold mb-3">How to use the weekly planner</h2>
          <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal pl-6">
            <li>Choose your week start (Sunday or Monday) and paper size above.</li>
            <li>Write the week&apos;s start date on the line at the top.</li>
            <li>Fill in tasks and appointments on each day&apos;s lines, then print or download the PDF.</li>
          </ol>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6"><strong>License:</strong> Free for personal and commercial use. No attribution required.</p>
        </section>

        <section className="no-print">
          <h2 className="font-semibold mb-3">Need a monthly calendar instead?</h2>
          <Link href="/calendars" className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-slate-700 hover:border-amber-500 hover:text-amber-600 transition">Browse monthly calendars →</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
