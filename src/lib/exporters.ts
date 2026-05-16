import type { ResumeData } from './resumeSchema';
import type { CoverLetterData } from './coverLetterSchema';

/** Render a DOM node to PDF using html2canvas-pro + jsPDF. Letter-size, one page. */
export async function exportElementToPDF(el: HTMLElement, filename: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ]);
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const ratio = canvas.width / canvas.height;
  // Fit width, paginate if taller than page
  let imgW = pageW;
  let imgH = imgW / ratio;
  if (imgH <= pageH) {
    pdf.addImage(imgData, 'PNG', 0, 0, imgW, imgH);
  } else {
    // Multi-page: slice the canvas
    let y = 0;
    const sliceH = (canvas.width / pageW) * pageH;
    while (y < canvas.height) {
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = Math.min(sliceH, canvas.height - y);
      const sctx = sliceCanvas.getContext('2d')!;
      sctx.drawImage(canvas, 0, y, canvas.width, sliceCanvas.height, 0, 0, canvas.width, sliceCanvas.height);
      const sliceData = sliceCanvas.toDataURL('image/png');
      if (y > 0) pdf.addPage();
      pdf.addImage(sliceData, 'PNG', 0, 0, pageW, (sliceCanvas.height * pageW) / canvas.width);
      y += sliceH;
    }
  }
  pdf.save(filename);
}

/** Build a .docx Blob from resume data — used by both download and Drive save. */
export async function buildResumeDocxBlob(data: ResumeData): Promise<Blob> {
  const doc = await assembleResumeDocxDocument(data);
  const docx = await import('docx');
  return docx.Packer.toBlob(doc);
}

/** Build a .docx Word document from resume data and trigger download. */
export async function exportResumeToDocx(data: ResumeData, filename: string) {
  const blob = await buildResumeDocxBlob(data);
  triggerDownload(blob, filename);
}

async function assembleResumeDocxDocument(data: ResumeData) {
  const docx = await import('docx');
  const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;

  const P = (text: string, opts: { bold?: boolean; italics?: boolean; color?: string; size?: number; align?: 'center' | 'left' | 'right'; after?: number } = {}) =>
    new Paragraph({
      alignment: opts.align === 'center' ? AlignmentType.CENTER : opts.align === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT,
      spacing: { after: opts.after ?? 100 },
      children: [new TextRun({ text, bold: opts.bold, italics: opts.italics, color: opts.color, size: opts.size })],
    });

  const H2 = (text: string) => new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24 })],
  });

  const children: InstanceType<typeof Paragraph>[] = [];

  // Header
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [new TextRun({ text: data.name.toUpperCase(), bold: true, size: 40 })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [new TextRun({ text: data.title, color: 'B45309', size: 22 })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    children: [new TextRun({ text: [data.city, data.phone, data.email, data.linkedin].filter(Boolean).join('  ·  '), color: '6B7280', size: 20 })],
  }));

  if (data.summary) {
    children.push(H2('Summary'));
    children.push(P(data.summary));
  }

  if (data.experience.length > 0) {
    children.push(H2('Professional Experience'));
    for (const job of data.experience) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: job.title, bold: true, size: 24 }),
          new TextRun({ text: ` — ${job.company}`, color: '6B7280', size: 24 }),
          new TextRun({ text: `      ${[job.start, job.end].filter(Boolean).join(' – ')}`, color: '6B7280', size: 20 }),
        ],
        spacing: { after: 40 },
      }));
      if (job.location) children.push(P(job.location, { italics: true, color: '6B7280', size: 20, after: 80 }));
      for (const b of job.bullets.filter(Boolean)) {
        children.push(new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 60 },
          children: [new TextRun({ text: b, size: 22 })],
        }));
      }
    }
  }

  if (data.education.length > 0) {
    children.push(H2('Education'));
    for (const ed of data.education) {
      children.push(new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({ text: ed.degree, bold: true, size: 22 }),
          new TextRun({ text: ` — ${ed.school}${ed.location ? `, ${ed.location}` : ''}`, color: '6B7280', size: 22 }),
          new TextRun({ text: `      ${ed.year}`, color: '6B7280', size: 20 }),
        ],
      }));
    }
  }

  if (data.skills.length > 0) {
    children.push(H2('Skills'));
    children.push(P(data.skills.filter(Boolean).join('  ·  ')));
  }

  return new Document({
    creator: 'FreebieTemplate',
    title: data.name + ' Resume',
    sections: [{ children }],
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function buildCoverLetterDocxBlob(data: CoverLetterData): Promise<Blob> {
  const doc = await assembleCoverLetterDocument(data);
  const docx = await import('docx');
  return docx.Packer.toBlob(doc);
}

export async function exportCoverLetterToDocx(data: CoverLetterData, filename: string) {
  const blob = await buildCoverLetterDocxBlob(data);
  triggerDownload(blob, filename);
}

async function assembleCoverLetterDocument(data: CoverLetterData) {
  const docx = await import('docx');
  const { Document, Paragraph, TextRun, AlignmentType } = docx;

  const P = (text: string, opts: { bold?: boolean; italics?: boolean; color?: string; size?: number; after?: number; align?: 'left' | 'right' } = {}) =>
    new Paragraph({
      alignment: opts.align === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT,
      spacing: { after: opts.after ?? 120 },
      children: [new TextRun({ text, bold: opts.bold, italics: opts.italics, color: opts.color, size: opts.size })],
    });

  const children: InstanceType<typeof Paragraph>[] = [];

  // Sender header
  children.push(P(data.senderName, { bold: true, size: 32, after: 40 }));
  if (data.senderTitle) children.push(P(data.senderTitle, { color: 'B45309', size: 22, after: 60 }));
  children.push(P([data.senderCity, data.senderPhone, data.senderEmail].filter(Boolean).join('  ·  '), { color: '6B7280', size: 20, after: 280 }));

  // Date
  if (data.date) children.push(P(data.date, { color: '6B7280', size: 20, after: 280 }));

  // Recipient
  if (data.recipientName) children.push(P(data.recipientName, { bold: true, after: 40 }));
  if (data.recipientTitle) children.push(P(data.recipientTitle, { color: '6B7280', after: 40 }));
  if (data.recipientCompany) children.push(P(data.recipientCompany, { color: '6B7280', after: 40 }));
  if (data.recipientAddress) children.push(P(data.recipientAddress, { color: '6B7280', after: 280 }));

  // Greeting
  if (data.greeting) children.push(P(data.greeting, { after: 220 }));

  // Body
  for (const para of data.paragraphs.filter(Boolean)) {
    children.push(P(para, { after: 200 }));
  }

  // Closing
  children.push(P(data.closing || 'Sincerely,', { after: 480 }));
  children.push(P(data.senderName, { italics: true, size: 28 }));

  return new Document({
    creator: 'FreebieTemplate',
    title: `${data.senderName} Cover Letter`,
    sections: [{ children }],
  });
}
