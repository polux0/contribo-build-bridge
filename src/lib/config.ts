export const config = {
  // Environment
  env: import.meta.env.VITE_ENV || 'development',
  isDevelopment: import.meta.env.VITE_ENV === 'development',
  isProduction: import.meta.env.VITE_ENV === 'production',
  
  // App
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:8080',
  
  // Supabase
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  },
  
  // Analytics
  analytics: {
    plausibleDomain: import.meta.env.VITE_PLAUSIBLE_DOMAIN || 'contribo.xyz',
    vercelAnalyticsId: import.meta.env.VITE_VERCEL_ANALYTICS_ID,
  },
  
  // External Services
  calendarUrl: import.meta.env.VITE_CALENDAR_URL || 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2oMnZQ7aa_oNvq19sTTR2mJTVYo9dqBH_e6Or6mSSoyVintxpIrmUMFNQwVDtn3inSMStvu6Cs',
} as const;

// Type-safe config access
export type Config = typeof config; 