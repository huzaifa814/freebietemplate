import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ResumeEditor } from '@/components/editor/ResumeEditor';
import { CoverLetterEditor } from '@/components/editor/CoverLetterEditor';
import { InvoiceEditor } from '@/components/editor/InvoiceEditor';
import { BudgetEditor } from '@/components/editor/BudgetEditor';
import { ChecklistEditor } from '@/components/editor/ChecklistEditor';
import { CertificateEditor } from '@/components/editor/CertificateEditor';
import { getTemplate } from '@/config/templates';
import { editorTypeFor, editableSlugs, invoiceLabelFor } from '@/lib/editors';
import { siteConfig } from '@/config/site';

export const dynamicParams = false;

export function generateStaticParams() {
  return editableSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = getTemplate(slug);
  if (!t) return {};
  return {
    title: `Edit ${t.title}`,
    description: `Edit ${t.title} in your browser and download as PDF — free, no signup.`,
    alternates: { canonical: `${siteConfig.url}/templates/${t.slug}/edit` },
  };
}

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const type = editorTypeFor(slug);
  const t = getTemplate(slug);
  if (!type || !t) return notFound();

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/templates" className="hover:underline">Templates</Link>
          <span className="mx-2">/</span>
          <Link href={`/templates/${t.slug}`} className="hover:underline">{t.title}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 dark:text-gray-300">Edit</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Edit your {t.title.toLowerCase()}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Fill out the form on the left. The preview updates live. Download a clean PDF when you&apos;re happy.</p>
          </div>
          <Link href={`/templates/${t.slug}`} className="text-sm font-medium text-amber-600 hover:underline">← Back to template</Link>
        </div>

        {type === 'resume-minimalist' && <ResumeEditor layout="minimalist" />}
        {type === 'resume-two-column' && <ResumeEditor layout="two-column" />}
        {type === 'cover-letter' && <CoverLetterEditor />}
        {type === 'invoice' && <InvoiceEditor docLabel={invoiceLabelFor(slug)} />}
        {type === 'budget' && <BudgetEditor />}
        {type === 'checklist' && <ChecklistEditor />}
        {type === 'certificate' && <CertificateEditor />}
      </main>
      <Footer />
    </>
  );
}
