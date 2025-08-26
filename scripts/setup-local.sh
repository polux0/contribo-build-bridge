#!/bin/bash

echo "🚀 Setting up local development environment for Contribo..."

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Create .env.local from example
if [ -f "env.example" ]; then
    cp env.example .env.local
    echo "✅ Created .env.local from env.example"
else
    echo "❌ env.example not found. Please create it first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your Supabase credentials"
echo "2. Run 'npm run dev:local' to start development server"
echo "3. Open http://localhost:8080 in your browser"
echo ""
echo "📖 See DEVELOPMENT.md for detailed instructions" 