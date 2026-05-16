import { CoverLetterData } from '@/lib/coverLetterSchema';

export function CoverLetterPreview({ data, innerRef }: { data: CoverLetterData; innerRef?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={innerRef}
      style={{
        width: '816px',
        minHeight: '1056px',
        padding: '72px 80px',
        background: '#ffffff',
        color: '#1f2937',
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '14px',
        lineHeight: 1.6,
        boxSizing: 'border-box',
      }}
    >
      {/* Sender header */}
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 600, margin: 0 }}>{data.senderName || 'Your Name'}</h1>
        {data.senderTitle && <p style={{ margin: '4px 0 0', color: '#b45309', fontSize: '14px' }}>{data.senderTitle}</p>}
        <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#6b7280', fontFamily: 'Helvetica, Arial, sans-serif' }}>
          {[data.senderCity, data.senderPhone, data.senderEmail].filter(Boolean).join('  ·  ')}
        </p>
        <div style={{ height: 2, background: '#f59e0b', marginTop: '20px', width: '60px' }} />
      </header>

      {/* Date */}
      {data.date && <p style={{ margin: '0 0 28px', fontSize: '13px', color: '#6b7280', fontFamily: 'Helvetica, Arial, sans-serif' }}>{data.date}</p>}

      {/* Recipient */}
      <div style={{ marginBottom: '32px' }}>
        {data.recipientName && <p style={{ margin: '0 0 2px', fontWeight: 600 }}>{data.recipientName}</p>}
        {data.recipientTitle && <p style={{ margin: '0 0 2px', color: '#6b7280' }}>{data.recipientTitle}</p>}
        {data.recipientCompany && <p style={{ margin: '0 0 2px', color: '#6b7280' }}>{data.recipientCompany}</p>}
        {data.recipientAddress && <p style={{ margin: 0, color: '#6b7280' }}>{data.recipientAddress}</p>}
      </div>

      {/* Greeting */}
      {data.greeting && <p style={{ margin: '0 0 20px' }}>{data.greeting}</p>}

      {/* Body */}
      {data.paragraphs.filter(Boolean).map((p, i) => (
        <p key={i} style={{ margin: '0 0 18px', textAlign: 'justify' }}>{p}</p>
      ))}

      {/* Closing */}
      <p style={{ margin: '40px 0 60px' }}>{data.closing || 'Sincerely,'}</p>

      {/* Signature */}
      <p style={{ margin: 0, fontSize: '20px', fontStyle: 'italic', color: '#1f2937' }}>{data.senderName || 'Your Name'}</p>
    </div>
  );
}
