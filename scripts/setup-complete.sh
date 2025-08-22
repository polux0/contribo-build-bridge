#!/bin/bash

echo "🚀 Complete Local Development Setup for Contribo"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed. Please install it first."
    echo "Install with: yay -S supabase-bin"
    exit 1
fi

print_success "All prerequisites are installed"

# Step 1: Setup environment
print_status "Setting up environment variables..."

if [ -f ".env.local" ]; then
    print_warning ".env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

if [ -f "env.example" ]; then
    cp env.example .env.local
    print_success "Created .env.local from env.example"
else
    print_error "env.example not found. Please create it first."
    exit 1
fi

# Step 2: Install dependencies
print_status "Installing dependencies..."

if [ ! -d "node_modules" ]; then
    npm install
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi

# Step 3: Start Supabase
print_status "Starting local Supabase..."

# Check if Supabase is already running
if supabase status &> /dev/null; then
    print_success "Supabase is already running"
else
    print_status "Starting Supabase (this may take a few minutes)..."
    supabase start
    
    if [ $? -eq 0 ]; then
        print_success "Supabase started successfully"
    else
        print_error "Failed to start Supabase"
        exit 1
    fi
fi

# Step 4: Get Supabase credentials and update .env.local
print_status "Updating environment with local Supabase credentials..."

# Extract the anon key from supabase status
ANON_KEY=$(supabase status 2>/dev/null | grep "anon key:" | awk '{print $3}')

if [ ! -z "$ANON_KEY" ]; then
    # Update .env.local with local Supabase URL and anon key
    sed -i "s|VITE_SUPABASE_URL=.*|VITE_SUPABASE_URL=http://127.0.0.1:54321|" .env.local
    sed -i "s|VITE_SUPABASE_PUBLISHABLE_KEY=.*|VITE_SUPABASE_PUBLISHABLE_KEY=$ANON_KEY|" .env.local
    print_success "Updated .env.local with local Supabase credentials"
else
    print_warning "Could not extract anon key. Please update .env.local manually:"
    echo "VITE_SUPABASE_URL=http://127.0.0.1:54321"
    echo "VITE_SUPABASE_PUBLISHABLE_KEY=<your_anon_key>"
fi

# Step 5: Display final information
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
print_success "Local development environment is ready!"
echo ""
echo "🔗 Local URLs:"
echo "  App:          http://127.0.0.1:8080"
echo "  Supabase API: http://127.0.0.1:54321"
echo "  Supabase Studio: http://127.0.0.1:54323"
echo "  Email Testing: http://127.0.0.1:54324"
echo ""
echo "📝 Next Steps:"
echo "1. Set up OAuth providers (optional):"
echo "   - Run: ./scripts/setup-oauth.sh"
echo "   - Follow: OAUTH_SETUP.md"
echo ""
echo "2. Start development server:"
echo "   npm run dev:local"
echo ""
echo "3. Test the application:"
echo "   - Open http://127.0.0.1:8080"
echo "   - Check Supabase Studio at http://127.0.0.1:54323"
echo ""
echo "📚 Documentation:"
echo "  - DEVELOPMENT.md - Detailed development guide"
echo "  - ENVIRONMENT.md - Environment configuration"
echo "  - OAUTH_SETUP.md - OAuth provider setup"
echo ""
print_success "Happy coding! 🚀" 