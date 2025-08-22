import { config } from '@/lib/config';
import { useEffect } from 'react';

export function Analytics() {
  useEffect(() => {
    // Only load analytics in production
    if (!config.isProduction) {
      return;
    }

    // Vercel Analytics
    if (config.analytics.vercelAnalyticsId) {
      const script = document.createElement('script');
      script.src = '/_vercel/insights/script.js';
      script.defer = true;
      document.head.appendChild(script);
    }

    // Plausible Analytics
    if (config.analytics.plausibleDomain) {
      const script = document.createElement('script');
      script.src = `https://plausible.io/js/script.js`;
      script.setAttribute('data-domain', config.analytics.plausibleDomain);
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  return null;
} 