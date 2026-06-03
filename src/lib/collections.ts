import { templates, type Template } from '@/config/templates';
import type { Collection } from '@/config/collections';

// Resolve a collection's selectors (slugs + categories + tags) into a
// de-duped template list, preserving catalog order.
export function resolveCollection(c: Collection): Template[] {
  const explicit = new Set(c.slugs ?? []);
  const cats = new Set(c.categories ?? []);
  const tags = new Set(c.tags ?? []);
  return templates.filter(
    (t) => explicit.has(t.slug) || cats.has(t.category) || t.tags.some((tag) => tags.has(tag)),
  );
}
