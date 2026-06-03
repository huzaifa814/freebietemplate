import { notFound } from 'next/navigation';
import { CollectionPage } from '@/components/CollectionPage';
import { professionCollections, getCollection } from '@/config/collections';
import { siteConfig } from '@/config/site';

export const dynamicParams = false;

export function generateStaticParams() {
  return professionCollections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c || c.kind !== 'profession') return {};
  const og = `/og/collection/${c.slug}.png`;
  return {
    title: c.title, description: c.intro,
    alternates: { canonical: `${siteConfig.url}/for/${c.slug}` },
    openGraph: { title: c.title, description: c.intro, images: [{ url: og, width: 1200, height: 630, alt: c.heading }] },
    twitter: { card: 'summary_large_image', title: c.title, description: c.intro, images: [og] },
  };
}

export default async function ProfessionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c || c.kind !== 'profession') return notFound();
  return <CollectionPage collection={c} />;
}
