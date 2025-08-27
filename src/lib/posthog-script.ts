import posthog from 'posthog-js'
import { devLog } from '@/lib/utils';

// Helper function to get UTM parameters from URL
const getUTMParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    utm_source: urlParams.get('utm_source') || '',
    utm_medium: urlParams.get('utm_medium') || '',
    utm_campaign: urlParams.get('utm_campaign') || '',
    utm_term: urlParams.get('utm_term') || '',
    utm_content: urlParams.get('utm_content') || '',
  };
};

// Helper function to get referrer information
const getReferrer = () => {
  const referrer = document.referrer;
  const referringDomain = referrer ? new URL(referrer).hostname : '';
  
  return {
    referrer,
    referring_domain: referringDomain,
  };
};

// Helper function to save attribution data to localStorage
const saveAttribution = (utmParams: any, referrerData: any) => {
  const attributionData = {
    ...utmParams,
    ...referrerData,
    timestamp: new Date().toISOString(),
  };
  
  try {
    localStorage.setItem('posthog_attribution', JSON.stringify(attributionData));
    
    // Set expiration (30 days)
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 30);
    localStorage.setItem('posthog_attribution_expires', expiration.toISOString());
  } catch (error) {
    devLog('🔍 PostHog: Could not save attribution to localStorage:', error);
  }
};

// Helper function to load attribution data from localStorage
const loadAttribution = () => {
  try {
    const expiration = localStorage.getItem('posthog_attribution_expires');
    if (expiration && new Date(expiration) < new Date()) {
      // Expired, remove old data
      localStorage.removeItem('posthog_attribution');
      localStorage.removeItem('posthog_attribution_expires');
      return null;
    }
    
    const data = localStorage.getItem('posthog_attribution');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    devLog('🔍 PostHog: Could not load attribution from localStorage:', error);
    return null;
  }
};

// Helper function to determine environment
const getEnvironment = () => {
  if (import.meta.env.DEV) return 'dev';
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return 'dev';
  if (window.location.hostname.includes('staging') || window.location.hostname.includes('test')) return 'staging';
  return 'prod';
};

// Check if PostHog should be disabled (e.g., due to ad blockers)
const shouldDisablePostHog = () => {
  // Check if we're in a privacy-focused environment
  if (typeof window === 'undefined') return true;
  
  // Check for common ad blocker indicators
  const adBlockerIndicators = [
    'adblock',
    'ublock',
    'privacy',
    'ghostery',
    'duckduckgo',
  ];
  
  const userAgent = navigator.userAgent.toLowerCase();
  return adBlockerIndicators.some(indicator => userAgent.includes(indicator));
};

// Initialize PostHog with comprehensive tracking and error handling
if (typeof window !== 'undefined' && !shouldDisablePostHog()) {
  const env = getEnvironment();
  const apiKey = import.meta.env.VITE_POSTHOG_KEY;
  
  if (apiKey) {
    try {
      // Get UTM and referrer data
      const utmParams = getUTMParams();
      const referrerData = getReferrer();
      
      // Save attribution if we have UTM parameters or referrer
      if (Object.values(utmParams).some(v => v) || referrerData.referrer) {
        saveAttribution(utmParams, referrerData);
      }
      
      // Load existing attribution
      const existingAttribution = loadAttribution();
      
      // Initialize PostHog with error handling
      posthog.init(apiKey, {
        api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
        loaded: (posthog) => {
          try {
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
          } catch (error) {
            devLog('🔍 PostHog: Error in loaded callback:', error);
          }
        },
        capture_pageview: true,
        capture_pageleave: true,
        disable_session_recording: import.meta.env.DEV,
        // Add error handling for network issues
        bootstrap: {
          distinctID: null,
          isIdentifiedID: false,
          featureFlags: {},
          sessionRecording: false,
        },
        // Disable features that might cause issues
        disable_persistence: false,
        disable_cookie: false,
        // Add timeout for requests
        request_batching: true,
        batch_size: 50,
        batch_flush_interval_ms: 3000,
      });
    } catch (error) {
      devLog('🔍 PostHog: Failed to initialize:', error);
    }
  } else {
    // Debug-only mode for testing without API key
    devLog('🔍 PostHog: No API key provided, running in debug mode');
    devLog('🔍 PostHog: Environment detected as:', env);
    
    // Create a mock posthog object for testing
    const mockPosthog = {
      capture: (event: string, properties?: any) => {
        devLog('🎯 [PostHog Debug] Event captured:', event, {
          ...properties,
          env,
          timestamp: new Date().toISOString(),
        });
      },
      register: (properties: any) => {
        devLog('📝 [PostHog Debug] Properties registered:', properties);
      },
      debug: () => {
        devLog('🐛 [PostHog Debug] Debug mode enabled');
      },
    };
    
    // Replace the real posthog with mock for testing
    Object.assign(posthog, mockPosthog);
    
    // Register environment and fire SessionStarted
    posthog.register({ env });
    posthog.debug();
    posthog.capture('SessionStarted', { env });
  }
} else {
  // Create a no-op posthog for environments where it's disabled
  const noOpPosthog = {
    capture: () => {},
    register: () => {},
    debug: () => {},
    init: () => {},
  };
  
  Object.assign(posthog, noOpPosthog);
  devLog('🔍 PostHog: Disabled due to environment or ad blocker detection');
}

// Helper function trackPH(eventName, props) that we can call anywhere
export const trackPH = (eventName: string, props?: Record<string, any>) => {
  try {
    if (posthog && typeof posthog.capture === 'function') {
      posthog.capture(eventName, props);
    }
  } catch (error) {
    devLog('🔍 PostHog: Error tracking event:', eventName, error);
  }
};

export { posthog }
