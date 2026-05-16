import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ResumeEditor } from '@/components/editor/ResumeEditor';
import { getTemplate } from '@/config/templates';
import { siteConfig } from '@/config/site';

// Slugs that support the in-browser editor. Add to this list as new editors are wired up.
const EDITABLE_SLUGS = ['minimalist-resume'];

export const dynamicParams = false;

export async function generateStaticParams() {
  return EDITABLE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = getTemplate(slug);
  if (!t) return {};
  return {
    title: `Edit ${t.title}`,
    description: `Edit ${t.title} in your browser and download as PDF or Word. No signup.`,
    alternates: { canonical: `${siteConfig.url}/templates/${t.slug}/edit` },
  };
}

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!EDITABLE_SLUGS.includes(slug)) return notFound();
  const t = getTemplate(slug);
  if (!t) return notFound();

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
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Fill out the form on the left. Preview updates live. Download when you&apos;re happy.</p>
          </div>
          <Link href={`/templates/${t.slug}`} className="text-sm font-medium text-amber-600 hover:underline">← Back to template</Link>
        </div>

        <ResumeEditor />
      </main>
      <Footer />
    </>
  );
}
