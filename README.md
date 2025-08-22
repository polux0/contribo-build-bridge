# Contribo - Hire Developers After Seeing How They Build

A modern web application for technical hiring and developer assessments, built with React, TypeScript, Vite, and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm, yarn, or bun
- Supabase CLI (optional, for local development)

### One-Command Setup
```bash
# Complete setup including local Supabase
./scripts/setup-complete.sh
```

### Manual Setup
```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp env.example .env.local
# Edit .env.local with your configuration

# 3. Start development server
npm run dev:local
```

## 🏗️ Architecture  

- **Frontend**: React + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics + Plausible

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server (production mode)
- `npm run dev:local` - Start development server (local mode)
- `npm run build` - Build for production
- `npm run build:local` - Build for local environment
- `npm run preview` - Preview production build
- `npm run preview:local` - Preview local build
- `npm run lint` - Run ESLint

### Local Development with Supabase
```bash
# Start local Supabase
supabase start

# Get local credentials
supabase status

# Update .env.local with local credentials
# Then start your app
npm run dev:local
```

### OAuth Providers (Optional)
Set up GitHub, Google, and LinkedIn OAuth for local development:
```bash
# Get setup instructions
./scripts/setup-oauth.sh

# Follow detailed guide
# See OAUTH_SETUP.md
```

## 📁 Project Structure

```
contribo-build-bridge/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom hooks
│   ├── integrations/  # External integrations
│   └── lib/           # Utilities and config
├── public/            # Static assets
├── supabase/          # Supabase configuration
├── scripts/           # Setup and utility scripts
└── docs/              # Documentation
```

## 🌍 Environment Configuration

The application supports multiple environments:

### Local Development
- Uses local Supabase instance
- OAuth providers configured for localhost
- Analytics disabled

### Production
- Uses hosted Supabase
- OAuth providers configured for production domain
- Analytics enabled

## 📚 Documentation

- [DEVELOPMENT.md](./DEVELOPMENT.md) - Detailed development guide
- [ENVIRONMENT.md](./ENVIRONMENT.md) - Environment configuration
- [OAUTH_SETUP.md](./OAUTH_SETUP.md) - OAuth provider setup

## 🔐 Authentication

Supports multiple authentication methods:
- Email/Password
- OAuth providers (GitHub, Google, LinkedIn)
- Magic links

## 🚀 Deployment

The application is automatically deployed to Vercel when you push to the main branch.

### Environment Variables
Set these in your Vercel project:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_ENV=production`
- OAuth provider credentials (if using OAuth)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.
