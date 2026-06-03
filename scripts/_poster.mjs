// Shared typographic-poster renderer for the Printable Wall Art category.
// Used by generate-previews.mjs (800x1035 preview) and generate-files.mjs
// (high-res print PDF) so the preview and the download match exactly.

export const POSTER_TEXT = {
  'dream-big-printable': { big: ['DREAM', 'BIG'], sub: 'and dare to fail', style: 'bold', accent: '#f59e0b' },
  'you-are-enough-print': { big: ['you are', 'enough'], style: 'serif', accent: '#6b8e6b' },
  'good-vibes-only-print': { big: ['GOOD', 'VIBES', 'ONLY'], style: 'colorblock', accent: '#ec4899' },
  'be-kind-print': { big: ['be kind'], style: 'minimal', accent: '#0ea5e9' },
  'stay-wild-print': { big: ['stay', 'wild'], sub: 'moon child', style: 'serif', accent: '#7c3aed' },
  'hello-sunshine-print': { big: ['hello', 'sunshine'], style: 'bold', accent: '#f59e0b' },
  'but-first-coffee-print': { big: ['but first,', 'coffee'], style: 'serif', accent: '#92400e' },
  'gather-sign-printable': { big: ['gather'], style: 'serif', accent: '#44403c' },
  'home-sweet-home-print': { big: ['home', 'sweet', 'home'], style: 'minimal', accent: '#0f766e' },
  'you-are-so-loved-nursery': { big: ['you are', 'so loved'], style: 'serif', accent: '#db2777' },
  'dream-big-little-one-nursery': { big: ['dream big', 'little one'], style: 'bold', accent: '#38bdf8' },
  'grateful-thankful-blessed-print': { big: ['grateful', 'thankful', 'blessed'], style: 'serif', accent: '#b45309' },
  'make-it-happen-print': { big: ['MAKE IT', 'HAPPEN'], style: 'bold', accent: '#dc2626' },
  'adventure-awaits-print': { big: ['adventure', 'awaits'], style: 'colorblock', accent: '#15803d' },
  'live-laugh-love-print': { big: ['live', 'laugh', 'love'], style: 'minimal', accent: '#be185d' },
  'classic-quote-poster': { big: ['What lies behind us', 'and what lies before us', 'are tiny matters', 'compared to what', 'lies within us.'], author: '— Ralph Waldo Emerson', style: 'serif', accent: '#1f2937' },
};

const SANS = 'Arial, sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';

function fitFont(ctx, lines, maxW, startSize, weight, family) {
  let size = startSize;
  for (;;) {
    ctx.font = `${weight} ${size}px ${family}`;
    const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
    if (widest <= maxW || size <= 12) return size;
    size -= 2;
  }
}

// Draw the poster for `spec` onto ctx at W x H (any resolution).
export function drawPoster(ctx, W, H, spec) {
  const s = spec.style || 'serif';
  const accent = spec.accent || '#f59e0b';
  const big = spec.big || [spec.title || ''];
  const k = W / 800; // scale factor relative to preview width
  const cx = W / 2;
  const onColor = s === 'colorblock';
  const bg = onColor ? accent : (s === 'serif' ? '#fbfaf7' : '#ffffff');
  const fg = onColor ? '#ffffff' : '#1f2937';

  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Frame
  if (s === 'bold' || s === 'colorblock') {
    ctx.strokeStyle = onColor ? 'rgba(255,255,255,0.85)' : accent;
    ctx.lineWidth = 4 * k;
    const m = 34 * k;
    ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
  }

  ctx.textAlign = 'center';
  const maxW = W * 0.74;
  const family = (s === 'serif' || s === 'colorblock') ? SERIF : SANS;
  const weight = (s === 'bold') ? '800' : (s === 'minimal' ? '600' : '700');
  const upper = (s === 'bold');
  const lines = upper ? big.map((l) => l.toUpperCase()) : big;

  // Letter-spacing for minimal style
  if (s === 'minimal' && 'letterSpacing' in ctx) ctx.letterSpacing = `${6 * k}px`;

  const isQuote = lines.length >= 4;
  const startSize = isQuote ? 56 * k : (lines.length >= 3 ? 120 * k : 150 * k);
  const lineGap = isQuote ? 1.32 : 1.04;
  const size = fitFont(ctx, lines, maxW, startSize, weight, family);
  const lh = size * lineGap;
  const blockH = lh * lines.length;
  let y = H / 2 - blockH / 2 + size * 0.82;

  // Top accent mark (serif/minimal)
  if (s === 'serif' && !isQuote) {
    ctx.strokeStyle = accent; ctx.lineWidth = 3 * k;
    ctx.beginPath(); ctx.moveTo(cx - 40 * k, y - size * 0.95 - 30 * k); ctx.lineTo(cx + 40 * k, y - size * 0.95 - 30 * k); ctx.stroke();
  }
  if (s === 'minimal') {
    ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(cx, H / 2 - blockH / 2 - 44 * k, 9 * k, 0, Math.PI * 2); ctx.fill();
  }

  ctx.fillStyle = fg;
  ctx.font = `${weight} ${size}px ${family}`;
  for (const l of lines) { ctx.fillText(l, cx, y); y += lh; }
  if (s === 'minimal' && 'letterSpacing' in ctx) ctx.letterSpacing = '0px';

  // Sub / author
  if (spec.sub) {
    ctx.fillStyle = onColor ? 'rgba(255,255,255,0.92)' : accent;
    ctx.font = `italic 600 ${30 * k}px ${SERIF}`;
    ctx.fillText(spec.sub, cx, y + 14 * k);
  }
  if (spec.author) {
    ctx.fillStyle = onColor ? 'rgba(255,255,255,0.92)' : '#6b7280';
    ctx.font = `italic 500 ${26 * k}px ${SERIF}`;
    ctx.fillText(spec.author, cx, y + 30 * k);
  }

  // Bottom rule for serif (non-quote)
  if (s === 'serif' && !isQuote && !spec.sub) {
    ctx.strokeStyle = accent; ctx.lineWidth = 3 * k;
    ctx.beginPath(); ctx.moveTo(cx - 40 * k, y + 8 * k); ctx.lineTo(cx + 40 * k, y + 8 * k); ctx.stroke();
  }

  // Footer
  ctx.fillStyle = onColor ? 'rgba(255,255,255,0.6)' : '#c8ccd2';
  ctx.font = `500 ${14 * k}px ${SANS}`;
  ctx.fillText('freebietemplate.com', cx, H - 40 * k);
  ctx.textAlign = 'left';
}
