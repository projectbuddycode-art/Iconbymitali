#!/bin/bash

# Icon by Mitali - Complete Backend Setup Script
# This script sets up the database, environment, and backend

echo "🚀 Icon by Mitali - Backend Setup"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SUPABASE_URL="https://apmiabucenklyfaewoun.supabase.co"
SUPABASE_KEY="sb_publishable_PgEMJTkIHOrGnfxi6pMJBg_QgJtbVzu"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Step 1: Check Node.js
echo -e "${BLUE}Step 1: Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"
echo ""

# Step 2: Create .env.local
echo -e "${BLUE}Step 2: Creating .env.local...${NC}"
ENV_FILE="$PROJECT_ROOT/.env.local"

if [ -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  .env.local already exists${NC}"
else
    cat > "$ENV_FILE" << EOF
# Supabase Configuration
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_KEY

# API Configuration
VITE_API_URL=${SUPABASE_URL}/rest/v1
VITE_API_KEY=$SUPABASE_KEY

# Optional: Admin key (for server-side operations)
# Get this from Supabase Settings → API → service_role (KEEP SECRET!)
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
EOF
    echo -e "${GREEN}✅ .env.local created${NC}"
fi
echo ""

# Step 3: Install dependencies
echo -e "${BLUE}Step 3: Installing dependencies...${NC}"
if [ -f "$PROJECT_ROOT/package.json" ]; then
    cd "$PROJECT_ROOT"
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencies installed${NC}"
    else
        echo -e "${RED}❌ npm install failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  package.json not found${NC}"
fi
echo ""

# Step 4: Run database migration
echo -e "${BLUE}Step 4: Database Migration${NC}"
echo "⚠️  Manual step required:"
echo ""
echo "1. Go to: https://app.supabase.com"
echo "2. Select your 'Icon by Mitali' project"
echo "3. Click 'SQL Editor' (left sidebar)"
echo "4. Click 'New Query' (top right)"
echo "5. Open file: MIGRATION_COLLECTION_FK.sql"
echo "6. Copy entire content"
echo "7. Paste into Supabase SQL Editor"
echo "8. Click 'RUN' button"
echo "9. Wait for completion (should see ~7 queries executed)"
echo ""
read -p "Press ENTER after migration is complete: "
echo ""

# Step 5: Verify setup
echo -e "${BLUE}Step 5: Verifying setup...${NC}"
echo ""

# Check .env.local
if grep -q "VITE_SUPABASE_URL" "$ENV_FILE"; then
    echo -e "${GREEN}✅ Environment variables configured${NC}"
else
    echo -e "${RED}❌ Environment variables missing${NC}"
fi

# Check dependencies
if [ -d "$PROJECT_ROOT/node_modules" ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ Dependencies not installed${NC}"
fi

# Check migration file
if [ -f "$PROJECT_ROOT/MIGRATION_COLLECTION_FK.sql" ]; then
    echo -e "${GREEN}✅ Migration file found${NC}"
else
    echo -e "${RED}❌ Migration file not found${NC}"
fi

echo ""

# Step 6: Ready to start
echo -e "${BLUE}Step 6: Starting development server...${NC}"
echo ""
echo "Ready to start? Press ENTER to run: npm run dev"
read -p ""

cd "$PROJECT_ROOT"
npm run dev
