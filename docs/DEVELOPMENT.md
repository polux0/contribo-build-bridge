# Development Setup Guide

This guide will help you set up a local development environment that mirrors your production setup.

## Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or bun
- Git

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd contribo-build-bridge
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your local configuration:
   ```env
   # Local Development Environment
   VITE_ENV=development
   VITE_APP_URL=http://localhost:8080
   
   # Supabase Configuration (use your local or staging project)
   VITE_SUPABASE_URL=https://mlpquscmwjvgamprxlgl.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_local_supabase_anon_key
   
   # Analytics (disabled for local development)
   VITE_PLAUSIBLE_DOMAIN=contribo.xyz
   VITE_VERCEL_ANALYTICS_ID=
   
   # External Services
   VITE_CALENDAR_URL=https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2oMnZQ7aa_oNvq19sTTR2mJTVYo9dqBH_e6Or6mSSoyVintxpIrmUMFNQwVDtn3inSMStvu6Cs
   ```

4. **Start development server**
   ```bash
   npm run dev:local
   # or
   yarn dev:local
   # or
   bun dev:local
   ```

## Environment Configuration

### Local Development
- **URL**: `http://localhost:8080`
- **Analytics**: Disabled (to avoid polluting production data)
- **Supabase**: Use staging/local project

### Production
- **URL**: `https://contribo.xyz`
- **Analytics**: Enabled (Vercel Analytics + Plausible)
- **Supabase**: Production project

## Supabase Setup

### Option 1: Use Production Database (Read-only)
- Use the same Supabase project as production
- This gives you real data but be careful with writes

### Option 2: Create Local Supabase Instance
1. Install Supabase CLI
   ```bash
   npm install -g supabase
   ```

2. Initialize local Supabase
   ```bash
   supabase init
   supabase start
   ```

3. Update `.env.local` with local Supabase credentials

### Option 3: Create Staging Environment
1. Create a new Supabase project for staging
2. Copy schema and data from production
3. Use staging credentials in `.env.local`

## Available Scripts

- `npm run dev` - Start development server (production mode)
- `npm run dev:local` - Start development server (local mode)
- `npm run build` - Build for production
- `npm run build:local` - Build for local environment
- `npm run preview` - Preview production build
- `npm run preview:local` - Preview local build
- `npm run lint` - Run ESLint

## Static Pages

The application includes static pages in the `/public` directory:
- `/pilot` - Pilot landing page
- `/reputation` - Reputation page

These are served directly by Vercel in production and by Vite in development.

## Troubleshooting

### Environment Variables Not Loading
- Ensure `.env.local` exists and has correct format
- Restart the development server after changing environment variables
- Check that variable names start with `VITE_`

### Supabase Connection Issues
- Verify Supabase URL and API key are correct
- Check if your IP is allowed in Supabase dashboard
- Ensure Supabase project is active

### Build Issues
- Clear `node_modules` and reinstall dependencies
- Check TypeScript errors with `npm run lint`
- Verify all environment variables are set

## Deployment

### Local Testing
```bash
npm run build:local
npm run preview:local
```

### Production Deployment
The application is automatically deployed to Vercel when you push to the main branch.

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_ENV` | Environment (development/production) | Yes |
| `VITE_APP_URL` | Application URL | Yes |
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous key | Yes |
| `VITE_PLAUSIBLE_DOMAIN` | Plausible analytics domain | No |
| `VITE_VERCEL_ANALYTICS_ID` | Vercel analytics ID | No |
| `VITE_CALENDAR_URL` | Google Calendar booking URL | Yes | 