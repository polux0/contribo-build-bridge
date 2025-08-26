#!/bin/bash

# Privy Setup Script for Contribo
# This script helps you set up Privy Web3 authentication

set -e

echo "🚀 Setting up Privy Web3 Authentication for Contribo"
echo "=================================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found. Please run the main setup script first:"
    echo "   ./scripts/setup-complete.sh"
    exit 1
fi

echo ""
echo "📋 Prerequisites:"
echo "1. You need a Privy account (sign up at https://console.privy.io/)"
echo "2. Your Supabase project should be running"
echo "3. OAuth providers should be configured (GitHub, Google, LinkedIn)"
echo ""

read -p "Do you have a Privy account and are ready to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please sign up at https://console.privy.io/ and try again."
    exit 1
fi

echo ""
echo "🔧 Step 1: Create Privy App"
echo "=========================="
echo "1. Go to https://console.privy.io/"
echo "2. Click 'Create App'"
echo "3. Fill in the details:"
echo "   - App Name: Contribo"
echo "   - Description: Technical hiring platform with Web3 integration"
echo "4. Copy your App ID"
echo ""

read -p "Enter your Privy App ID: " PRIVY_APP_ID

if [ -z "$PRIVY_APP_ID" ]; then
    echo "❌ Privy App ID is required"
    exit 1
fi

echo ""
echo "🔧 Step 2: Configure Authentication Methods"
echo "=========================================="
echo "In your Privy Console, enable the following:"
echo ""
echo "Social Logins:"
echo "- GitHub (configure OAuth app)"
echo "- Google (configure OAuth credentials)"
echo "- LinkedIn (configure OAuth app)"
echo ""
echo "Web3 Wallets:"
echo "- MetaMask"
echo "- Rainbow"
echo "- WalletConnect"
echo "- Coinbase Wallet"
echo "- Embedded Wallets (Create on login)"
echo ""

read -p "Have you configured these authentication methods? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please configure the authentication methods and try again."
    exit 1
fi

echo ""
echo "🔧 Step 3: Update Environment Variables"
echo "====================================="

# Check if VITE_PRIVY_APP_ID already exists
if grep -q "VITE_PRIVY_APP_ID" .env.local; then
    echo "Updating existing VITE_PRIVY_APP_ID..."
    sed -i "s/VITE_PRIVY_APP_ID=.*/VITE_PRIVY_APP_ID=$PRIVY_APP_ID/" .env.local
else
    echo "Adding VITE_PRIVY_APP_ID..."
    echo "" >> .env.local
    echo "# Privy Web3 Authentication" >> .env.local
    echo "VITE_PRIVY_APP_ID=$PRIVY_APP_ID" >> .env.local
fi

echo "✅ Environment variables updated"

echo ""
echo "🔧 Step 4: Run Database Migration"
echo "================================"

# Check if Supabase is running
if ! supabase status > /dev/null 2>&1; then
    echo "❌ Supabase is not running. Please start it first:"
    echo "   supabase start"
    exit 1
fi

echo "Running database migration..."
supabase db push

echo "✅ Database migration completed"

echo ""
echo "🔧 Step 5: Test the Integration"
echo "=============================="
echo "1. Start your development server:"
echo "   npm run dev:local"
echo ""
echo "2. Open your browser and go to http://localhost:8080"
echo ""
echo "3. Test the authentication:"
echo "   - Try signing in with GitHub/Google/LinkedIn"
echo "   - Try connecting with a Web3 wallet (MetaMask, Rainbow, etc.)"
echo ""

read -p "Would you like to start the development server now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting development server..."
    npm run dev:local
else
    echo ""
    echo "✅ Privy setup completed!"
    echo ""
    echo "Next steps:"
    echo "1. Run: npm run dev:local"
    echo "2. Test authentication methods"
    echo "3. Check the documentation: docs/PRIVY_INTEGRATION.md"
    echo ""
    echo "For support, see: docs/PRIVY_INTEGRATION.md#troubleshooting"
fi 