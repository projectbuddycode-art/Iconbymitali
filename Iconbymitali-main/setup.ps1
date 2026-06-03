# Icon by Mitali - Backend Setup Script (PowerShell)
# Runs database migration, configures environment, and starts dev server

Write-Host "🚀 Icon by Mitali - Backend Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$SUPABASE_URL = "https://apmiabucenklyfaewoun.supabase.co"
$SUPABASE_KEY = "sb_publishable_PgEMJTkIHOrGnfxi6pMJBg_QgJtbVzu"
$PROJECT_ROOT = Get-Location

# Step 1: Check Node.js
Write-Host "Step 1: Checking Node.js..." -ForegroundColor Blue
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Create .env.local
Write-Host "Step 2: Creating .env.local..." -ForegroundColor Blue

$envFile = "$PROJECT_ROOT\.env.local"
$envContent = @"
# Supabase Configuration
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_KEY

# API Configuration
VITE_API_URL=$SUPABASE_URL/rest/v1
VITE_API_KEY=$SUPABASE_KEY

# Optional: Admin key (for server-side operations)
# Get this from Supabase Settings → API → service_role (KEEP SECRET!)
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
"@

if (Test-Path $envFile) {
    Write-Host "⚠️  .env.local already exists" -ForegroundColor Yellow
} else {
    Set-Content -Path $envFile -Value $envContent -Force
    Write-Host "✅ .env.local created" -ForegroundColor Green
}
Write-Host ""

# Step 3: Install dependencies
Write-Host "Step 3: Installing dependencies..." -ForegroundColor Blue

if (Test-Path "$PROJECT_ROOT\package.json") {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "❌ npm install failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️  package.json not found" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Database Migration
Write-Host "Step 4: Database Migration (Manual Step)" -ForegroundColor Blue
Write-Host ""
Write-Host "⚠️  Please execute the database migration manually:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to Supabase dashboard: https://app.supabase.com" -ForegroundColor White
Write-Host "2. Select your 'Icon by Mitali' project" -ForegroundColor White
Write-Host "3. Click 'SQL Editor' (left sidebar)" -ForegroundColor White
Write-Host "4. Click 'New Query' (top right)" -ForegroundColor White
Write-Host "5. Open and copy contents of: MIGRATION_COLLECTION_FK.sql" -ForegroundColor White
Write-Host "6. Paste into Supabase SQL Editor" -ForegroundColor White
Write-Host "7. Click 'RUN' button" -ForegroundColor White
Write-Host "8. Wait for completion (~7 queries)" -ForegroundColor White
Write-Host ""

$response = Read-Host "Press ENTER after migration is complete (or type 'skip' to skip)"
Write-Host ""

# Step 5: Verify setup
Write-Host "Step 5: Verifying setup..." -ForegroundColor Blue
Write-Host ""

# Check .env.local
if (Test-Path $envFile) {
    $content = Get-Content $envFile
    if ($content -match "VITE_SUPABASE_URL") {
        Write-Host "✅ Environment variables configured" -ForegroundColor Green
    }
}

# Check node_modules
if (Test-Path "$PROJECT_ROOT\node_modules") {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Dependencies not installed" -ForegroundColor Red
}

# Check migration file
if (Test-Path "$PROJECT_ROOT\MIGRATION_COLLECTION_FK.sql") {
    Write-Host "✅ Migration file found" -ForegroundColor Green
} else {
    Write-Host "❌ Migration file not found" -ForegroundColor Red
}

Write-Host ""

# Step 6: Start development server
Write-Host "Step 6: Ready to start development server" -ForegroundColor Blue
Write-Host ""
Write-Host "Starting: npm run dev" -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:5173" -ForegroundColor White
Write-Host ""

Read-Host "Press ENTER to start"

npm run dev
