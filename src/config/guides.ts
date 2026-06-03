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
  howto?: boolean; // step-by-step guide → emits HowTo structured data
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
  {
    slug: 'how-to-track-business-expenses',
    title: 'How to Track Business Expenses (the Simple Way)',
    description: 'A simple system for tracking business expenses so tax time is painless — with free expense and bookkeeping templates.',
    updated: '2026-06-03', readMinutes: 4, howto: true,
    intro: 'Tracking expenses well does two things: it lowers your tax bill (you claim every deduction) and it shows you where the money actually goes. Here is a system that takes minutes a week.',
    sections: [
      { h: 'Step 1 — Separate business and personal', p: ['Open a dedicated business bank account or card. Mixing personal and business spending is the #1 cause of messy books and missed deductions.'] },
      { h: 'Step 2 — Log expenses weekly, not yearly', p: ['Set a 15-minute weekly slot to enter receipts. Our Income & Expense Tracker uses category dropdowns and auto-totals so this stays quick.'] },
      { h: 'Step 3 — Categorize for Schedule C', p: ['Group expenses into standard categories (software, supplies, travel, meals) so they map cleanly to your tax forms. The Small Business Bookkeeping workbook is pre-set up this way.'] },
      { h: 'Step 4 — Keep your receipts', p: ['Snap a photo of every receipt and note the business purpose. The Employee Expense Report template includes a receipts column and approval row.'] },
    ],
    relatedSlugs: ['income-expense-tracker', 'small-business-bookkeeping', 'expense-report', 'mileage-log'],
  },
  {
    slug: 'how-to-create-an-invoice',
    title: 'How to Create an Invoice That Gets Paid Fast',
    description: 'Step-by-step: what to put on an invoice, how to set terms, and a free invoice template to send in minutes.',
    updated: '2026-06-03', readMinutes: 3, howto: true,
    intro: 'A clear invoice gets paid faster. Here is exactly what to include and how to send one that leaves no room for confusion.',
    sections: [
      { h: 'Step 1 — Add your details and a number', p: ['Put your business name, contact info, and a unique invoice number at the top. Numbering keeps your records straight and looks professional.'] },
      { h: 'Step 2 — List the work, itemized', p: ['Break the work into line items with description, quantity, rate, and amount. Vague invoices invite questions and delays.'] },
      { h: 'Step 3 — Show totals and tax clearly', p: ['Subtotal, any tax, and a bold total. Our invoice templates calculate these automatically once you fill in the line items.'] },
      { h: 'Step 4 — State payment terms and how to pay', p: ['Add the due date (e.g. "Net 15"), accepted payment methods, and any late fee. Clear terms mean fewer awkward follow-ups.'] },
    ],
    relatedSlugs: ['fitness-trainer-invoice', '1099-self-employed-tracker', 'client-tracker'],
  },
  {
    slug: 'how-to-pay-off-debt-fast',
    title: 'How to Pay Off Debt Fast (Snowball vs Avalanche)',
    description: 'The two proven debt-payoff methods explained, plus free trackers to pick a plan and watch your balances fall.',
    updated: '2026-06-03', readMinutes: 4, howto: true,
    intro: 'Getting out of debt comes down to a clear plan and momentum. The two best-known methods are the snowball and the avalanche — here is how to choose and stick with one.',
    sections: [
      { h: 'Step 1 — List every debt', p: ['Write down each balance, interest rate, and minimum payment. You cannot beat what you have not measured.'] },
      { h: 'Step 2 — Pick snowball or avalanche', p: ['Snowball pays the smallest balance first for quick motivating wins. Avalanche pays the highest interest first to save the most money. Both work — pick the one you will actually stick to.'] },
      { h: 'Step 3 — Throw every extra dollar at one debt', p: ['Pay minimums on everything, then put all extra money toward your target debt. When it is gone, roll that payment to the next one.'] },
      { h: 'Step 4 — Track it so you can see progress', p: ['Our Debt Snowball Tracker shows your payoff date and interest saved updating as you go — seeing the finish line is what keeps you going.'] },
    ],
    relatedSlugs: ['debt-snowball-payoff', 'debt-payoff-tracker', 'personal-monthly-budget', 'emergency-fund-tracker'],
  },
  {
    slug: 'how-to-build-an-emergency-fund',
    title: 'How to Build an Emergency Fund',
    description: 'How much to save, where to keep it, and how to get there — with a free emergency fund tracker.',
    updated: '2026-06-03', readMinutes: 3, howto: true,
    intro: 'An emergency fund is the financial cushion that turns a crisis into an inconvenience. Here is how to build one without feeling deprived.',
    sections: [
      { h: 'Step 1 — Start with a $1,000 starter fund', p: ['Before anything else, save a small starter buffer. It stops a flat tire or vet bill from becoming new debt.'] },
      { h: 'Step 2 — Aim for 3–6 months of expenses', p: ['Add up your essential monthly costs and multiply. The Emergency Fund Tracker calculates your target and shows how many months you have covered.'] },
      { h: 'Step 3 — Automate the saving', p: ['Set an automatic transfer the day after payday. Money you never see is money you never miss.'] },
      { h: 'Step 4 — Keep it separate but accessible', p: ['A high-yield savings account is ideal — separate from your checking so you are not tempted, but available within a day or two.'] },
    ],
    relatedSlugs: ['emergency-fund-tracker', 'savings-goal-tracker', 'personal-monthly-budget', 'sinking-funds-planner'],
  },
  {
    slug: 'how-to-write-a-cover-letter',
    title: 'How to Write a Cover Letter (with a Free Template)',
    description: 'A simple four-paragraph cover letter formula that actually gets read — plus a free cover letter template.',
    updated: '2026-06-03', readMinutes: 3, howto: true,
    intro: 'A good cover letter is short, specific, and about them — not you. Use this four-paragraph structure and you will never stare at a blank page again.',
    sections: [
      { h: 'Step 1 — Open with why this role', p: ['Name the role and one genuine reason you are excited about this company specifically. Skip "To whom it may concern."'] },
      { h: 'Step 2 — Prove you can do the job', p: ['Pick one or two achievements that match the posting and quantify them. Mirror the language of the job description.'] },
      { h: 'Step 3 — Connect to the company', p: ['Show you understand what they do and how you would contribute. One or two sentences is enough.'] },
      { h: 'Step 4 — Close with a clear next step', p: ['Thank them, restate your interest, and say you would welcome a conversation. Our Cover Letter Pack gives you three matching designs to start from.'] },
    ],
    relatedSlugs: ['cover-letter-pack', 'minimalist-resume', 'ats-friendly-pro-resume'],
  },
  {
    slug: 'how-to-make-a-chore-chart-that-works',
    title: 'How to Make a Chore Chart That Actually Works',
    description: 'Get kids to help out without nagging — a simple chore chart system, plus free printable chore and reward charts.',
    updated: '2026-06-03', readMinutes: 3, howto: true,
    intro: 'Chore charts fail when they are too complicated or inconsistent. Keep it simple and visual and kids will buy in. Here is how.',
    sections: [
      { h: 'Step 1 — Match chores to age', p: ['Give kids tasks they can actually do alone. Two or three age-appropriate chores beat a long list nobody finishes.'] },
      { h: 'Step 2 — Make it visual', p: ['A chart on the fridge with checkboxes or stars makes progress obvious. Our printable Kids Chore Chart is built for exactly this.'] },
      { h: 'Step 3 — Tie it to a reward', p: ['Stars toward a small prize or screen time work well. Keep the reward reachable within a week.'] },
      { h: 'Step 4 — Be consistent', p: ['Check the chart at the same time each day. Consistency is what turns a chore into a habit.'] },
    ],
    relatedSlugs: ['kids-chore-chart', 'reward-chart', 'blank-sticker-chart', 'allowance-tracker'],
  },
  {
    slug: 'how-to-meal-plan-for-the-week',
    title: 'How to Meal Plan for the Week (and Save Money)',
    description: 'A simple weekly meal-planning routine that cuts your grocery bill and the daily "what’s for dinner" stress.',
    updated: '2026-06-03', readMinutes: 3, howto: true,
    intro: 'Meal planning saves money, time, and decision fatigue. It takes about 20 minutes a week once you have a system. Here it is.',
    sections: [
      { h: 'Step 1 — Check what you already have', p: ['Start with your fridge, freezer, and pantry. Planning around what you own cuts waste and your bill.'] },
      { h: 'Step 2 — Plan around your week', p: ['Match easy meals to busy nights and bigger cooks to free evenings. Fill in the Healthy Meal Planner for all seven days.'] },
      { h: 'Step 3 — Build the grocery list as you go', p: ['Add ingredients to a list grouped by aisle so shopping is fast. Our Grocery Shopping List is organized this way.'] },
      { h: 'Step 4 — Prep ahead where you can', p: ['Wash, chop, or batch-cook on a free day. Future-you will be grateful at 6pm on a Tuesday.'] },
    ],
    relatedSlugs: ['healthy-meal-planner', 'weekly-meal-prep', 'grocery-shopping-list', 'personal-monthly-budget'],
  },
  {
    slug: 'how-to-create-a-content-calendar',
    title: 'How to Create a Social Media Content Calendar',
    description: 'Post consistently without the daily scramble — how to build a content calendar, plus free social media templates.',
    updated: '2026-06-03', readMinutes: 4, howto: true,
    intro: 'Consistency beats virality. A content calendar turns "what do I post today?" into a plan you execute. Here is how to build one.',
    sections: [
      { h: 'Step 1 — Define your content pillars', p: ['Pick 3–5 themes you post about (e.g. tips, behind-the-scenes, results, personal). The Content Pillar Planner helps you map these.'] },
      { h: 'Step 2 — Batch your ideas', p: ['Brainstorm a month of posts at once into a Content Idea Bank, tagged by pillar and format. Batching beats daily inspiration-hunting.'] },
      { h: 'Step 3 — Schedule by date and platform', p: ['Drop ideas onto a calendar with caption, hashtags, and status. The Social Media Content Calendar tracks all of this in one view.'] },
      { h: 'Step 4 — Review what works', p: ['Track engagement per post and double down on what resonates. The Engagement Tracker makes the pattern obvious.'] },
    ],
    relatedSlugs: ['social-media-content-calendar', 'content-pillar-planner', 'content-idea-bank', 'engagement-tracker'],
  },
  {
    slug: 'how-to-organize-your-finances',
    title: 'How to Organize Your Finances in a Weekend',
    description: 'A weekend plan to get your money organized — budget, bills, debt, and savings — with free templates for each piece.',
    updated: '2026-06-03', readMinutes: 4, howto: true,
    intro: 'You do not need an app subscription to take control of your money — just a couple of hours and a few simple sheets. Here is the weekend plan.',
    sections: [
      { h: 'Step 1 — See the full picture', p: ['List your income, accounts, debts, and recurring bills. The Net Worth Tracker gives you a single number to anchor on.'] },
      { h: 'Step 2 — Build a budget', p: ['Assign every dollar a job with a monthly budget. The 50/30/20 Budget Planner is the fastest place to start.'] },
      { h: 'Step 3 — Get bills under control', p: ['List every bill with its due date so nothing slips. The Bill Payment Tracker shows what is outstanding at a glance.'] },
      { h: 'Step 4 — Set one savings goal', p: ['Pick one goal — emergency fund, trip, debt — and automate toward it. Momentum on one goal beats vague intentions on five.'] },
    ],
    relatedSlugs: ['personal-monthly-budget', '50-30-20-budget', 'bill-pay-tracker', 'net-worth-tracker'],
  },
  {
    slug: 'best-free-templates-for-etsy-sellers',
    title: 'The Best Free Templates for Etsy & Online Sellers',
    description: 'Run your online shop on free tools — bookkeeping, profit-per-order, inventory, and invoices for handmade and resale sellers.',
    updated: '2026-06-03', readMinutes: 3,
    intro: 'Selling online means thin margins and lots of small numbers. These free templates keep your shop profitable and your books tax-ready.',
    sections: [
      { h: 'Track profit per order', p: ['Fees, shipping, and materials eat margin fast. The Online Seller Bookkeeping workbook computes net profit per order after every cost.'] },
      { h: 'Watch your inventory', p: ['Know what is in stock and what to reorder. The Inventory Tracker flags reorder points and values stock at cost.'] },
      { h: 'Keep clean books for taxes', p: ['As a 1099 seller, organized books save real money. The 1099 / Self-Employed Tracker maps to Schedule C and estimates quarterly taxes.'] },
      { h: 'Invoice wholesale and custom orders', p: ['For custom or wholesale work, send a proper invoice. Our invoice templates handle line items and totals automatically.'] },
    ],
    relatedSlugs: ['etsy-seller-bookkeeping', 'inventory-tracker', '1099-self-employed-tracker', 'shopify-seller-bookkeeping'],
  },
  {
    slug: 'best-free-planner-templates-for-students',
    title: 'The Best Free Planner Templates for Students',
    description: 'Stay on top of classes, assignments, and study time with free student planners, reading logs, and budgets.',
    updated: '2026-06-03', readMinutes: 3,
    intro: 'The right planner is the difference between cramming and coasting. These free templates help students manage time, money, and reading.',
    sections: [
      { h: 'Plan your study time', p: ['Block out classes, assignments, and study sessions so nothing sneaks up on you. Our study and weekly planners keep the semester visible.'] },
      { h: 'Track your reading', p: ['Log books and minutes to build a steady habit — useful for assigned reading and personal growth alike.'] },
      { h: 'Budget your money', p: ['Student budgets are tight. The Personal Monthly Budget and Savings Goal Tracker help you stretch every dollar.'] },
      { h: 'Polish your resume early', p: ['Internships and first jobs come fast. The Student / Entry-Level Resume is built for exactly that.'] },
    ],
    relatedSlugs: ['student-entry-level-resume', 'personal-monthly-budget', 'kids-reading-log', 'savings-goal-tracker'],
  },
];

export const getGuide = (slug: string) => guides.find((g) => g.slug === slug);
