export type ResumeData = {
  name: string;
  title: string;
  email: string;
  phone: string;
  city: string;
  linkedin: string;
  summary: string;
  experience: { title: string; company: string; location: string; start: string; end: string; bullets: string[] }[];
  education: { degree: string; school: string; location: string; year: string }[];
  skills: string[];
};

export const sampleResume: ResumeData = {
  name: 'Morgan Bell',
  title: 'Marketing Director',
  email: 'morgan.bell@example.com',
  phone: '(415) 555-0142',
  city: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/morganbell',
  summary: 'Results-driven marketing leader with 10+ years of experience building brands and driving growth at consumer and B2B companies. Combines strategic thinking with hands-on execution to translate ambitious goals into shipped campaigns.',
  experience: [
    {
      title: 'Marketing Director',
      company: 'Northwind Studio',
      location: 'San Francisco, CA',
      start: 'Jan 2022',
      end: 'Present',
      bullets: [
        'Led cross-functional team of 12 to launch a new product line, growing revenue by $4.2M in the first 18 months.',
        'Reduced customer acquisition cost by 35% by redesigning paid social funnels and refining audience targeting.',
        'Established weekly executive reporting cadence; reduced data turnaround time from 5 days to 1 day.',
      ],
    },
    {
      title: 'Senior Marketing Manager',
      company: 'Hartford & Co.',
      location: 'Oakland, CA',
      start: 'Jun 2018',
      end: 'Dec 2021',
      bullets: [
        'Owned $2M annual budget across brand, content, and lifecycle programs.',
        'Built and shipped customer onboarding flow used by 40,000+ new accounts per quarter, lifting activation by 22%.',
      ],
    },
  ],
  education: [
    { degree: 'B.S. Marketing', school: 'University of California, Berkeley', location: 'Berkeley, CA', year: '2018' },
  ],
  skills: ['Brand Strategy', 'Growth Marketing', 'Lifecycle', 'Paid Social', 'SEO', 'Analytics', 'Team Leadership', 'Cross-functional'],
};
