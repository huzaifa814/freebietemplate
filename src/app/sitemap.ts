import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { templates, categories } from '@/config/templates';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = ['', '/templates', '/categories', '/about', '/faq', '/privacy', '/terms', '/contact'];
  const entries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${siteConfig.url}${p}`,
    lastModified: now,
    changeFrequency: p === '' ? 'daily' : 'weekly',
    priority: p === '' ? 1 : 0.7,
  }));
  for (const t of templates) {
    entries.push({ url: `${siteConfig.url}/templates/${t.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 });
  }
  for (const c of categories) {
    entries.push({ url: `${siteConfig.url}/categories/${c.id}`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 });
  }
  return entries;
}
