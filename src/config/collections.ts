// Curated landing pages ("collections") that bundle existing templates around an
// audience (/for/teachers) or an occasion (/seasonal/christmas). Pure data —
// the resolver in lib/collections.ts turns selectors into a template list.
import type { Category } from './templates';

export interface Collection {
  slug: string;
  kind: 'profession' | 'seasonal';
  title: string;       // <title> / H1
  heading: string;     // display heading
  intro: string;
  // Selectors (unioned, de-duped, in catalog order):
  slugs?: string[];
  categories?: Category[];
  tags?: string[];
}

export const collections: Collection[] = [
  // ───── PROFESSIONS ─────
  {
    slug: 'teachers', kind: 'profession',
    title: 'Free Templates for Teachers', heading: 'Templates for Teachers',
    intro: 'Free, ready-to-print classroom templates — lesson plans, gradebooks, reading logs, student awards, and more. No signup, no watermark.',
    categories: ['education'], slugs: ['student-award-certificate', 'perfect-attendance-award', 'participation-certificate', 'email-sig-teacher', 'kids-reading-log', 'kids-behavior-chart', 'back-to-school-checklist'],
  },
  {
    slug: 'freelancers', kind: 'profession',
    title: 'Free Templates for Freelancers', heading: 'Templates for Freelancers',
    intro: 'Everything a freelancer needs to look professional and get paid — invoices, estimates, contracts, expense and client trackers. All free.',
    slugs: ['1099-self-employed-tracker', 'client-tracker', 'income-expense-tracker', 'email-sig-freelancer', 'minimalist-resume', 'cover-letter-pack', 'personal-monthly-budget'], categories: ['invoice'], tags: ['contract', 'nda'],
  },
  {
    slug: 'small-business', kind: 'profession',
    title: 'Free Templates for Small Business', heading: 'Templates for Small Business Owners',
    intro: 'Run your business on free spreadsheets and documents — bookkeeping, invoices, P&L, pricing, onboarding, and more.',
    categories: ['bookkeeping', 'business'], slugs: ['profit-loss-statement', 'cash-flow-forecast'],
  },
  {
    slug: 'real-estate-agents', kind: 'profession',
    title: 'Free Templates for Real Estate Agents', heading: 'Templates for Real Estate Agents',
    intro: 'Free templates built for agents — commission and property trackers, real-estate email signatures, and the bookkeeping to keep it all straight.',
    slugs: ['real-estate-agent-bookkeeping', 'rental-property-tracker', 'email-sig-real-estate', 'email-sig-realtor', 'client-tracker', 'mileage-log', 'home-buyer-checklist'],
  },
  {
    slug: 'students', kind: 'profession',
    title: 'Free Templates for Students', heading: 'Templates for Students',
    intro: 'Free templates to help you study, apply, and stay organized — resumes, study planners, reading logs, budgets, and student email signatures.',
    slugs: ['student-entry-level-resume', 'internship-resume', 'email-sig-student', 'personal-monthly-budget', 'savings-goal-tracker'], categories: ['education'],
  },
  {
    slug: 'content-creators', kind: 'profession',
    title: 'Free Templates for Content Creators', heading: 'Templates for Content Creators & Influencers',
    intro: 'Plan, post, and grow — content calendars, post and reels planners, hashtag and engagement trackers, plus invoices for brand deals.',
    categories: ['social'], slugs: ['fitness-trainer-invoice', 'email-sig-creative-agency', '1099-self-employed-tracker'],
  },
  {
    slug: 'parents', kind: 'profession',
    title: 'Free Templates for Parents & Families', heading: 'Templates for Parents & Families',
    intro: 'Free printables to run a calmer household — chore and reward charts, routines, meal plans, family budgets, and checklists.',
    categories: ['kids'], slugs: ['family-command-center', 'healthy-meal-planner', 'personal-monthly-budget', 'new-baby-checklist', 'household-binder-checklist', 'allowance-tracker'],
  },
  {
    slug: 'nonprofits', kind: 'profession',
    title: 'Free Templates for Nonprofits', heading: 'Templates for Nonprofits & Volunteers',
    intro: 'Free templates for mission-driven teams — volunteer recognition, budgets, event planning, and nonprofit email signatures.',
    slugs: ['volunteer-recognition-certificate', 'email-sig-nonprofit', 'event-planning-checklist', 'small-business-bookkeeping', 'budget-vs-actual-tracker', 'participation-certificate'],
  },

  // ───── SEASONAL ─────
  {
    slug: 'new-year-goals', kind: 'seasonal',
    title: 'New Year Goal-Setting Templates', heading: 'New Year Goal & Resolution Templates',
    intro: 'Start the year with a plan — goal planners, budgets, habit trackers, and savings goals to make this year the one that sticks.',
    slugs: ['financial-goals-planner', 'fitness-goal-planner', 'personal-monthly-budget', 'savings-goal-tracker', 'net-worth-tracker', 'no-spend-challenge', 'workout-log', 'self-care-checklist'], tags: ['habit', 'goals'],
  },
  {
    slug: 'christmas', kind: 'seasonal',
    title: 'Free Christmas & Holiday Planner Templates', heading: 'Christmas & Holiday Planning Templates',
    intro: 'Keep the holidays merry and organized — gift trackers, holiday budgets, party planning, and seasonal checklists.',
    slugs: ['personal-monthly-budget', 'sinking-funds-planner', 'event-planning-checklist', 'grocery-shopping-list', 'deep-cleaning-checklist'], tags: ['party', 'gift', 'christmas'],
  },
  {
    slug: 'back-to-school', kind: 'seasonal',
    title: 'Free Back-to-School Templates', heading: 'Back-to-School Templates',
    intro: 'Start the school year ready — supply checklists, routines, reading logs, study planners, and student resumes.',
    slugs: ['back-to-school-checklist', 'kids-daily-routine', 'kids-reading-log', 'student-entry-level-resume', 'email-sig-student', 'screen-time-tracker'], categories: ['education'],
  },
  {
    slug: 'wedding-season', kind: 'seasonal',
    title: 'Free Wedding Planning Templates', heading: 'Wedding Season Templates',
    intro: 'Plan the big day without the stress — budgets, guest lists, seating charts, timelines, and vendor trackers. All free.',
    categories: ['wedding'], slugs: ['bridal-shower-planner'],
  },
  {
    slug: 'summer', kind: 'seasonal',
    title: 'Free Summer Planning Templates', heading: 'Summer Planning Templates',
    intro: 'Make the most of summer — bucket lists, travel and packing planners, camping checklists, and kids’ activity trackers.',
    slugs: ['summer-bucket-list', 'travel-packing-checklist', 'camping-checklist', 'travel-planner', 'kids-daily-routine', 'kids-savings-tracker', 'healthy-meal-planner'],
  },
  {
    slug: 'tax-season', kind: 'seasonal',
    title: 'Free Tax Season Templates', heading: 'Tax Season Templates',
    intro: 'Get ready for tax time — expense and mileage logs, 1099 trackers, P&L statements, and a year-end prep checklist.',
    slugs: ['annual-tax-prep', '1099-self-employed-tracker', 'mileage-log', 'profit-loss-statement', 'income-expense-tracker', 'expense-report', 'small-business-bookkeeping'],
  },
];

export const getCollection = (slug: string) => collections.find((c) => c.slug === slug);
export const professionCollections = collections.filter((c) => c.kind === 'profession');
export const seasonalCollections = collections.filter((c) => c.kind === 'seasonal');
