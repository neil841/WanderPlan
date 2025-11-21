#!/bin/bash

# Runtime Validation Script for WanderPlan
# Tests actual functionality, not just build-time checks

echo "======================================"
echo "WanderPlan Runtime Validation"
echo "======================================"
echo ""

BASE_URL="http://localhost:3001"
PASS_COUNT=0
FAIL_COUNT=0

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASS_COUNT++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAIL_COUNT++))
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Test 1: Dev server is running
echo "1. Testing dev server..."
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" | grep -q "200\|404\|302"; then
    pass "Dev server is accessible"
else
    fail "Dev server is NOT accessible at $BASE_URL"
fi
echo ""

# Test 2: Database connection
echo "2. Testing database connection..."
if npx prisma db execute --stdin <<< "SELECT 1;" 2>&1 | grep -q "SELECT"; then
    pass "Database connection working"
else
    fail "Database connection FAILED"
fi
echo ""

# Test 3: Homepage loads
echo "3. Testing homepage..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
if [ "$HTTP_CODE" = "200" ]; then
    pass "Homepage loads successfully (HTTP $HTTP_CODE)"
else
    warn "Homepage returned HTTP $HTTP_CODE (expected 200)"
fi
echo ""

# Test 4: Login page loads
echo "4. Testing login page..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/login")
if [ "$HTTP_CODE" = "200" ]; then
    pass "Login page loads (HTTP $HTTP_CODE)"
else
    fail "Login page FAILED (HTTP $HTTP_CODE)"
fi
echo ""

# Test 5: API health check
echo "5. Testing API endpoints..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/trips")
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "200" ]; then
    pass "Trips API responds (HTTP $HTTP_CODE - auth required)"
else
    fail "Trips API FAILED (HTTP $HTTP_CODE)"
fi
echo ""

# Test 6: Check for critical missing env vars
echo "6. Checking environment variables..."
MISSING_VARS=()

if ! grep -q "^DATABASE_URL=" .env; then
    MISSING_VARS+=("DATABASE_URL")
fi

if ! grep -q "^NEXTAUTH_SECRET=" .env; then
    MISSING_VARS+=("NEXTAUTH_SECRET")
fi

if ! grep -q "^NEXTAUTH_URL=" .env; then
    MISSING_VARS+=("NEXTAUTH_URL")
fi

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    pass "All critical env vars present"
else
    fail "Missing env vars: ${MISSING_VARS[*]}"
fi
echo ""

# Test 7: Check optional API keys
echo "7. Checking optional API integrations..."
OPTIONAL_VARS=()

if ! grep -q "^RESEND_API_KEY=" .env || grep -q "^RESEND_API_KEY=$" .env; then
    warn "RESEND_API_KEY not configured (email won't work)"
else
    pass "RESEND_API_KEY configured"
fi

if ! grep -q "^OPENWEATHER_API_KEY=" .env || grep -q "^OPENWEATHER_API_KEY=$" .env; then
    warn "OPENWEATHER_API_KEY not configured (weather won't work)"
else
    pass "OPENWEATHER_API_KEY configured"
fi

if ! grep -q "^FOURSQUARE_API_KEY=" .env || grep -q "^FOURSQUARE_API_KEY=$" .env; then
    warn "FOURSQUARE_API_KEY not configured (POI search limited)"
else
    pass "FOURSQUARE_API_KEY configured"
fi
echo ""

# Test 8: Check for .next build artifacts
echo "8. Checking Next.js build state..."
if [ -d ".next" ]; then
    pass ".next directory exists"
else
    warn ".next directory missing (run dev server once)"
fi
echo ""

# Test 9: Check for node_modules
echo "9. Checking dependencies..."
if [ -d "node_modules" ] && [ -f "node_modules/.package-lock.json" ]; then
    pass "Dependencies installed"
else
    fail "Dependencies NOT installed (run: npm install)"
fi
echo ""

# Test 10: Check Prisma client
echo "10. Checking Prisma client..."
if [ -d "node_modules/.prisma/client" ]; then
    pass "Prisma client generated"
else
    warn "Prisma client missing (run: npx prisma generate)"
fi
echo ""

# Summary
echo "======================================"
echo "Validation Summary"
echo "======================================"
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "${RED}Failed: $FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    echo "App should be functional for basic features."
    echo ""
    echo "Known limitations:"
    echo "- Email verification requires valid RESEND_API_KEY"
    echo "- Weather requires valid OPENWEATHER_API_KEY"
    echo "- Full POI search requires FOURSQUARE_API_KEY"
    exit 0
else
    echo -e "${RED}✗ $FAIL_COUNT critical issues found${NC}"
    echo "App may not function correctly until these are resolved."
    exit 1
fi
