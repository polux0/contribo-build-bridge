import posthog from 'posthog-js'

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

// Initialize PostHog
if (typeof window !== 'undefined') {
  const env = getEnvironment();
  const apiKey = import.meta.env.VITE_POSTHOG_KEY;
  
  if (apiKey) {
    // Full PostHog initialization with API key
    posthog.init(apiKey, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
      // Register environment so it's auto-attached to every event
      loaded: (posthog) => {
        posthog.register({ env });
        if (import.meta.env.DEV) posthog.debug();
      },
      // Capture page views automatically
      capture_pageview: true,
      // Capture clicks automatically
      capture_pageleave: true,
      // Disable in development if needed
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
    
    // Register environment
    posthog.register({ env });
    posthog.debug();
  }
}

export { posthog }
