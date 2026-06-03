import { templates, getTemplate } from '@/config/templates';

export type EditorType = 'resume-minimalist' | 'resume-two-column' | 'cover-letter' | 'invoice' | 'budget' | 'checklist' | 'certificate';

// Slugs that get the spreadsheet-style budget editor (not a whole category).
const BUDGET_SLUGS = new Set([
  'personal-monthly-budget', '50-30-20-budget', 'paycheck-budget-planner', 'monthly-budget',
]);

// Invoice-category slugs that are really letters (reminders/memos) — no invoice editor.
const NON_INVOICE = /reminder|late-payment|past-due|credit-memo/;

export function editorTypeFor(slug: string): EditorType | null {
  const t = getTemplate(slug);
  if (!t) return null;
  if (slug === 'minimalist-resume') return 'resume-minimalist';
  if (slug === 'modern-two-column-resume') return 'resume-two-column';
  if (slug === 'cover-letter-pack') return 'cover-letter';
  if (BUDGET_SLUGS.has(slug)) return 'budget';
  if (t.category === 'invoice' && !NON_INVOICE.test(slug)) return 'invoice';
  if (t.category === 'certificate') return 'certificate';
  if (t.category === 'checklist') return 'checklist';
  return null;
}

// Label for the invoice editor header based on the slug.
export function invoiceLabelFor(slug: string): string {
  if (/quote|estimate|quotation/.test(slug)) return 'ESTIMATE';
  if (/receipt/.test(slug)) return 'RECEIPT';
  return 'INVOICE';
}

export const editableSlugs = (): string[] => templates.filter((t) => editorTypeFor(t.slug) !== null).map((t) => t.slug);
