export type CoverLetterData = {
  senderName: string;
  senderTitle: string;
  senderCity: string;
  senderPhone: string;
  senderEmail: string;
  date: string;
  recipientName: string;
  recipientTitle: string;
  recipientCompany: string;
  recipientAddress: string;
  greeting: string;
  paragraphs: string[];
  closing: string;
};

export const sampleCoverLetter: CoverLetterData = {
  senderName: 'Morgan Bell',
  senderTitle: 'Marketing Director',
  senderCity: 'San Francisco, CA',
  senderPhone: '(415) 555-0142',
  senderEmail: 'morgan.bell@example.com',
  date: 'May 14, 2026',
  recipientName: 'Hiring Team',
  recipientTitle: '',
  recipientCompany: 'Hartford & Co.',
  recipientAddress: '500 Tech Park Drive, San Francisco, CA 94105',
  greeting: 'Dear Hiring Team,',
  paragraphs: [
    'I am writing to apply for the Senior Marketing Manager role on your growth team. With ten years of experience leading marketing at consumer and B2B companies, I bring a hands-on, data-driven approach to brand and acquisition.',
    'In my current role at Northwind Studio I built a cross-functional growth pod that launched three new product lines and added $4.2M in incremental revenue in 18 months. Before that I owned a $2M lifecycle program at Hartford & Co. that lifted activation 22% across 40,000+ new accounts per quarter.',
    'I am drawn to Hartford & Co. because of your category-defining work in financial wellness and your operating model that pairs designers with engineers on every team. I would welcome the chance to discuss how my background could help expand your reach into new segments.',
  ],
  closing: 'Sincerely,',
};
