import { notFound } from 'next/navigation';
import { CollectionPage } from '@/components/CollectionPage';
import { seasonalCollections, getCollection } from '@/config/collections';
import { siteConfig } from '@/config/site';

export const dynamicParams = false;

export function generateStaticParams() {
  return seasonalCollections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c || c.kind !== 'seasonal') return {};
  const og = `/og/collection/${c.slug}.png`;
  return {
    title: c.title, description: c.intro,
    alternates: { canonical: `${siteConfig.url}/seasonal/${c.slug}` },
    openGraph: { title: c.title, description: c.intro, images: [{ url: og, width: 1200, height: 630, alt: c.heading }] },
    twitter: { card: 'summary_large_image', title: c.title, description: c.intro, images: [og] },
  };
}

export default async function SeasonalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c || c.kind !== 'seasonal') return notFound();
  return <CollectionPage collection={c} />;
}
