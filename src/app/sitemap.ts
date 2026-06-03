import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { templates, categories } from '@/config/templates';
import { guides } from '@/config/guides';
import { collections } from '@/config/collections';
import { COUNTRIES, CAL_STYLES, MONTH_YEARS, FIRST_YEAR, styleYears } from '@/config/calendars';
import { MONTH_SLUGS } from '@/lib/calendar';
import { holidayList } from '@/lib/holidays';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = ['', '/templates', '/calendars', '/calendars/blank', '/calendars/weekly-planner', '/categories', '/guides', '/for', '/seasonal', '/about', '/faq', '/privacy', '/terms', '/contact'];
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
  for (const g of guides) {
    entries.push({ url: `${siteConfig.url}/guides/${g.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 });
  }
  for (const col of collections) {
    const base = col.kind === 'profession' ? 'for' : 'seasonal';
    entries.push({ url: `${siteConfig.url}/${base}/${col.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 });
  }
  // Calendars: country hub + holiday answer pages + year/style index + month pages
  for (const c of COUNTRIES) {
    entries.push({ url: `${siteConfig.url}/calendars/${c.code}`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 });
    entries.push({ url: `${siteConfig.url}/calendars/${c.code}/when-is`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 });
    for (const h of holidayList(c.code, FIRST_YEAR)) {
      entries.push({ url: `${siteConfig.url}/calendars/${c.code}/when-is/${h.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 });
    }
    for (const s of CAL_STYLES) {
      for (const y of styleYears(s)) {
        entries.push({ url: `${siteConfig.url}/calendars/${c.code}/${y}/${s.id}`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 });
        if (!s.perMonth) continue;
        for (const m of MONTH_SLUGS) {
          entries.push({ url: `${siteConfig.url}/calendars/${c.code}/${y}/${s.id}/${m}`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 });
        }
      }
    }
  }
  return entries;
}
