import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} — ${siteConfig.tagline}`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: 'website', locale: 'en_US', url: siteConfig.url,
    siteName: siteConfig.name, title: siteConfig.name, description: siteConfig.description,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: `${siteConfig.name} — ${siteConfig.tagline}` }],
  },
  twitter: { card: 'summary_large_image', title: siteConfig.name, description: siteConfig.description, creator: siteConfig.twitter, images: [siteConfig.ogImage] },
  robots: { index: true, follow: true },
  alternates: { canonical: siteConfig.url },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content={siteConfig.adsense.clientId} />
        <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.adsense.clientId}`} crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'WebSite',
          name: siteConfig.name, url: siteConfig.url, description: siteConfig.description,
          potentialAction: { '@type': 'SearchAction', target: `${siteConfig.url}/templates?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
        })}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
