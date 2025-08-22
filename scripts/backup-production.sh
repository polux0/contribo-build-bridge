#!/bin/bash

# Production Backup Script
# This script creates backups of the production database before pushing changes
# Usage: ./scripts/backup-production.sh [backup_name]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="${1:-production_backup_${TIMESTAMP}}"
BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.sql"
LOG_FILE="${BACKUP_DIR}/${BACKUP_NAME}.log"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo -e "${BLUE}🚀 Starting Production Backup${NC}"
echo -e "${BLUE}Timestamp: ${TIMESTAMP}${NC}"
echo -e "${BLUE}Backup Name: ${BACKUP_NAME}${NC}"
echo -e "${BLUE}Backup File: ${BACKUP_FILE}${NC}"
echo ""

# Function to log messages
log_message() {
    echo -e "$1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Function to check if Supabase CLI is linked to production
check_production_link() {
    log_message "${YELLOW}🔗 Checking Supabase production link...${NC}"
    
    # Check if we can get production database URL from linked project
    if ! supabase status --output json | jq -r '.linked_project.db_url' 2>/dev/null | grep -q "supabase.co"; then
        log_message "${RED}❌ Error: Not linked to production Supabase project${NC}"
        log_message "${YELLOW}💡 Run: supabase link --project-ref YOUR_PROJECT_REF${NC}"
        exit 1
    fi
    
    log_message "${GREEN}✅ Successfully linked to production${NC}"
}

# Function to create database backup
create_database_backup() {
    log_message "${YELLOW}🗄️ Creating database backup...${NC}"
    
    # Get production database URL
    DB_URL=$(supabase status --output json | jq -r '.linked_project.db_url')
    
    if [ -z "$DB_URL" ] || [ "$DB_URL" = "null" ]; then
        log_message "${RED}❌ Error: Could not get production database URL${NC}"
        exit 1
    fi
    
    log_message "${BLUE}📊 Database URL: ${DB_URL}${NC}"
    
    # Create backup using pg_dump
    log_message "${YELLOW}📦 Running pg_dump...${NC}"
    
    if pg_dump "$DB_URL" \
        --verbose \
        --clean \
        --if-exists \
        --no-owner \
        --no-privileges \
        --schema=public \
        --schema=auth \
        --schema=storage \
        --file="$BACKUP_FILE" 2>> "$LOG_FILE"; then
        
        log_message "${GREEN}✅ Database backup created successfully${NC}"
        log_message "${BLUE}📁 Backup file: ${BACKUP_FILE}${NC}"
        
        # Get file size
        FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        log_message "${BLUE}📏 Backup size: ${FILE_SIZE}${NC}"
    else
        log_message "${RED}❌ Error: Database backup failed${NC}"
        log_message "${YELLOW}📋 Check log file: ${LOG_FILE}${NC}"
        exit 1
    fi
}

# Function to create schema-only backup
create_schema_backup() {
    log_message "${YELLOW}🏗️ Creating schema-only backup...${NC}"
    
    SCHEMA_BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}_schema_only.sql"
    
    # Get production database URL
    DB_URL=$(supabase status --output json | jq -r '.linked_project.db_url')
    
    if pg_dump "$DB_URL" \
        --verbose \
        --clean \
        --if-exists \
        --no-owner \
        --no-privileges \
        --schema-only \
        --schema=public \
        --schema=auth \
        --schema=storage \
        --file="$SCHEMA_BACKUP_FILE" 2>> "$LOG_FILE"; then
        
        log_message "${GREEN}✅ Schema backup created successfully${NC}"
        log_message "${BLUE}📁 Schema backup: ${SCHEMA_BACKUP_FILE}${NC}"
    else
        log_message "${RED}❌ Error: Schema backup failed${NC}"
        log_message "${YELLOW}📋 Check log file: ${LOG_FILE}${NC}"
    fi
}

# Function to create Supabase migration backup
create_migration_backup() {
    log_message "${YELLOW}📝 Creating migration backup...${NC}"
    
    MIGRATION_BACKUP_DIR="${BACKUP_DIR}/${BACKUP_NAME}_migrations"
    mkdir -p "$MIGRATION_BACKUP_DIR"
    
    # Backup current migration files
    if [ -d "supabase/migrations" ]; then
        cp -r supabase/migrations/* "$MIGRATION_BACKUP_DIR/"
        log_message "${GREEN}✅ Migration files backed up${NC}"
        log_message "${BLUE}📁 Migration backup: ${MIGRATION_BACKUP_DIR}${NC}"
    else
        log_message "${YELLOW}⚠️ No migrations directory found${NC}"
    fi
}

# Function to create environment backup
create_env_backup() {
    log_message "${YELLOW}⚙️ Creating environment backup...${NC}"
    
    ENV_BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}_env.txt"
    
    # Backup current environment (without sensitive data)
    {
        echo "# Environment Configuration Backup"
        echo "# Generated: $(date)"
        echo ""
        echo "# Supabase Configuration"
        echo "VITE_SUPABASE_URL=$(grep VITE_SUPABASE_URL .env.local 2>/dev/null || echo "NOT_SET")"
        echo "VITE_ENV=$(grep VITE_ENV .env.local 2>/dev/null || echo "NOT_SET")"
        echo "VITE_APP_URL=$(grep VITE_APP_URL .env.local 2>/dev/null || echo "NOT_SET")"
        echo ""
        echo "# OAuth Configuration (Client IDs only)"
        echo "SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=$(grep SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID .env.local 2>/dev/null | cut -d'=' -f2 || echo "NOT_SET")"
        echo "SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=$(grep SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID .env.local 2>/dev/null | cut -d'=' -f2 || echo "NOT_SET")"
        echo "SUPABASE_AUTH_EXTERNAL_LINKEDIN_CLIENT_ID=$(grep SUPABASE_AUTH_EXTERNAL_LINKEDIN_CLIENT_ID .env.local 2>/dev/null | cut -d'=' -f2 || echo "NOT_SET")"
        echo ""
        echo "# Analytics Configuration"
        echo "VITE_PLAUSIBLE_DOMAIN=$(grep VITE_PLAUSIBLE_DOMAIN .env.local 2>/dev/null || echo "NOT_SET")"
        echo "VITE_VERCEL_ANALYTICS_ID=$(grep VITE_VERCEL_ANALYTICS_ID .env.local 2>/dev/null || echo "NOT_SET")"
    } > "$ENV_BACKUP_FILE"
    
    log_message "${GREEN}✅ Environment backup created${NC}"
    log_message "${BLUE}📁 Environment backup: ${ENV_BACKUP_FILE}${NC}"
}

# Function to create backup summary
create_backup_summary() {
    log_message "${YELLOW}📋 Creating backup summary...${NC}"
    
    SUMMARY_FILE="${BACKUP_DIR}/${BACKUP_NAME}_summary.txt"
    
    {
        echo "=== PRODUCTION BACKUP SUMMARY ==="
        echo "Backup Name: $BACKUP_NAME"
        echo "Timestamp: $TIMESTAMP"
        echo "Generated: $(date)"
        echo ""
        echo "=== BACKUP FILES ==="
        echo "Database Backup: $BACKUP_FILE"
        echo "Schema Backup: ${BACKUP_DIR}/${BACKUP_NAME}_schema_only.sql"
        echo "Migration Backup: ${BACKUP_DIR}/${BACKUP_NAME}_migrations/"
        echo "Environment Backup: ${BACKUP_DIR}/${BACKUP_NAME}_env.txt"
        echo "Log File: $LOG_FILE"
        echo ""
        echo "=== FILE SIZES ==="
        if [ -f "$BACKUP_FILE" ]; then
            echo "Database: $(du -h "$BACKUP_FILE" | cut -f1)"
        fi
        if [ -f "${BACKUP_DIR}/${BACKUP_NAME}_schema_only.sql" ]; then
            echo "Schema: $(du -h "${BACKUP_DIR}/${BACKUP_NAME}_schema_only.sql" | cut -f1)"
        fi
        echo ""
        echo "=== NEXT STEPS ==="
        echo "1. Review backup files"
        echo "2. Test migrations locally"
        echo "3. Push to production: supabase db push --linked"
        echo "4. Verify production after deployment"
        echo ""
        echo "=== ROLLBACK INSTRUCTIONS ==="
        echo "If rollback is needed:"
        echo "1. Use schema backup to restore structure"
        echo "2. Use database backup to restore data"
        echo "3. Check log file for any issues"
    } > "$SUMMARY_FILE"
    
    log_message "${GREEN}✅ Backup summary created${NC}"
    log_message "${BLUE}📁 Summary: ${SUMMARY_FILE}${NC}"
}

# Function to validate backup
validate_backup() {
    log_message "${YELLOW}🔍 Validating backup...${NC}"
    
    if [ -f "$BACKUP_FILE" ]; then
        # Check if backup file is not empty
        if [ -s "$BACKUP_FILE" ]; then
            log_message "${GREEN}✅ Backup file is valid and not empty${NC}"
            
            # Check for key tables in backup
            if grep -q "CREATE TABLE.*profiles" "$BACKUP_FILE"; then
                log_message "${GREEN}✅ Profiles table found in backup${NC}"
            else
                log_message "${YELLOW}⚠️ Profiles table not found in backup${NC}"
            fi
            
            if grep -q "CREATE TABLE.*opportunities" "$BACKUP_FILE"; then
                log_message "${GREEN}✅ Opportunities table found in backup${NC}"
            else
                log_message "${YELLOW}⚠️ Opportunities table not found in backup${NC}"
            fi
        else
            log_message "${RED}❌ Error: Backup file is empty${NC}"
            exit 1
        fi
    else
        log_message "${RED}❌ Error: Backup file not found${NC}"
        exit 1
    fi
}

# Main execution
main() {
    log_message "${BLUE}🚀 Starting Production Backup Process${NC}"
    log_message "${BLUE}=====================================${NC}"
    
    # Check prerequisites
    check_production_link
    
    # Create backups
    create_database_backup
    create_schema_backup
    create_migration_backup
    create_env_backup
    
    # Validate and summarize
    validate_backup
    create_backup_summary
    
    log_message "${GREEN}🎉 Backup completed successfully!${NC}"
    log_message "${BLUE}📁 All backup files saved to: ${BACKUP_DIR}${NC}"
    log_message "${YELLOW}💡 Review the backup summary before proceeding${NC}"
    echo ""
    log_message "${BLUE}📋 Backup Summary:${NC}"
    cat "${BACKUP_DIR}/${BACKUP_NAME}_summary.txt"
}

# Run main function
main "$@" 