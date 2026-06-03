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
  return { title: c.title, description: c.intro, alternates: { canonical: `${siteConfig.url}/seasonal/${c.slug}` } };
}

export default async function SeasonalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c || c.kind !== 'seasonal') return notFound();
  return <CollectionPage collection={c} />;
}
