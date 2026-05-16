import { ResumeData } from '@/lib/resumeSchema';

/** Modern two-column layout: dark left sidebar with photo/contact/skills,
 *  light right column with profile + experience + education.
 *  Same data schema as the minimalist preview — just a different rendering. */
export function ModernTwoColumnPreview({ data, innerRef }: { data: ResumeData; innerRef?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={innerRef}
      style={{
        width: '816px',
        minHeight: '1056px',
        background: '#ffffff',
        color: '#1f2937',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: '13px',
        lineHeight: 1.5,
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        boxSizing: 'border-box',
      }}
    >
      {/* Sidebar */}
      <aside style={{ background: '#1f2937', color: '#e5e7eb', padding: '48px 28px' }}>
        {/* Avatar */}
        <div style={{ width: 144, height: 144, borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '48px', fontWeight: 700 }}>
          {(data.name || 'YN').split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('')}
        </div>

        <h1 style={{ color: '#ffffff', fontSize: '22px', fontWeight: 700, textAlign: 'center', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{data.name || 'Your Name'}</h1>
        <p style={{ color: '#fbbf24', fontSize: '12px', textAlign: 'center', margin: '6px 0 32px' }}>{data.title || 'Your Title'}</p>

        <Section title="Contact">
          {[data.city, data.phone, data.email, data.linkedin].filter(Boolean).map((line, i) => (
            <p key={i} style={{ margin: '0 0 6px', fontSize: '11px', color: '#d1d5db', wordBreak: 'break-word' }}>{line}</p>
          ))}
        </Section>

        {data.skills.length > 0 && (
          <Section title="Skills">
            {data.skills.filter(Boolean).slice(0, 8).map((s, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '12px', color: '#e5e7eb' }}>{s}</div>
                <div style={{ height: 4, background: '#374151', borderRadius: 2, marginTop: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${60 + ((s.length * 7) % 35)}%`, height: '100%', background: '#fbbf24' }} />
                </div>
              </div>
            ))}
          </Section>
        )}

        {data.education.length > 0 && (
          <Section title="Education">
            {data.education.map((ed, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ color: '#ffffff', fontSize: '12px', fontWeight: 600 }}>{ed.degree || 'Degree'}</div>
                <div style={{ color: '#9ca3af', fontSize: '11px' }}>{ed.school}{ed.year ? ` · ${ed.year}` : ''}</div>
              </div>
            ))}
          </Section>
        )}
      </aside>

      {/* Main column */}
      <main style={{ padding: '48px 40px' }}>
        {data.summary && (
          <section style={{ marginBottom: '28px' }}>
            <H2>Profile</H2>
            <p style={{ margin: 0, color: '#374151', fontSize: '13px' }}>{data.summary}</p>
          </section>
        )}

        {data.experience.length > 0 && (
          <section>
            <H2>Experience</H2>
            {data.experience.map((job, i) => (
              <div key={i} style={{ marginBottom: i === data.experience.length - 1 ? 0 : '18px', position: 'relative', paddingLeft: '12px' }}>
                <div style={{ position: 'absolute', left: 0, top: 4, bottom: 0, width: 3, background: '#d97706' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '14px' }}>{job.title || 'Job Title'}</strong>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>{[job.start, job.end].filter(Boolean).join(' – ')}</span>
                </div>
                <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#6b7280' }}>
                  {job.company || 'Company'}{job.location && `  ·  ${job.location}`}
                </p>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px' }}>
                  {job.bullets.filter(Boolean).map((b, bi) => <li key={bi} style={{ marginBottom: '4px', color: '#374151' }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#d97706', margin: '0 0 10px', borderBottom: '2px solid #d97706', paddingBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{children}</h2>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 10px' }}>{title}</h3>
      {children}
    </div>
  );
}
