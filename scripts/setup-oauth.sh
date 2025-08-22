#!/bin/bash

echo "🔐 OAuth Setup Helper for Local Development"
echo "=============================================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found. Please run ./scripts/setup-local.sh first."
    exit 1
fi

echo "📋 This script will help you set up OAuth providers for local development."
echo ""

echo "🔗 OAuth Provider URLs:"
echo "======================="
echo "GitHub:     https://github.com/settings/developers"
echo "Google:     https://console.cloud.google.com/"
echo "LinkedIn:   https://www.linkedin.com/developers/"
echo ""

echo "📝 Required Redirect URIs for each provider:"
echo "============================================="
echo "Authorization callback URL: http://127.0.0.1:54321/auth/v1/callback"
echo "Homepage URL: http://127.0.0.1:8080"
echo ""

echo "🔧 Environment Variables to add to .env.local:"
echo "=============================================="
echo ""

echo "# GitHub OAuth"
echo "SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=your_github_client_id"
echo "SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=your_github_client_secret"
echo ""

echo "# Google OAuth"
echo "SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your_google_client_id"
echo "SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your_google_client_secret"
echo ""

echo "# LinkedIn OAuth"
echo "SUPABASE_AUTH_EXTERNAL_LINKEDIN_CLIENT_ID=your_linkedin_client_id"
echo "SUPABASE_AUTH_EXTERNAL_LINKEDIN_SECRET=your_linkedin_client_secret"
echo ""

echo "🚀 Next Steps:"
echo "=============="
echo "1. Create OAuth apps in each provider's developer console"
echo "2. Add the environment variables to .env.local"
echo "3. Start local Supabase: supabase start"
echo "4. Start your app: npm run dev:local"
echo "5. Test OAuth providers"
echo ""

echo "📖 For detailed instructions, see OAUTH_SETUP.md"
echo ""

# Check if Supabase is running
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI is installed"
    
    # Check if Supabase is running
    if supabase status &> /dev/null; then
        echo "✅ Local Supabase is running"
        echo ""
        echo "🔗 Local Supabase URLs:"
        echo "API: http://127.0.0.1:54321"
        echo "Studio: http://127.0.0.1:54323"
        echo "Inbucket: http://127.0.0.1:54324"
    else
        echo "⚠️  Local Supabase is not running"
        echo "Run 'supabase start' to start it"
    fi
else
    echo "❌ Supabase CLI not found"
    echo "Install it first: https://supabase.com/docs/guides/cli"
fi 