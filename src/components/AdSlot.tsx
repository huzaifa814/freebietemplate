'use client';
import { useEffect } from 'react';
import { siteConfig } from '@/config/site';

type Props = { slot?: string; format?: 'auto' | 'fluid'; layout?: string; className?: string };

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

export function AdSlot({ slot, format = 'auto', layout, className = '' }: Props) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle may not be loaded yet in dev / blockers
    }
  }, []);

  return (
    <div className={`my-8 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={siteConfig.adsense.clientId}
        data-ad-slot={slot || ''}
        data-ad-format={format}
        data-ad-layout={layout}
        data-full-width-responsive="true"
      />
    </div>
  );
}
