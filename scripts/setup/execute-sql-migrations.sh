#!/bin/bash
###
# @file execute-sql-migrations.sh
# @description Execute all pending SQL migrations via psql CLI
# @architecture Reference: Part 2 - Database & Data Flow
#
# This script executes SQL files via psql using the Supabase pooler connection
# NO MANUAL STEPS - Complete automation
#
# Usage: ./scripts/setup/execute-sql-migrations.sh
###

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database connection (using pooler for external access)
export PGHOST="aws-0-us-east-1.pooler.supabase.com"
export PGPORT="6543"
export PGUSER="postgres"
export PGDATABASE="postgres"
export PGPASSWORD="my-first-love"

echo "🚀 Executing SQL Migrations"
echo "============================"
echo "Host: $PGHOST:$PGPORT"
echo "Database: $PGDATABASE"
echo ""

# SQL files to execute (in order)
declare -a SQL_FILES=(
    "packages/database/migrate-clerkid-to-authid.sql:Optional - Migrate clerkId to authId"
    "packages/database/supabase-storage-setup.sql:Required - Storage RLS policies"
    "packages/database/supabase-realtime-setup.sql:Required - Realtime RLS policies"
)

# Track success/failure
TOTAL=0
SUCCESS=0
FAILED=0
SKIPPED=0

# Execute each SQL file
for entry in "${SQL_FILES[@]}"; do
    IFS=':' read -r file description <<< "$entry"
    TOTAL=$((TOTAL + 1))

    echo -e "${YELLOW}→${NC} Executing: $description"
    echo -e "  File: $file"

    if [ ! -f "$file" ]; then
        echo -e "  ${RED}❌ File not found: $file${NC}"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi

    # Execute SQL file
    if psql -v ON_ERROR_STOP=1 -f "$file" 2>&1 | tee /tmp/psql-output.log; then
        echo -e "  ${GREEN}✓ Success${NC}"
        SUCCESS=$((SUCCESS + 1))
    else
        # Check if error is due to "already exists"
        if grep -q "already exists" /tmp/psql-output.log; then
            echo -e "  ${YELLOW}⚠️  Already applied (skipped)${NC}"
            SKIPPED=$((SKIPPED + 1))
        else
            echo -e "  ${RED}❌ Failed${NC}"
            FAILED=$((FAILED + 1))
        fi
    fi

    echo ""
done

# Summary
echo "============================"
echo "Summary:"
echo -e "  ${GREEN}✓ Success: $SUCCESS${NC}"
echo -e "  ${YELLOW}⚠️  Skipped: $SKIPPED${NC}"
echo -e "  ${RED}❌ Failed: $FAILED${NC}"
echo "  Total: $TOTAL"
echo ""

if [ $FAILED -gt 0 ]; then
    echo -e "${RED}❌ Some migrations failed${NC}"
    exit 1
else
    echo -e "${GREEN}✅ All migrations executed successfully${NC}"
    exit 0
fi
