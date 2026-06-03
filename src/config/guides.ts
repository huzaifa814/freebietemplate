// How-to / guide articles. Data-driven so pages stay consistent and
// every guide cross-links to relevant templates (internal linking = SEO).

export interface GuideSection {
  h: string;
  p: string[];
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  updated: string; // ISO date
  readMinutes: number;
  intro: string;
  sections: GuideSection[];
  relatedSlugs: string[]; // template slugs to recommend
}

export const guides: Guide[] = [
  {
    slug: 'how-to-edit-a-template-in-google-docs',
    title: 'How to Edit a Template in Google Docs or Sheets',
    description: 'Open any free template in Google Docs or Sheets, make your own copy, and edit it in your browser — no Office license needed.',
    updated: '2026-06-03',
    readMinutes: 3,
    intro: 'Every template here has a one-click “Open in Google Docs/Sheets” option. It copies the file into your own Google Drive so you can edit it in the browser for free — nothing to install. Here is the whole process, start to finish.',
    sections: [
      { h: 'Step 1 — Click “Make a copy”', p: ['On any template page, click the “Open in Google Docs (make a copy)” or “Open in Google Sheets (make a copy)” button. Google will open a copy prompt.', 'If you are not signed in to a Google account, you will be asked to sign in first. A free personal Gmail account works fine.'] },
      { h: 'Step 2 — Confirm the copy', p: ['Click the blue “Make a copy” button. Google creates a private copy in your own Drive — the original template stays untouched, and your edits are yours alone.', 'The copy lands in “My Drive” by default. You can move it into a folder later if you like.'] },
      { h: 'Step 3 — Replace the placeholder text', p: ['Click into any field and type over the sample text. In spreadsheets, the formulas (totals, subtotals, variance) update automatically as you fill in numbers — leave the formula cells alone and just enter your data.', 'Change fonts, colors, and logos from the toolbar exactly as you would in any document.'] },
      { h: 'Step 4 — Export to PDF when you’re done', p: ['To send or print, use File → Download → PDF Document. That gives you a clean, locked version to attach to an email or hand to a client.', 'You can also keep editing the Google copy forever — it auto-saves every change.'] },
    ],
    relatedSlugs: ['minimalist-resume', 'small-business-bookkeeping', 'personal-monthly-budget'],
  },
  {
    slug: 'how-to-download-and-edit-word-excel-templates',
    title: 'How to Download and Edit a Word or Excel Template',
    description: 'Prefer offline editing? Download the .docx or .xlsx file and customize it in Microsoft Office, LibreOffice, or Apple Pages/Numbers.',
    updated: '2026-06-03',
    readMinutes: 3,
    intro: 'If you would rather work offline, every template offers a direct .docx (Word) or .xlsx (Excel) download. These open in Microsoft Office, the free LibreOffice suite, and Apple Pages/Numbers.',
    sections: [
      { h: 'Download the file', p: ['Click the “Download .docx” or “Download .xlsx” button on the template page. The file saves to your Downloads folder — no signup, no watermark.'] },
      { h: 'Open it in your editor', p: ['Double-click to open it in Word or Excel. No Office license? Install LibreOffice (free) or upload the file to Google Drive and open it there. On a Mac, Pages and Numbers open Word and Excel files directly.'] },
      { h: 'Edit and save', p: ['Type over the placeholder content. In spreadsheets, the formulas are built to work in Excel 2016+, Excel for Mac, and Google Sheets — SUMIFS and basic arithmetic, nothing that needs the newest version.', 'Save as you go. To share a final version, use File → Save As → PDF.'] },
      { h: 'A note on fonts', p: ['Templates use common system fonts so they look the same on any computer. If a font ever looks off, pick a similar one (Calibri, Arial, or Georgia) from your editor’s font menu.'] },
    ],
    relatedSlugs: ['modern-two-column-resume', 'profit-loss-statement', 'wedding-guest-list'],
  },
  {
    slug: 'best-free-bookkeeping-templates-small-business',
    title: 'The Best Free Bookkeeping Templates for Small Business (2026)',
    description: 'A simple, free bookkeeping stack for any small business — income/expense tracking, P&L, mileage, and cash flow — all in Excel and Google Sheets.',
    updated: '2026-06-03',
    readMinutes: 4,
    intro: 'You do not need expensive software to keep clean books. For most small businesses, a handful of well-built spreadsheets covers everything you need for tax time and day-to-day decisions. Here is the free stack we recommend.',
    sections: [
      { h: 'Start with income and expenses', p: ['The foundation of bookkeeping is recording money in and money out. Our Small Business Bookkeeping workbook does this with category dropdowns that roll up into a monthly profit & loss automatically.', 'If you want something even simpler to start, the single-tab Income & Expense Tracker is the fastest way to begin.'] },
      { h: 'Add a Profit & Loss statement', p: ['A P&L shows whether you actually made money. Ours calculates gross profit, expenses, and net income for each month and the year to date — exactly what a lender or accountant wants to see.'] },
      { h: 'Track mileage if you drive for work', p: ['Mileage is one of the most-missed deductions. The IRS-compliant Mileage Log records date, odometer, and purpose, then applies the standard rate to compute your deduction.'] },
      { h: 'Forecast cash flow so you never get surprised', p: ['Profit is not the same as cash in the bank. A 13-week Cash Flow Forecast projects receipts and payments so you can see a tight month before it arrives.'] },
    ],
    relatedSlugs: ['small-business-bookkeeping', 'profit-loss-statement', 'mileage-log', 'cash-flow-forecast'],
  },
  {
    slug: 'how-to-create-a-monthly-budget',
    title: 'How to Create a Monthly Budget That Actually Works',
    description: 'A step-by-step guide to building a monthly budget you’ll actually stick to — with free budget templates to start in minutes.',
    updated: '2026-06-03',
    readMinutes: 4,
    intro: 'Most budgets fail because they are too complicated or too optimistic. A budget that works is simple, based on your real spending, and reviewed once a week. Here is how to build one.',
    sections: [
      { h: 'Step 1 — Add up your real income', p: ['Use your take-home pay (after taxes), not your salary. If your income varies, use a conservative average of the last three months so you are never planning around money you might not get.'] },
      { h: 'Step 2 — List your fixed costs first', p: ['Rent or mortgage, utilities, insurance, phone, and subscriptions come out before anything else. These are predictable, so lock them in at the top of the budget.'] },
      { h: 'Step 3 — Try the 50/30/20 rule', p: ['A simple starting point: 50% of take-home pay to needs, 30% to wants, 20% to savings and debt. Our 50/30/20 Budget Planner does this split for you automatically — adjust the percentages to fit your life.'] },
      { h: 'Step 4 — Track actuals and review weekly', p: ['A budget is a plan; tracking is what makes it real. Log spending against your plan and check in once a week. The Personal Monthly Budget template compares planned vs actual and shows what is left to save.'] },
    ],
    relatedSlugs: ['personal-monthly-budget', '50-30-20-budget', 'paycheck-budget-planner', 'debt-snowball-payoff'],
  },
  {
    slug: 'how-to-write-an-ats-friendly-resume',
    title: 'How to Write a Resume That Passes ATS',
    description: 'Most resumes are filtered by software before a human sees them. Here’s how to format yours so it gets through — plus free ATS-friendly templates.',
    updated: '2026-06-03',
    readMinutes: 4,
    intro: 'Before a recruiter reads your resume, an Applicant Tracking System (ATS) often parses it first. If the software can’t read your layout, you’re rejected automatically. The fix is simple, structural formatting.',
    sections: [
      { h: 'Use standard section headings', p: ['Stick to headings the software recognizes: Summary, Experience, Education, Skills. Creative labels like “Where I’ve Made Magic” confuse parsers and bury your experience.'] },
      { h: 'Avoid text boxes, columns of boxes, and graphics', p: ['ATS software reads top to bottom, left to right. Text boxes and image-based layouts often get read out of order or skipped entirely. Our ATS-Friendly Pro Resume uses simple paragraphs and basic tables that parse cleanly.'] },
      { h: 'Match keywords from the job post', p: ['ATS ranks resumes by how well they match the posting. Mirror the exact skills and tools listed in the job description (where true), so your resume scores higher in the queue.'] },
      { h: 'Save as the format they ask for', p: ['If the application accepts .docx, send .docx — it parses more reliably than PDF in older systems. If it asks for PDF, export a clean PDF from Word or Google Docs.'] },
    ],
    relatedSlugs: ['ats-friendly-pro-resume', 'minimalist-resume', 'modern-two-column-resume', 'cover-letter-pack'],
  },
  {
    slug: 'best-free-invoice-templates-for-freelancers',
    title: 'The Best Free Invoice Templates for Freelancers',
    description: 'Get paid faster with a clean, professional invoice. Free invoice and estimate templates for freelancers and small businesses.',
    updated: '2026-06-03',
    readMinutes: 3,
    intro: 'A clear invoice gets paid faster than a messy one. As a freelancer, your invoice is also a touchpoint with your client — it should look as professional as your work. Here’s what to include and which free template to use.',
    sections: [
      { h: 'What every invoice needs', p: ['Your name/business and contact info, the client’s details, a unique invoice number, the date and due date, an itemized list of work, the subtotal and total, and clear payment instructions. Our invoice templates include all of this by default.'] },
      { h: 'Send an estimate first for bigger jobs', p: ['For larger projects, send a quote or estimate before you start so there are no surprises. Our Estimate/Quote template converts cleanly into an invoice once the work is approved.'] },
      { h: 'Set clear payment terms', p: ['State your terms plainly — “Net 15” or “Due on receipt” — and add a late fee policy if you use one. Clear terms reduce awkward follow-up emails.'] },
      { h: 'Always send a receipt', p: ['Once paid, send a receipt marked “Paid in full.” It closes the loop professionally and gives your client a clean record for their books.'] },
    ],
    relatedSlugs: ['etsy-seller-bookkeeping', 'fitness-trainer-invoice', '1099-self-employed-tracker', 'client-tracker'],
  },
  {
    slug: 'how-to-plan-a-wedding-on-a-budget',
    title: 'How to Plan a Wedding on a Budget',
    description: 'Plan a beautiful wedding without overspending. A practical checklist-driven approach with free wedding planning templates.',
    updated: '2026-06-03',
    readMinutes: 4,
    intro: 'A memorable wedding is about the people and the moments, not the price tag. With a clear budget and a good checklist, you can plan a beautiful day and stay in control of the spending. Here’s the framework.',
    sections: [
      { h: 'Set the total budget before anything else', p: ['Decide the all-in number first, then work backward. The Wedding Budget Tracker breaks spending into categories with estimate-vs-actual columns so you always know where you stand.'] },
      { h: 'Prioritize your top three', p: ['Pick the three things that matter most to you — maybe the venue, the photos, and the food — and spend there. Trim everywhere else guilt-free.'] },
      { h: 'Use a 12-month checklist', p: ['Most budget overruns come from last-minute decisions. A month-by-month wedding planning checklist spreads tasks out so you book early (when prices are lower) and never panic-buy.'] },
      { h: 'Track guests and RSVPs carefully', p: ['Your guest count drives catering, the biggest variable cost. The Wedding Guest List and RSVP trackers keep an accurate headcount so you’re not paying for empty seats.'] },
    ],
    relatedSlugs: ['wedding-budget-tracker', 'wedding-planning-checklist', 'wedding-guest-list', 'wedding-day-timeline'],
  },
  {
    slug: 'how-to-use-a-reward-chart-for-kids',
    title: 'How to Use a Reward Chart for Kids (That Actually Works)',
    description: 'Reward charts work when they’re simple, consistent, and positive. Here’s how to set one up — with free printable chore and reward charts.',
    updated: '2026-06-03',
    readMinutes: 3,
    intro: 'Reward charts are one of the simplest, most effective parenting tools — when they’re used well. The trick is keeping them simple, consistent, and focused on encouragement rather than punishment.',
    sections: [
      { h: 'Pick one or two behaviors at a time', p: ['Don’t chart ten things at once. Choose one or two clear, achievable behaviors (brushing teeth, putting toys away) so your child can succeed and build momentum.'] },
      { h: 'Make the goal visual and reachable', p: ['Young kids respond to seeing progress. A sticker chart with a clear prize at the end works because each sticker is a small, visible win. Our printable Reward Chart and Sticker Reward Chart are built exactly for this.'] },
      { h: 'Be consistent and immediate', p: ['Give the sticker right after the behavior, every time. Delayed or inconsistent rewards break the connection between action and reward.'] },
      { h: 'Celebrate effort, then fade it out', p: ['Once a habit sticks, you can quietly retire the chart for that behavior and start a new one. The goal is a confident kid, not a forever chart.'] },
    ],
    relatedSlugs: ['reward-chart', 'kids-chore-chart', 'blank-sticker-chart', 'kids-behavior-chart'],
  },
];

export const getGuide = (slug: string) => guides.find((g) => g.slug === slug);
