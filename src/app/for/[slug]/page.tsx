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
  return { title: c.title, description: c.intro, alternates: { canonical: `${siteConfig.url}/for/${c.slug}` } };
}

export default async function ProfessionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c || c.kind !== 'profession') return notFound();
  return <CollectionPage collection={c} />;
}
