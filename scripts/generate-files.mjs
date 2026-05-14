// Generates real downloadable template files for every entry in src/config/templates.ts.
// Reads the catalog as text, extracts slug + helper pairs, emits files into public/files/.
//
// Generic per-category layouts. Each file is functional out of the box: real headers,
// working formulas where applicable, sensible sample content the user replaces.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ExcelJS from 'exceljs';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outDir = path.join(root, 'public', 'files');
fs.mkdirSync(outDir, { recursive: true });

// Extract { slug, helper, category } triples from the catalog source.
const catalogSrc = fs.readFileSync(path.join(root, 'src/config/templates.ts'), 'utf8');
const entryRe = /t\('([^']+)',\s*'([^']+)',[\s\S]*?,\s*'(resume|bookkeeping|invoice|planner|letters|business|education|email)',[\s\S]*?(xlsxFiles|docxFiles|pdfFiles|emailSigFiles)\(/g;
const entries = [];
for (const m of catalogSrc.matchAll(entryRe)) {
  entries.push({ slug: m[1], title: m[2], category: m[3], helper: m[4] });
}
console.log(`Found ${entries.length} templates to generate.`);

// ─────────── XLSX GENERATORS ───────────

const accentRGB = 'F59E0B';

function styleHeader(row) {
  row.eachCell((c) => {
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: accentRGB } };
    c.alignment = { vertical: 'middle', horizontal: 'left' };
    c.border = { bottom: { style: 'thin', color: { argb: '999999' } } };
  });
  row.height = 22;
}

function styleTitle(cell, title) {
  cell.value = title;
  cell.font = { bold: true, size: 18, color: { argb: '1F2937' } };
}

function styleNote(cell, text) {
  cell.value = text;
  cell.font = { italic: true, size: 10, color: { argb: '6B7280' } };
}

async function buildXlsx(entry) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'FreebieTemplate';
  wb.created = new Date();

  // Sheet names cannot contain * ? : \ / [ ]
  entry._sheetName = (entry.title || 'Sheet1').replace(/[*?:\\/\[\]]/g, '-').slice(0, 30);
  const cat = entry.category;
  if (cat === 'bookkeeping') buildBookkeepingXlsx(wb, entry);
  else if (cat === 'invoice') buildInvoiceXlsx(wb, entry);
  else if (cat === 'planner') buildPlannerXlsx(wb, entry);
  else if (cat === 'business') buildBusinessXlsx(wb, entry);
  else if (cat === 'education') buildEducationXlsx(wb, entry);
  else buildGenericXlsx(wb, entry);

  const file = path.join(outDir, `${entry.slug}.xlsx`);
  await wb.xlsx.writeFile(file);
}

function buildBookkeepingXlsx(wb, entry) {
  // Tab 1: Transactions
  const tx = wb.addWorksheet('Transactions');
  tx.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Description', key: 'desc', width: 36 },
    { header: 'Category', key: 'cat', width: 20 },
    { header: 'Type', key: 'type', width: 12 },
    { header: 'Amount', key: 'amt', width: 14, style: { numFmt: '"$"#,##0.00' } },
    { header: 'Notes', key: 'notes', width: 26 },
  ];
  styleHeader(tx.getRow(1));
  // 60 empty rows ready to fill
  for (let i = 0; i < 60; i++) tx.addRow({});

  // Tab 2: Summary (uses SUMIFS across categories)
  const sum = wb.addWorksheet('Summary');
  styleTitle(sum.getCell('A1'), entry.title);
  styleNote(sum.getCell('A2'), 'Auto-totals from the Transactions tab. Add rows there; this updates.');

  sum.getCell('A4').value = 'Category';
  sum.getCell('B4').value = 'Income';
  sum.getCell('C4').value = 'Expense';
  sum.getCell('D4').value = 'Net';
  styleHeader(sum.getRow(4));

  const sampleCats = ['Sales', 'Services', 'Refunds', 'Office', 'Software', 'Marketing', 'Travel', 'Meals', 'Rent', 'Utilities', 'Insurance', 'Other'];
  sampleCats.forEach((c, i) => {
    const r = 5 + i;
    sum.getCell(`A${r}`).value = c;
    sum.getCell(`B${r}`).value = { formula: `SUMIFS(Transactions!E:E,Transactions!C:C,A${r},Transactions!D:D,"Income")` };
    sum.getCell(`C${r}`).value = { formula: `SUMIFS(Transactions!E:E,Transactions!C:C,A${r},Transactions!D:D,"Expense")` };
    sum.getCell(`D${r}`).value = { formula: `B${r}-C${r}` };
    sum.getCell(`B${r}`).numFmt = '"$"#,##0.00';
    sum.getCell(`C${r}`).numFmt = '"$"#,##0.00';
    sum.getCell(`D${r}`).numFmt = '"$"#,##0.00';
  });
  const totalR = 5 + sampleCats.length;
  sum.getCell(`A${totalR}`).value = 'TOTAL';
  sum.getCell(`A${totalR}`).font = { bold: true };
  sum.getCell(`B${totalR}`).value = { formula: `SUM(B5:B${totalR - 1})` };
  sum.getCell(`C${totalR}`).value = { formula: `SUM(C5:C${totalR - 1})` };
  sum.getCell(`D${totalR}`).value = { formula: `B${totalR}-C${totalR}` };
  ['B', 'C', 'D'].forEach((c) => {
    sum.getCell(`${c}${totalR}`).numFmt = '"$"#,##0.00';
    sum.getCell(`${c}${totalR}`).font = { bold: true };
  });

  // Mileage log specialization
  if (entry.slug === 'mileage-log') {
    tx.columns = [
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Odometer Start', key: 'start', width: 16 },
      { header: 'Odometer End', key: 'end', width: 16 },
      { header: 'Miles', key: 'miles', width: 10 },
      { header: 'Purpose', key: 'purpose', width: 30 },
      { header: 'Business %', key: 'pct', width: 12 },
      { header: 'Notes', key: 'notes', width: 26 },
    ];
    styleHeader(tx.getRow(1));
    for (let i = 2; i <= 61; i++) {
      tx.getCell(`D${i}`).value = { formula: `IF(AND(B${i}<>"",C${i}<>""),C${i}-B${i},"")` };
    }
  }
}

function buildInvoiceXlsx(wb, entry) {
  const ws = wb.addWorksheet('Invoice');
  ws.columns = [
    { width: 24 }, { width: 14 }, { width: 14 }, { width: 16 }, { width: 16 },
  ];

  styleTitle(ws.getCell('A1'), entry.title);
  styleNote(ws.getCell('A2'), 'Replace the placeholder business and client info. Line totals and grand total are auto-calculated.');

  ws.getCell('A4').value = 'Your Business Name';
  ws.getCell('A5').value = 'Street Address';
  ws.getCell('A6').value = 'City, State ZIP';
  ws.getCell('A7').value = 'email@yourbusiness.com';

  ws.getCell('D4').value = 'Invoice #';
  ws.getCell('E4').value = 'INV-0001';
  ws.getCell('D5').value = 'Date';
  ws.getCell('E5').value = new Date();
  ws.getCell('E5').numFmt = 'mm/dd/yyyy';
  ws.getCell('D6').value = 'Due Date';
  ws.getCell('E6').value = '';
  ws.getCell('D7').value = 'Terms';
  ws.getCell('E7').value = 'Net 30';

  ws.getCell('A9').value = 'Bill To:';
  ws.getCell('A9').font = { bold: true };
  ws.getCell('A10').value = 'Client Name';
  ws.getCell('A11').value = 'Client Address';
  ws.getCell('A12').value = 'City, State ZIP';

  ws.getRow(14).values = ['Description', 'Qty', 'Rate', 'Tax %', 'Line Total'];
  styleHeader(ws.getRow(14));
  for (let r = 15; r <= 24; r++) {
    ws.getCell(`E${r}`).value = { formula: `IF(AND(B${r}<>"",C${r}<>""),B${r}*C${r}*(1+IFERROR(D${r},0)/100),"")` };
    ws.getCell(`C${r}`).numFmt = '"$"#,##0.00';
    ws.getCell(`E${r}`).numFmt = '"$"#,##0.00';
  }

  ws.getCell('D26').value = 'Subtotal';
  ws.getCell('E26').value = { formula: 'SUM(E15:E24)' };
  ws.getCell('E26').numFmt = '"$"#,##0.00';
  ws.getCell('D27').value = 'Total Due';
  ws.getCell('D27').font = { bold: true };
  ws.getCell('E27').value = { formula: 'E26' };
  ws.getCell('E27').numFmt = '"$"#,##0.00';
  ws.getCell('E27').font = { bold: true };

  ws.getCell('A29').value = 'Payment Terms:';
  ws.getCell('A29').font = { bold: true };
  ws.getCell('A30').value = 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.';
}

function buildPlannerXlsx(wb, entry) {
  const ws = wb.addWorksheet(entry._sheetName);
  styleTitle(ws.getCell('A1'), entry.title);
  styleNote(ws.getCell('A2'), 'Fill in the rows below. Totals update automatically.');

  if (entry.slug === 'habit-tracker') {
    const headerRow = ['Habit', ...Array.from({ length: 31 }, (_, i) => `${i + 1}`), 'Days Hit'];
    ws.getRow(4).values = headerRow;
    styleHeader(ws.getRow(4));
    for (let i = 0; i < 15; i++) {
      const r = 5 + i;
      ws.getCell(`A${r}`).value = `Habit ${i + 1}`;
      ws.getCell(`AG${r}`).value = { formula: `COUNTIF(B${r}:AF${r},"x")` };
    }
    ws.getColumn('A').width = 24;
    return;
  }

  if (entry.slug === 'monthly-budget') {
    ws.getRow(4).values = ['Category', 'Type', 'Planned', 'Actual', 'Variance'];
    styleHeader(ws.getRow(4));
    const items = [
      ['Salary', 'Income'], ['Side Income', 'Income'],
      ['Rent / Mortgage', 'Fixed'], ['Utilities', 'Fixed'], ['Insurance', 'Fixed'], ['Phone', 'Fixed'], ['Internet', 'Fixed'], ['Subscriptions', 'Fixed'],
      ['Groceries', 'Variable'], ['Dining Out', 'Variable'], ['Gas / Transit', 'Variable'], ['Entertainment', 'Variable'], ['Shopping', 'Variable'],
      ['Debt Payment', 'Debt'], ['Emergency Fund', 'Savings'], ['Investments', 'Savings'],
    ];
    items.forEach((item, i) => {
      const r = 5 + i;
      ws.getCell(`A${r}`).value = item[0];
      ws.getCell(`B${r}`).value = item[1];
      ws.getCell(`C${r}`).numFmt = '"$"#,##0.00';
      ws.getCell(`D${r}`).numFmt = '"$"#,##0.00';
      ws.getCell(`E${r}`).value = { formula: `D${r}-C${r}` };
      ws.getCell(`E${r}`).numFmt = '"$"#,##0.00';
    });
    ws.getColumn('A').width = 24;
    ws.getColumn('B').width = 14;
    ['C', 'D', 'E'].forEach((c) => (ws.getColumn(c).width = 14));
    return;
  }

  // Generic planner grid
  ws.getRow(4).values = ['Item', 'Date', 'Status', 'Notes'];
  styleHeader(ws.getRow(4));
  for (let i = 0; i < 30; i++) ws.addRow([]);
  ws.getColumn('A').width = 28;
  ws.getColumn('B').width = 14;
  ws.getColumn('C').width = 16;
  ws.getColumn('D').width = 36;
}

function buildBusinessXlsx(wb, entry) {
  const ws = wb.addWorksheet(entry._sheetName);
  styleTitle(ws.getCell('A1'), entry.title);
  styleNote(ws.getCell('A2'), 'Replace the placeholder rows with your own. Formulas update automatically.');

  if (entry.slug === 'pricing-calculator') {
    const rows = [
      ['Annual income goal', 100000],
      ['Working weeks per year', 48],
      ['Hours per week (billable)', 25],
      ['Annual business expenses', 12000],
      ['Target margin %', 30],
    ];
    rows.forEach((r, i) => {
      ws.getCell(`A${4 + i}`).value = r[0];
      ws.getCell(`B${4 + i}`).value = r[1];
    });
    ws.getCell('A10').value = 'Hourly rate (auto)';
    ws.getCell('A10').font = { bold: true };
    ws.getCell('B10').value = { formula: '(B4+B7)/(B5*B6)*(1+B8/100)' };
    ws.getCell('B10').numFmt = '"$"#,##0.00';
    ws.getColumn('A').width = 32;
    ws.getColumn('B').width = 16;
    return;
  }

  ws.getRow(4).values = ['Item', 'Value', 'Notes'];
  styleHeader(ws.getRow(4));
  for (let i = 0; i < 20; i++) ws.addRow([]);
  ws.getColumn('A').width = 28;
  ws.getColumn('B').width = 16;
  ws.getColumn('C').width = 36;
}

function buildEducationXlsx(wb, entry) {
  const ws = wb.addWorksheet(entry._sheetName);
  styleTitle(ws.getCell('A1'), entry.title);
  styleNote(ws.getCell('A2'), 'Replace the placeholder rows with your own.');

  if (entry.slug === 'gradebook') {
    ws.getRow(4).values = ['Student', 'HW1', 'HW2', 'Quiz1', 'Midterm', 'Quiz2', 'Final', 'Average'];
    styleHeader(ws.getRow(4));
    for (let i = 0; i < 25; i++) {
      const r = 5 + i;
      ws.getCell(`A${r}`).value = `Student ${i + 1}`;
      ws.getCell(`H${r}`).value = { formula: `IFERROR(AVERAGE(B${r}:G${r}),"")` };
    }
    ws.getColumn('A').width = 24;
    return;
  }

  ws.getRow(4).values = ['Item', 'Value', 'Notes'];
  styleHeader(ws.getRow(4));
  for (let i = 0; i < 20; i++) ws.addRow([]);
  ws.getColumn('A').width = 28;
  ws.getColumn('C').width = 36;
}

function buildGenericXlsx(wb, entry) {
  const ws = wb.addWorksheet('Sheet1');
  styleTitle(ws.getCell('A1'), entry.title);
  styleNote(ws.getCell('A2'), 'Add your own rows below.');
  ws.getRow(4).values = ['Item', 'Value', 'Notes'];
  styleHeader(ws.getRow(4));
  for (let i = 0; i < 20; i++) ws.addRow([]);
  ws.getColumn('A').width = 28;
  ws.getColumn('B').width = 16;
  ws.getColumn('C').width = 36;
}

// ─────────── DOCX GENERATORS ───────────

const P = (text, opts = {}) => new Paragraph({
  alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
  spacing: { after: opts.after ?? 120 },
  children: [new TextRun({ text, bold: opts.bold, size: opts.size, color: opts.color, italics: opts.italics })],
});

const H1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, bold: true, size: 36 })], spacing: { after: 200 } });
const H2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, bold: true, size: 24 })], spacing: { before: 240, after: 120 } });

async function buildDocx(entry) {
  let children;
  if (entry.category === 'resume') children = buildResumeDocx(entry);
  else if (entry.category === 'letters') children = buildLetterDocx(entry);
  else if (entry.category === 'business') children = buildBusinessDocx(entry);
  else if (entry.category === 'education') children = buildEducationDocx(entry);
  else if (entry.category === 'invoice') children = buildInvoiceDocx(entry);
  else if (entry.category === 'bookkeeping') children = buildBookkeepingDocx(entry);
  else children = buildGenericDocx(entry);

  const doc = new Document({
    creator: 'FreebieTemplate',
    title: entry.title,
    description: 'Free template from freebietemplate.com',
    sections: [{ children }],
  });
  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(outDir, `${entry.slug}.docx`), buf);
}

function buildResumeDocx(entry) {
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'FIRST LAST', bold: true, size: 40 })], spacing: { after: 80 } }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'City, State · (555) 555-1234 · you@email.com · linkedin.com/in/you', size: 20, color: '666666' })], spacing: { after: 360 } }),
    H2('Summary'),
    P('Two to three sentences about who you are, what you do, and the kind of role you are targeting. Lead with your strongest credential and quantify when possible.'),
    H2('Experience'),
    P('Job Title — Company Name', { bold: true }),
    P('City, State · Month YYYY – Present', { italics: true, after: 40, size: 20, color: '666666' }),
    P('• Quantified achievement that names the outcome (e.g., grew X by Y% in Z months).'),
    P('• Second bullet describing a specific responsibility plus the measurable impact.'),
    P('• Third bullet covering a tool, system, or process you led.'),
    P('Job Title — Company Name', { bold: true }),
    P('City, State · Month YYYY – Month YYYY', { italics: true, after: 40, size: 20, color: '666666' }),
    P('• Achievement with a number.'),
    P('• Achievement with a tool or technique.'),
    H2('Education'),
    P('Degree, Major — University Name', { bold: true }),
    P('City, State · Graduated Month YYYY', { italics: true, size: 20, color: '666666' }),
    H2('Skills'),
    P('Skill 1 · Skill 2 · Skill 3 · Skill 4 · Skill 5 · Skill 6 · Skill 7'),
    new Paragraph({ spacing: { before: 240 }, children: [new TextRun({ text: `Template: ${entry.title} — freebietemplate.com`, size: 16, color: '9CA3AF', italics: true })] }),
  ];
}

function buildLetterDocx(entry) {
  if (entry.slug === 'mutual-nda' || entry.slug === 'one-way-nda') return buildNdaDocx(entry);
  if (entry.slug === 'simple-service-contract' || entry.slug === 'independent-contractor-agreement') return buildContractDocx(entry);
  if (entry.slug === 'rental-application') return buildRentalApplicationDocx(entry);
  if (entry.slug === 'lease-agreement-simple') return buildLeaseDocx(entry);

  // Generic letter
  return [
    P('Your Name', { bold: true }),
    P('Your Address'),
    P('City, State ZIP'),
    P('Date: __________', { after: 360 }),
    P('Recipient Name'),
    P('Recipient Title'),
    P('Recipient Address'),
    P('City, State ZIP', { after: 360 }),
    P('Dear [Recipient Name],', { after: 240 }),
    H2(entry.title),
    P('[Opening paragraph — state your purpose clearly in the first sentence.]', { after: 240 }),
    P('[Middle paragraph — provide context, dates, facts, or specific examples that support your purpose.]', { after: 240 }),
    P('[Closing paragraph — state what you would like to happen next, and thank the recipient for their time.]', { after: 360 }),
    P('Sincerely,'),
    P(''),
    P('___________________________'),
    P('Your Name'),
    new Paragraph({ spacing: { before: 480 }, children: [new TextRun({ text: `Template: ${entry.title} — freebietemplate.com`, size: 16, color: '9CA3AF', italics: true })] }),
  ];
}

function buildNdaDocx(entry) {
  const isMutual = entry.slug === 'mutual-nda';
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: isMutual ? 'MUTUAL NON-DISCLOSURE AGREEMENT' : 'NON-DISCLOSURE AGREEMENT', bold: true, size: 28 })], spacing: { after: 360 } }),
    P('This Agreement is entered into on __________ (the "Effective Date") between:', { after: 200 }),
    P('Party A: ___________________________ ("Disclosing Party")'),
    P('Party B: ___________________________ ("Receiving Party")', { after: 320 }),
    H2('1. Purpose'),
    P(isMutual
      ? 'Each party may disclose confidential information to the other in connection with discussing a potential business relationship. This Agreement governs how that information is handled.'
      : 'The Disclosing Party may share confidential information with the Receiving Party in connection with a potential business relationship. This Agreement governs how that information is handled.'),
    H2('2. Definition of Confidential Information'),
    P('"Confidential Information" means any non-public information disclosed by one party to the other, in any form, that is identified as confidential or that a reasonable person would understand to be confidential under the circumstances.'),
    H2('3. Exclusions'),
    P('Confidential Information does not include information that is: (a) publicly available through no fault of the receiving party; (b) already known to the receiving party prior to disclosure; (c) independently developed without reference to the Confidential Information; or (d) required to be disclosed by law.'),
    H2('4. Obligations'),
    P('The receiving party agrees to: (a) keep the Confidential Information strictly confidential; (b) use it only for the purpose stated above; (c) restrict access to those who need to know; and (d) protect it with the same degree of care it uses for its own confidential information.'),
    H2('5. Term'),
    P('This Agreement is effective for two (2) years from the Effective Date. Obligations regarding Confidential Information survive termination for an additional three (3) years.'),
    H2('6. Return of Information'),
    P('Upon written request, the receiving party will return or destroy all Confidential Information in its possession and certify the same in writing.'),
    H2('7. Governing Law'),
    P('This Agreement is governed by the laws of the State of __________, without regard to its conflict-of-law principles.'),
    new Paragraph({ spacing: { before: 480 }, children: [new TextRun({ text: 'Signatures', bold: true, size: 22 })] }),
    P(''),
    P('Party A: ___________________________   Date: __________'),
    P(''),
    P('Party B: ___________________________   Date: __________'),
    new Paragraph({ spacing: { before: 360 }, children: [new TextRun({ text: 'This template is provided for informational purposes only and is not legal advice. Consult an attorney for high-value or complex arrangements.', size: 16, color: '9CA3AF', italics: true })] }),
  ];
}

function buildContractDocx(entry) {
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: entry.title.toUpperCase(), bold: true, size: 28 })], spacing: { after: 360 } }),
    P('This Agreement is entered into on __________ (the "Effective Date") between:', { after: 200 }),
    P('Client: ___________________________'),
    P('Contractor: ___________________________', { after: 320 }),
    H2('1. Scope of Work'),
    P('Contractor will perform the following services for Client: ____________________________________________________________________________________________________________________________________________________.'),
    H2('2. Payment'),
    P('Client will pay Contractor $__________ for the services described above. Payment terms: Net 30 from invoice date. A deposit of $__________ is due upon signing this Agreement.'),
    H2('3. Timeline'),
    P('Services begin on __________ and conclude on __________ (the "Term"), subject to mutual agreement to extend.'),
    H2('4. Intellectual Property'),
    P('Upon full payment, Client owns the deliverables produced under this Agreement. Contractor retains the right to use general methodologies and reference the work in its portfolio.'),
    H2('5. Confidentiality'),
    P('Each party will treat the other party\'s non-public information as confidential and use it only as needed to perform under this Agreement.'),
    H2('6. Independent Contractor'),
    P('Contractor is an independent contractor and not an employee of Client. Contractor is responsible for its own taxes, insurance, and business expenses.'),
    H2('7. Termination'),
    P('Either party may terminate this Agreement with fourteen (14) days written notice. Client will pay for all work completed up to the termination date.'),
    H2('8. Governing Law'),
    P('This Agreement is governed by the laws of the State of __________.'),
    new Paragraph({ spacing: { before: 480 }, children: [new TextRun({ text: 'Signatures', bold: true, size: 22 })] }),
    P(''),
    P('Client: ___________________________   Date: __________'),
    P(''),
    P('Contractor: ___________________________   Date: __________'),
    new Paragraph({ spacing: { before: 360 }, children: [new TextRun({ text: 'This template is provided for informational purposes only and is not legal advice. Consult an attorney before signing a high-value agreement.', size: 16, color: '9CA3AF', italics: true })] }),
  ];
}

function buildRentalApplicationDocx(entry) {
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'RENTAL APPLICATION', bold: true, size: 28 })], spacing: { after: 360 } }),
    H2('Applicant Information'),
    P('Full Name: ___________________________'),
    P('Date of Birth: __________     Social Security #: __________'),
    P('Phone: __________     Email: __________'),
    P('Current Address: ___________________________'),
    P('How long at current address: __________     Reason for moving: __________'),
    H2('Employment & Income'),
    P('Employer: ___________________________'),
    P('Job Title: __________     Years employed: __________'),
    P('Monthly gross income: $__________'),
    P('Supervisor name & phone: __________'),
    H2('Rental History'),
    P('Previous Landlord: ___________________________'),
    P('Phone: __________     Years rented: __________'),
    P('Monthly rent paid: $__________     Reason for leaving: __________'),
    H2('References'),
    P('Reference 1 — Name, relationship, phone: __________'),
    P('Reference 2 — Name, relationship, phone: __________'),
    H2('Authorization'),
    P('I authorize the landlord to verify the information provided and obtain a credit and background check. I certify that the information above is true and complete.', { after: 360 }),
    P('Applicant Signature: ___________________________   Date: __________'),
    new Paragraph({ spacing: { before: 360 }, children: [new TextRun({ text: 'Template: Rental Application — freebietemplate.com', size: 16, color: '9CA3AF', italics: true })] }),
  ];
}

function buildLeaseDocx(entry) {
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'RESIDENTIAL LEASE AGREEMENT', bold: true, size: 28 })], spacing: { after: 360 } }),
    P('This Lease Agreement is entered into on __________ between:', { after: 200 }),
    P('Landlord: ___________________________'),
    P('Tenant(s): ___________________________', { after: 320 }),
    H2('1. Property'),
    P('Landlord leases to Tenant the property located at: ___________________________ (the "Premises").'),
    H2('2. Term'),
    P('The lease term begins on __________ and ends on __________. After the initial term, this lease converts to month-to-month unless either party gives 30 days written notice.'),
    H2('3. Rent'),
    P('Tenant will pay $__________ per month, due on the first day of each month. Late fees of $__________ apply to rent received after the fifth day of the month.'),
    H2('4. Security Deposit'),
    P('Tenant has paid a security deposit of $__________, refundable within 21 days of move-out less any deductions for damages beyond normal wear and tear.'),
    H2('5. Utilities'),
    P('Tenant is responsible for: __________. Landlord is responsible for: __________.'),
    H2('6. Use of Premises'),
    P('Tenant will use the Premises only as a private residence. No business operations, no illegal activity, and no more than __________ occupants without written consent.'),
    H2('7. Maintenance'),
    P('Tenant will keep the Premises clean and report any damage promptly. Landlord will maintain the structure, plumbing, and major appliances in working order.'),
    H2('8. Pets'),
    P('Pets are: ☐ permitted (see Pet Addendum)   ☐ not permitted.'),
    H2('9. Governing Law'),
    P('This Agreement is governed by the laws of the State of __________.'),
    new Paragraph({ spacing: { before: 480 }, children: [new TextRun({ text: 'Signatures', bold: true, size: 22 })] }),
    P(''),
    P('Landlord: ___________________________   Date: __________'),
    P(''),
    P('Tenant: ___________________________   Date: __________'),
    new Paragraph({ spacing: { before: 360 }, children: [new TextRun({ text: 'This template is provided for informational purposes only and is not legal advice. Consult an attorney for high-value or complex tenancies.', size: 16, color: '9CA3AF', italics: true })] }),
  ];
}

function buildBusinessDocx(entry) {
  return [
    H1(entry.title),
    P(`Prepared by: ___________________________   Date: __________`, { italics: true, color: '666666', after: 320 }),
    H2('Overview'),
    P('[Brief description of the purpose of this document and who it is for.]'),
    H2('Section 1'),
    P('[Replace with your content. Use this section for the first major topic.]'),
    H2('Section 2'),
    P('[Replace with your content. Use this section for the second major topic.]'),
    H2('Section 3'),
    P('[Replace with your content. Use this section for the third major topic.]'),
    H2('Next Steps'),
    P('1. [Action item]'),
    P('2. [Action item]'),
    P('3. [Action item]'),
    new Paragraph({ spacing: { before: 480 }, children: [new TextRun({ text: `Template: ${entry.title} — freebietemplate.com`, size: 16, color: '9CA3AF', italics: true })] }),
  ];
}

function buildEducationDocx(entry) {
  if (entry.slug === 'lesson-plan') {
    return [
      H1('Lesson Plan'),
      P('Teacher: __________     Date: __________     Grade: __________     Subject: __________', { after: 320 }),
      H2('Objectives'),
      P('By the end of this lesson, students will be able to:'),
      P('• ____________________________________________________________'),
      P('• ____________________________________________________________'),
      H2('Materials'),
      P('• ____________________________________________________________'),
      P('• ____________________________________________________________'),
      H2('Lesson (45 minutes)'),
      P('Opening (5 min): __________'),
      P('Direct instruction (15 min): __________'),
      P('Guided practice (15 min): __________'),
      P('Independent practice (5 min): __________'),
      P('Closing (5 min): __________'),
      H2('Assessment'),
      P('How will you measure whether students met the objectives? __________'),
      H2('Differentiation'),
      P('Adjustments for advanced learners: __________'),
      P('Adjustments for struggling learners: __________'),
      new Paragraph({ spacing: { before: 360 }, children: [new TextRun({ text: 'Template: Lesson Plan — freebietemplate.com', size: 16, color: '9CA3AF', italics: true })] }),
    ];
  }
  return buildGenericDocx(entry);
}

function buildInvoiceDocx(entry) {
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: entry.title.toUpperCase(), bold: true, size: 28 })], spacing: { after: 320 } }),
    P('Your Business Name', { bold: true }),
    P('Street Address'),
    P('City, State ZIP'),
    P('email@yourbusiness.com', { after: 320 }),
    P('Invoice #: INV-0001     Date: __________     Due: __________', { after: 320 }),
    P('Bill To:', { bold: true }),
    P('Client Name'),
    P('Client Address'),
    P('City, State ZIP', { after: 320 }),
    H2('Services'),
    P('Description ............................. Amount'),
    P('Line item 1 ............................. $__________'),
    P('Line item 2 ............................. $__________'),
    P('Line item 3 ............................. $__________'),
    P('— — —'),
    P('Subtotal ................................ $__________'),
    P('Tax ..................................... $__________'),
    P('Total Due ............................... $__________', { bold: true, after: 320 }),
    P('Payment terms: Net 30. Late payments subject to 1.5% monthly interest.'),
    new Paragraph({ spacing: { before: 360 }, children: [new TextRun({ text: `Template: ${entry.title} — freebietemplate.com`, size: 16, color: '9CA3AF', italics: true })] }),
  ];
}

function buildBookkeepingDocx(entry) {
  return [
    H1(entry.title),
    P('Use this checklist to gather everything your CPA needs for the tax year.', { italics: true, color: '666666', after: 320 }),
    H2('Personal Documents'),
    P('☐ W-2s from each employer'),
    P('☐ 1099-NEC for self-employment income'),
    P('☐ 1099-INT / 1099-DIV from banks and brokerages'),
    P('☐ 1098 mortgage interest statement'),
    P('☐ 1098-T tuition statement'),
    P('☐ Charitable donation receipts'),
    P('☐ Medical expense receipts (if itemizing)'),
    P('☐ State and local tax records'),
    H2('Business Documents (if applicable)'),
    P('☐ Profit & Loss statement for the year'),
    P('☐ Balance sheet as of December 31'),
    P('☐ Bank and credit card statements'),
    P('☐ Mileage log for business travel'),
    P('☐ Home office calculation (sq ft, % business use)'),
    P('☐ Receipts for equipment purchases over $200'),
    P('☐ Health insurance premiums paid (self-employed)'),
    P('☐ Retirement plan contributions (SEP, Solo 401k)'),
    H2('Other'),
    P('☐ Prior-year return (helpful for comparisons)'),
    P('☐ IRS notices received during the year'),
    P('☐ Estimated tax payments made (quarterly vouchers)'),
    new Paragraph({ spacing: { before: 360 }, children: [new TextRun({ text: 'Template: Annual Tax Prep — freebietemplate.com', size: 16, color: '9CA3AF', italics: true })] }),
  ];
}

function buildGenericDocx(entry) {
  return [
    H1(entry.title),
    P('[Replace this with your content.]', { italics: true, color: '666666', after: 320 }),
    H2('Section 1'),
    P('[Replace with your content.]'),
    H2('Section 2'),
    P('[Replace with your content.]'),
    H2('Section 3'),
    P('[Replace with your content.]'),
    new Paragraph({ spacing: { before: 360 }, children: [new TextRun({ text: `Template: ${entry.title} — freebietemplate.com`, size: 16, color: '9CA3AF', italics: true })] }),
  ];
}

// ─────────── HTML EMAIL SIGNATURE GENERATOR ───────────

function buildHtml(entry) {
  // Style variants per slug for visual variety.
  const variant = entry.slug.replace('email-sig-', '');

  const accent = {
    minimalist: '#1F2937',
    professional: '#2563EB',
    executive: '#0F172A',
    'real-estate': '#B45309',
    photographer: '#111827',
    'creative-agency': '#7C3AED',
    healthcare: '#0EA5E9',
    'law-firm': '#1F2937',
    'sales-rep': '#16A34A',
    marketing: '#EC4899',
    recruiter: '#0891B2',
    'coach-consultant': '#F59E0B',
    'startup-founder': '#000000',
    'banking-finance': '#1E3A8A',
    multilingual: '#4B5563',
    'plain-text': null,
  }[variant] || '#F59E0B';

  if (variant === 'plain-text') {
    const txt = `--
Your Name | Your Title
Your Company
Phone: (555) 555-1234
Email: you@yourcompany.com
Web: https://yourcompany.com`;
    return `<!doctype html><html><body><pre style="font-family:Consolas,monospace;font-size:13px;color:#1F2937;">${txt}</pre></body></html>`;
  }

  const ctaButton = variant === 'sales-rep'
    ? `<a href="https://calendly.com/your-link" style="display:inline-block;background:${accent};color:#fff;padding:8px 14px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600;margin-top:8px;">📅 Book a 15-min call</a>`
    : '';

  const social = ['marketing', 'creative-agency', 'recruiter', 'coach-consultant'].includes(variant)
    ? `<div style="margin-top:6px;"><a href="#" style="color:${accent};text-decoration:none;margin-right:10px;font-size:13px;">LinkedIn</a><a href="#" style="color:${accent};text-decoration:none;margin-right:10px;font-size:13px;">Twitter</a><a href="#" style="color:${accent};text-decoration:none;margin-right:10px;font-size:13px;">Instagram</a></div>`
    : '';

  const disclaimer = variant === 'law-firm'
    ? `<div style="margin-top:10px;font-size:11px;color:#6B7280;max-width:480px;line-height:1.4;">CONFIDENTIALITY NOTICE: This email and any attachments may contain information that is privileged and confidential. If you are not the intended recipient, please delete this email and notify the sender.</div>`
    : variant === 'banking-finance'
      ? `<div style="margin-top:10px;font-size:11px;color:#6B7280;max-width:480px;line-height:1.4;">This email is for informational purposes only and does not constitute investment advice. Products are not FDIC insured and may lose value.</div>`
      : variant === 'healthcare'
        ? `<div style="margin-top:10px;font-size:11px;color:#6B7280;max-width:480px;line-height:1.4;">This email may contain protected health information. If received in error, please delete and notify the sender immediately.</div>`
        : '';

  const credentials = variant === 'healthcare' ? ', RN, BSN' : variant === 'law-firm' ? ', Esq.' : '';
  const licenseLine = variant === 'real-estate' ? `<div style="font-size:13px;color:#6B7280;margin-top:2px;">License # __________ | MLS __________</div>` : '';
  const taglineLine = variant === 'coach-consultant' ? `<div style="font-size:13px;color:${accent};font-style:italic;margin-top:2px;">Helping ambitious people do their best work.</div>` : '';
  const stackedML = variant === 'multilingual'
    ? `<div style="margin-top:10px;padding-top:10px;border-top:1px solid #E5E7EB;font-size:13px;color:#6B7280;">[Stacked second-language version: Name | Title | Phone | Email]</div>`
    : '';

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;">
<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-size:14px;color:#1F2937;line-height:1.4;">
  <tr>
    <td style="vertical-align:top;padding-right:18px;border-right:3px solid ${accent};">
      <div style="font-size:18px;font-weight:700;color:#0F172A;">Your Name${credentials}</div>
      <div style="font-size:13px;color:#6B7280;margin-top:2px;">Your Title</div>
      ${taglineLine}
      ${licenseLine}
    </td>
    <td style="vertical-align:top;padding-left:18px;">
      <div style="font-size:13px;font-weight:600;color:${accent};">Your Company</div>
      <div style="font-size:13px;color:#374151;margin-top:4px;">
        <span style="color:#9CA3AF;">P</span> (555) 555-1234 &nbsp;·&nbsp;
        <span style="color:#9CA3AF;">E</span> you@company.com
      </div>
      <div style="font-size:13px;color:#374151;margin-top:2px;">
        <span style="color:#9CA3AF;">W</span> <a href="https://yourcompany.com" style="color:${accent};text-decoration:none;">yourcompany.com</a>
      </div>
      ${social}
      ${ctaButton}
      ${stackedML}
    </td>
  </tr>
</table>
${disclaimer}
<div style="margin-top:14px;font-size:11px;color:#9CA3AF;">Template from freebietemplate.com — replace the placeholders with your own info.</div>
</body>
</html>`;
}

// ─────────── PDF GENERATOR ───────────

async function buildPdf(entry) {
  const pdf = await PDFDocument.create();
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([612, 792]); // US Letter
  const { width } = page.getSize();

  // Title bar
  page.drawRectangle({ x: 0, y: 752, width, height: 40, color: rgb(0.96, 0.62, 0.04) });
  page.drawText(entry.title, { x: 36, y: 765, size: 18, font: helvBold, color: rgb(1, 1, 1) });

  // Subtitle
  page.drawText('Free template — freebietemplate.com', { x: 36, y: 730, size: 10, font: helv, color: rgb(0.45, 0.45, 0.45) });

  // Grid for printable planners (weekly, daily, etc.)
  const startY = 700;
  const rowHeight = 22;
  const rows = Math.floor((startY - 60) / rowHeight);
  for (let i = 0; i < rows; i++) {
    const y = startY - i * rowHeight;
    page.drawLine({ start: { x: 36, y }, end: { x: width - 36, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
  }

  // Footer
  page.drawText('freebietemplate.com', { x: width - 130, y: 30, size: 9, font: helv, color: rgb(0.6, 0.6, 0.6) });

  const buf = await pdf.save();
  fs.writeFileSync(path.join(outDir, `${entry.slug}.pdf`), buf);
}

// ─────────── DRIVER ───────────

const stats = { xlsx: 0, docx: 0, html: 0, pdf: 0, skipped: 0 };

for (const entry of entries) {
  try {
    if (entry.helper === 'xlsxFiles') {
      await buildXlsx(entry);
      stats.xlsx++;
    } else if (entry.helper === 'docxFiles') {
      await buildDocx(entry);
      stats.docx++;
    } else if (entry.helper === 'emailSigFiles') {
      fs.writeFileSync(path.join(outDir, `${entry.slug}.html`), buildHtml(entry));
      stats.html++;
    } else if (entry.helper === 'pdfFiles') {
      // pdfFiles helper attaches both Google Docs link AND a downloadable PDF.
      // Generate both: a .docx via the docx helper output style, AND a .pdf grid.
      await buildPdf(entry);
      stats.pdf++;
    } else {
      stats.skipped++;
    }
  } catch (err) {
    console.error(`Failed for ${entry.slug}:`, err.message);
    stats.skipped++;
  }
}

console.log('Done.', stats);
