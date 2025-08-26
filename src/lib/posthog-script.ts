import posthog from 'posthog-js'

// Helper function to get UTM parameters
const getUTMParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    utm_term: urlParams.get('utm_term'),
    utm_content: urlParams.get('utm_content'),
  };
};

// Helper function to get referrer
const getReferrer = () => {
  return {
    referrer: document.referrer,
    referring_domain: document.referrer ? new URL(document.referrer).hostname : null,
  };
};

// Save attribution data to localStorage for 30 days
const saveAttribution = (utmParams: any, referrerData: any) => {
  const attributionData = {
    ...utmParams,
    ...referrerData,
    timestamp: new Date().toISOString(),
  };
  
  localStorage.setItem('posthog_attribution', JSON.stringify(attributionData));
  
  // Set expiration for 30 days
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + 30);
  localStorage.setItem('posthog_attribution_expires', expiration.toISOString());
};

// Load attribution data from localStorage
const loadAttribution = () => {
  const expiration = localStorage.getItem('posthog_attribution_expires');
  if (expiration && new Date(expiration) < new Date()) {
    // Expired, remove old data
    localStorage.removeItem('posthog_attribution');
    localStorage.removeItem('posthog_attribution_expires');
    return null;
  }
  
  const data = localStorage.getItem('posthog_attribution');
  return data ? JSON.parse(data) : null;
};

// Detect environment from hostname
const getEnvironment = (): string => {
  // Optional safety switch: if URL has ?env=dev, override to dev
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('env') === 'dev') {
    return 'dev';
  }

  // Detect from hostname
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'dev';
  }
  
  return 'prod';
};

// Initialize PostHog with comprehensive tracking
if (typeof window !== 'undefined') {
  const env = getEnvironment();
  const apiKey = import.meta.env.VITE_POSTHOG_KEY;
  
  if (apiKey) {
    // Get UTM and referrer data
    const utmParams = getUTMParams();
    const referrerData = getReferrer();
    
    // Save attribution if we have UTM parameters or referrer
    if (Object.values(utmParams).some(v => v) || referrerData.referrer) {
      saveAttribution(utmParams, referrerData);
    }
    
    // Load existing attribution
    const existingAttribution = loadAttribution();
    
    // Initialize PostHog
    posthog.init(apiKey, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        // Register environment and attribution data
        posthog.register({ 
          env,
          ...utmParams,
          ...referrerData,
          ...(existingAttribution && { 
            initial_utm_source: existingAttribution.utm_source,
            initial_utm_medium: existingAttribution.utm_medium,
            initial_utm_campaign: existingAttribution.utm_campaign,
            initial_referrer: existingAttribution.referrer,
            initial_referring_domain: existingAttribution.referring_domain,
          })
        });
        
        if (import.meta.env.DEV) posthog.debug();
        
        // Fire SessionStarted event
        posthog.capture('SessionStarted', {
          env,
          ...utmParams,
          ...referrerData,
          ...(existingAttribution && { 
            initial_utm_source: existingAttribution.utm_source,
            initial_utm_medium: existingAttribution.utm_medium,
            initial_utm_campaign: existingAttribution.utm_campaign,
            initial_referrer: existingAttribution.referrer,
            initial_referring_domain: existingAttribution.referring_domain,
          })
        });
      },
      capture_pageview: true,
      capture_pageleave: true,
      disable_session_recording: import.meta.env.DEV,
    });
  } else {
    // Debug-only mode for testing without API key
    console.log('🔍 PostHog: No API key provided, running in debug mode');
    console.log('🔍 PostHog: Environment detected as:', env);
    
    // Create a mock posthog object for testing
    const mockPosthog = {
      capture: (event: string, properties?: any) => {
        console.log('🎯 [PostHog Debug] Event captured:', event, {
          ...properties,
          env,
          timestamp: new Date().toISOString(),
        });
      },
      register: (properties: any) => {
        console.log('📝 [PostHog Debug] Properties registered:', properties);
      },
      debug: () => {
        console.log('🐛 [PostHog Debug] Debug mode enabled');
      },
    };
    
    // Replace the real posthog with mock for testing
    Object.assign(posthog, mockPosthog);
    
    // Register environment and fire SessionStarted
    posthog.register({ env });
    posthog.debug();
    posthog.capture('SessionStarted', { env });
  }
}

// Helper function trackPH(eventName, props) that we can call anywhere
export const trackPH = (eventName: string, props?: Record<string, any>) => {
  if (posthog) {
    posthog.capture(eventName, props);
  }
};

export { posthog }
