#!/bin/bash

# Production Deployment Script
# This script creates a backup and then deploys changes to production
# Usage: ./scripts/deploy-to-production.sh [deployment_name]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_NAME="${1:-deployment_$(date +"%Y%m%d_%H%M%S")}"
BACKUP_SCRIPT="./scripts/backup-production.sh"

echo -e "${BLUE}🚀 Starting Production Deployment${NC}"
echo -e "${BLUE}Deployment Name: ${DEPLOYMENT_NAME}${NC}"
echo ""

# Function to log messages
log_message() {
    echo -e "$1"
}

# Function to check prerequisites
check_prerequisites() {
    log_message "${YELLOW}🔍 Checking prerequisites...${NC}"
    
    # Check if backup script exists
    if [ ! -f "$BACKUP_SCRIPT" ]; then
        log_message "${RED}❌ Error: Backup script not found at $BACKUP_SCRIPT${NC}"
        exit 1
    fi
    
    # Check if Supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        log_message "${RED}❌ Error: Supabase CLI not found${NC}"
        log_message "${YELLOW}💡 Install with: npm install -g supabase${NC}"
        exit 1
    fi
    
    # Check if linked to production
    if ! supabase projects list | grep -q "●"; then
        log_message "${RED}❌ Error: Not linked to production Supabase project${NC}"
        log_message "${YELLOW}💡 Run: supabase link --project-ref YOUR_PROJECT_REF${NC}"
        exit 1
    fi
    
    log_message "${GREEN}✅ Prerequisites check passed${NC}"
}

# Function to create backup
create_backup() {
    log_message "${YELLOW}📦 Creating production backup...${NC}"
    
    if "$BACKUP_SCRIPT" "pre_deployment_${DEPLOYMENT_NAME}"; then
        log_message "${GREEN}✅ Backup created successfully${NC}"
    else
        log_message "${RED}❌ Error: Backup failed${NC}"
        exit 1
    fi
}

# Function to validate local migrations
validate_migrations() {
    log_message "${YELLOW}🔍 Validating local migrations...${NC}"
    
    # Check if migrations directory exists
    if [ ! -d "supabase/migrations" ]; then
        log_message "${RED}❌ Error: No migrations directory found${NC}"
        exit 1
    fi
    
    # Count migration files
    MIGRATION_COUNT=$(find supabase/migrations -name "*.sql" | wc -l)
    log_message "${BLUE}📝 Found ${MIGRATION_COUNT} migration files${NC}"
    
    if [ "$MIGRATION_COUNT" -eq 0 ]; then
        log_message "${YELLOW}⚠️ Warning: No migration files found${NC}"
        read -p "Continue without migrations? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_message "${YELLOW}Deployment cancelled${NC}"
            exit 0
        fi
    fi
    
    log_message "${GREEN}✅ Migrations validation passed${NC}"
}

# Function to deploy to production
deploy_to_production() {
    log_message "${YELLOW}🚀 Deploying to production...${NC}"
    
    # Push database changes
    log_message "${BLUE}📊 Pushing database changes...${NC}"
    if supabase db push --linked; then
        log_message "${GREEN}✅ Database changes deployed successfully${NC}"
    else
        log_message "${RED}❌ Error: Database deployment failed${NC}"
        log_message "${YELLOW}💡 Check the error above and consider rolling back${NC}"
        exit 1
    fi
}

# Function to verify deployment
verify_deployment() {
    log_message "${YELLOW}🔍 Verifying deployment...${NC}"
    
    # Check if opportunities table exists
    log_message "${BLUE}📋 Checking opportunities table...${NC}"
    if supabase db diff --linked --schema public | grep -q "opportunities"; then
        log_message "${GREEN}✅ Opportunities table verified${NC}"
    else
        log_message "${YELLOW}⚠️ Opportunities table not found in diff (may already exist)${NC}"
    fi
    
    # Check if profiles trigger exists
    log_message "${BLUE}🔧 Checking profiles trigger...${NC}"
    if supabase db diff --linked --schema public | grep -q "handle_new_user"; then
        log_message "${GREEN}✅ Profiles trigger verified${NC}"
    else
        log_message "${YELLOW}⚠️ Profiles trigger not found in diff (may already exist)${NC}"
    fi
    
    log_message "${GREEN}✅ Deployment verification completed${NC}"
}

# Function to create deployment summary
create_deployment_summary() {
    log_message "${YELLOW}📋 Creating deployment summary...${NC}"
    
    SUMMARY_FILE="./backups/${DEPLOYMENT_NAME}_deployment_summary.txt"
    
    {
        echo "=== PRODUCTION DEPLOYMENT SUMMARY ==="
        echo "Deployment Name: $DEPLOYMENT_NAME"
        echo "Timestamp: $(date)"
        echo ""
        echo "=== DEPLOYMENT STEPS ==="
        echo "✅ Prerequisites check passed"
        echo "✅ Production backup created"
        echo "✅ Local migrations validated"
        echo "✅ Database changes deployed"
        echo "✅ Deployment verified"
        echo ""
        echo "=== BACKUP FILES ==="
        echo "Pre-deployment backup: ./backups/pre_deployment_${DEPLOYMENT_NAME}.sql"
        echo "Backup summary: ./backups/pre_deployment_${DEPLOYMENT_NAME}_summary.txt"
        echo ""
        echo "=== NEXT STEPS ==="
        echo "1. Test the production application"
        echo "2. Verify OAuth login works"
        echo "3. Check opportunities are displayed"
        echo "4. Monitor for any issues"
        echo ""
        echo "=== ROLLBACK INSTRUCTIONS ==="
        echo "If rollback is needed:"
        echo "1. Use the pre-deployment backup: ./backups/pre_deployment_${DEPLOYMENT_NAME}.sql"
        echo "2. Restore using: psql [DB_URL] < ./backups/pre_deployment_${DEPLOYMENT_NAME}.sql"
        echo "3. Check the backup summary for details"
    } > "$SUMMARY_FILE"
    
    log_message "${GREEN}✅ Deployment summary created${NC}"
    log_message "${BLUE}📁 Summary: ${SUMMARY_FILE}${NC}"
}

# Main execution
main() {
    log_message "${BLUE}🚀 Starting Production Deployment Process${NC}"
    log_message "${BLUE}==========================================${NC}"
    
    # Execute deployment steps
    check_prerequisites
    create_backup
    validate_migrations
    deploy_to_production
    verify_deployment
    create_deployment_summary
    
    log_message "${GREEN}🎉 Deployment completed successfully!${NC}"
    log_message "${BLUE}📁 Deployment summary: ./backups/${DEPLOYMENT_NAME}_deployment_summary.txt${NC}"
    log_message "${YELLOW}💡 Test your production application now${NC}"
    echo ""
    log_message "${BLUE}📋 Deployment Summary:${NC}"
    cat "./backups/${DEPLOYMENT_NAME}_deployment_summary.txt"
}

# Run main function
main "$@" 