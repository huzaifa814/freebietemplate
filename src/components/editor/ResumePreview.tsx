import { ResumeData } from '@/lib/resumeSchema';

/** Live HTML preview that mirrors the minimalist-resume design.
 *  Rendered to a fixed-width A4-ish canvas so html2canvas → PDF is consistent.
 *  Designed to be printable: simple type, single column, ATS-friendly. */
export function ResumePreview({ data, innerRef }: { data: ResumeData; innerRef?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={innerRef}
      style={{
        width: '816px',
        minHeight: '1056px',
        padding: '64px 72px',
        background: '#ffffff',
        color: '#1f2937',
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '14px',
        lineHeight: 1.5,
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '1px solid #1f2937', paddingBottom: '14px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '34px', fontWeight: 300, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>{data.name || 'Your Name'}</h1>
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#b45309', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{data.title || 'Your Title'}</p>
        <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#6b7280', fontFamily: 'Helvetica, Arial, sans-serif' }}>
          {[data.city, data.phone, data.email, data.linkedin].filter(Boolean).join('  ·  ')}
        </p>
      </div>

      {/* Summary */}
      {data.summary && (
        <Section title="Summary">
          <p style={{ margin: 0 }}>{data.summary}</p>
        </Section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <Section title="Professional Experience">
          {data.experience.map((job, i) => (
            <div key={i} style={{ marginBottom: i === data.experience.length - 1 ? 0 : '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '14px' }}>{job.title || 'Job Title'} <span style={{ fontWeight: 400, color: '#6b7280' }}>— {job.company || 'Company'}</span></strong>
                <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'Helvetica, Arial, sans-serif' }}>{[job.start, job.end].filter(Boolean).join(' – ')}</span>
              </div>
              {job.location && <p style={{ margin: '2px 0 8px', fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>{job.location}</p>}
              <ul style={{ margin: 0, paddingLeft: '20px', fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '13px' }}>
                {job.bullets.filter(Boolean).map((b, bi) => (
                  <li key={bi} style={{ marginBottom: '4px' }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <Section title="Education">
          {data.education.map((ed, i) => (
            <div key={i} style={{ marginBottom: i === data.education.length - 1 ? 0 : '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <strong>{ed.degree || 'Degree'}</strong>
                <span style={{ color: '#6b7280' }}> — {ed.school || 'School'}{ed.location && `, ${ed.location}`}</span>
              </div>
              <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'Helvetica, Arial, sans-serif' }}>{ed.year}</span>
            </div>
          ))}
        </Section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <Section title="Skills">
          <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '13px' }}>
            {data.skills.filter(Boolean).join('  ·  ')}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '20px' }}>
      <h2 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 6px', borderBottom: '1px solid #d1d5db', paddingBottom: '4px', fontFamily: 'Helvetica, Arial, sans-serif' }}>{title}</h2>
      {children}
    </section>
  );
}
