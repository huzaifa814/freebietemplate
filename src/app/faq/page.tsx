import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { siteConfig } from '@/config/site';

export const metadata = { title: 'FAQ', description: `Frequently asked questions about ${siteConfig.name}.` };

const faqs = [
  { q: 'Are these really free?', a: 'Yes — completely free. No subscriptions, no signup wall, no premium tier, no daily download limit. A single banner ad on the page pays the hosting bill.' },
  { q: 'Can I use the templates for my business?', a: 'Yes. Every template is free for personal and commercial use, with no attribution required. The only thing you cannot do is repackage and resell the template itself.' },
  { q: 'Do I need a Microsoft Office license?', a: 'No. Every template has a Google Docs or Google Sheets version that opens in any Google account for free. Word/Excel downloads are provided for people who prefer offline editing.' },
  { q: 'Are the resume templates ATS-friendly?', a: 'Yes. Each resume is built with simple structural elements (paragraphs, basic tables) that applicant-tracking systems can parse. We avoid graphics, columns made of text boxes, and other layout tricks that break ATS imports.' },
  { q: 'Will the formulas work in my version of Excel?', a: 'Yes — we stick to formulas that work in Excel 2016+, Excel for Mac, and Google Sheets. SUMIFS, basic arithmetic, and named ranges. No dynamic arrays, LAMBDAs, or anything that requires the latest version.' },
  { q: 'How do I download a template?', a: 'Click any template card to open its detail page. You will see one button to "Open in Google Docs/Sheets" (which makes a copy in your Google account) and a separate button to download the .docx or .xlsx file.' },
  { q: 'Can I edit the template after downloading?', a: 'Absolutely. The whole point is for you to customize it. Replace the placeholder text, change colors, add or remove sections — it is your file once you copy or download it.' },
  { q: 'Why is this free when Etsy sellers charge $10+?', a: 'Different business model. Etsy sellers have time invested per customer (listing maintenance, support emails) and rely on the marketplace. We are a single ad-supported website with no per-customer cost. That lets us charge $0.' },
  { q: 'Do you collect my data?', a: 'No analytics tracker that personally identifies you. Google AdSense serves contextual ads on the page and Google handles its own (anonymized) measurement. We do not have your email and we do not sell anything.' },
  { q: 'I want a template you do not have. Can you make it?', a: 'Email us — if it is a common template (purchase order, project tracker, content calendar, etc.) we will probably add it. Niche or very industry-specific ones are harder to prioritize.' },
];

export default function FAQ() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-3">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">Everything you might want to know about {siteConfig.name}.</p>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <details key={i} className="group p-5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <summary className="font-semibold cursor-pointer flex items-start justify-between gap-4">
                <span>{f.q}</span>
                <span className="text-gray-400 group-open:rotate-90 transition-transform">›</span>
              </summary>
              <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
