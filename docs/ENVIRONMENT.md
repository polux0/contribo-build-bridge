# Environment Configuration

This document explains how the application handles different environments (local development vs production).

## Environment Structure

```
contribo-build-bridge/
├── env.example          # Template for environment variables
├── .env.local          # Local development variables (gitignored)
├── src/lib/config.ts   # Centralized configuration
├── scripts/setup-local.sh  # Setup script
└── DEVELOPMENT.md      # Detailed setup guide
```

## Environment Variables

### Required Variables
- `VITE_ENV` - Environment identifier (`development` or `production`)
- `VITE_APP_URL` - Application URL
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anonymous key
- `VITE_CALENDAR_URL` - Google Calendar booking URL

### Optional Variables
- `VITE_PLAUSIBLE_DOMAIN` - Plausible analytics domain
- `VITE_VERCEL_ANALYTICS_ID` - Vercel analytics ID

## Environment Modes

### Development Mode (`npm run dev:local`)
- Uses `.env.local` file
- Analytics disabled
- Local Supabase instance (optional)
- Development-specific features enabled

### Production Mode (`npm run dev` or `npm run build`)
- Uses Vercel environment variables
- Analytics enabled
- Production Supabase instance
- Optimized for performance

## Configuration Management

The `src/lib/config.ts` file centralizes all environment-specific configuration:

```typescript
export const config = {
  env: import.meta.env.VITE_ENV || 'development',
  isDevelopment: import.meta.env.VITE_ENV === 'development',
  isProduction: import.meta.env.VITE_ENV === 'production',
  // ... other config
};
```

## Switching Environments

### To Local Development
1. Copy `env.example` to `.env.local`
2. Update Supabase credentials in `.env.local`
3. Run `npm run dev:local`

### To Production
1. Ensure Vercel environment variables are set
2. Run `npm run dev` or deploy to Vercel

## Database Options

### Option 1: Shared Production Database
- **Pros**: Real data, no setup required
- **Cons**: Risk of affecting production data
- **Use case**: Read-only development

### Option 2: Local Supabase Instance
- **Pros**: Isolated, safe for testing
- **Cons**: Requires setup, no real data
- **Use case**: Feature development

### Option 3: Staging Database
- **Pros**: Realistic data, isolated from production
- **Cons**: Requires maintenance
- **Use case**: Testing with production-like data

## Analytics Behavior

- **Development**: Analytics disabled to avoid polluting production data
- **Production**: Vercel Analytics + Plausible enabled

## Quick Commands

```bash
# Setup local environment
./scripts/setup-local.sh

# Start local development
npm run dev:local

# Start production development
npm run dev

# Build for local testing
npm run build:local

# Build for production
npm run build
```

## Troubleshooting

### Environment Variables Not Loading
- Restart development server after changing `.env.local`
- Check variable names start with `VITE_`
- Verify file format (no spaces around `=`)

### Supabase Connection Issues
- Verify URL and API key in Supabase dashboard
- Check IP allowlist in Supabase settings
- Ensure project is active

### Analytics Not Working
- Analytics only load in production mode
- Check browser console for errors
- Verify domain configuration 