#!/bin/bash

# Simple Production Backup Script
# This script creates backups of the production database
# Usage: ./scripts/backup-production-simple.sh [backup_name]

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

# Production project details
PROJECT_REF="mlpquscmwjvgamprxlgl"
DB_HOST="db.${PROJECT_REF}.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo -e "${BLUE}🚀 Starting Production Backup${NC}"
echo -e "${BLUE}Timestamp: ${TIMESTAMP}${NC}"
echo -e "${BLUE}Backup Name: ${BACKUP_NAME}${NC}"
echo -e "${BLUE}Backup File: ${BACKUP_FILE}${NC}"
echo -e "${BLUE}Project: ${PROJECT_REF}${NC}"
echo ""

# Function to log messages
log_message() {
    echo -e "$1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Function to get database password
get_db_password() {
    log_message "${YELLOW}🔐 Getting database password...${NC}"
    
    # Get the database password from Supabase CLI
    DB_PASSWORD=$(supabase projects api-keys --project-ref $PROJECT_REF | grep "service_role" | awk '{print $2}')
    
    if [ -z "$DB_PASSWORD" ]; then
        log_message "${RED}❌ Error: Could not get database password${NC}"
        exit 1
    fi
    
    log_message "${GREEN}✅ Database password retrieved${NC}"
}

# Function to create database backup
create_database_backup() {
    log_message "${YELLOW}🗄️ Creating database backup...${NC}"
    
    # Construct database URL
    DB_URL="postgresql://postgres:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
    
    log_message "${BLUE}📊 Database URL: postgresql://postgres:***@${DB_HOST}:${DB_PORT}/${DB_NAME}${NC}"
    
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
    DB_URL="postgresql://postgres:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
    
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

# Function to create backup summary
create_backup_summary() {
    log_message "${YELLOW}📋 Creating backup summary...${NC}"
    
    SUMMARY_FILE="${BACKUP_DIR}/${BACKUP_NAME}_summary.txt"
    
    {
        echo "=== PRODUCTION BACKUP SUMMARY ==="
        echo "Backup Name: $BACKUP_NAME"
        echo "Timestamp: $TIMESTAMP"
        echo "Generated: $(date)"
        echo "Project: $PROJECT_REF"
        echo ""
        echo "=== BACKUP FILES ==="
        echo "Database Backup: $BACKUP_FILE"
        echo "Schema Backup: ${BACKUP_DIR}/${BACKUP_NAME}_schema_only.sql"
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
        echo "=== TABLES FOUND ==="
        if [ -f "$BACKUP_FILE" ]; then
            echo "Tables in backup:"
            grep -E "CREATE TABLE.*public\." "$BACKUP_FILE" | sed 's/CREATE TABLE //' | sed 's/ (//' || echo "No tables found"
        fi
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
            
            # Count total tables
            TABLE_COUNT=$(grep -c "CREATE TABLE.*public\." "$BACKUP_FILE" || echo "0")
            log_message "${BLUE}📊 Total tables found: ${TABLE_COUNT}${NC}"
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
    
    # Get database password
    get_db_password
    
    # Create backups
    create_database_backup
    create_schema_backup
    
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