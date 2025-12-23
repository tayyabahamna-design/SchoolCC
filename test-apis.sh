#!/bin/bash

# API Testing Script for School Command Center
# Run this after starting your server to test all new endpoints

BASE_URL="http://localhost:5000"

echo "========================================="
echo "School Command Center - API Test Suite"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_count=0
pass_count=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4

    test_count=$((test_count + 1))
    echo -e "${YELLOW}Test $test_count: $description${NC}"
    echo "  Method: $method"
    echo "  Endpoint: $endpoint"

    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    elif [ "$method" == "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    elif [ "$method" == "PATCH" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    elif [ "$method" == "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL$endpoint")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo -e "  ${GREEN}✓ PASS${NC} (HTTP $http_code)"
        pass_count=$((pass_count + 1))
    else
        echo -e "  ${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "  Response: $body"
    fi
    echo ""
}

# 1. VISIT LOGS TESTS
echo "=== VISIT LOGS ==="
test_endpoint "POST" "/api/visits" \
    "Create visit log" \
    '{
        "schoolId": "test-school-1",
        "schoolName": "Test School",
        "aeoId": "aeo-1",
        "aeoName": "Ahmed Khan",
        "visitStartTime": "2025-12-23T10:00:00Z",
        "isActive": true
    }'

test_endpoint "GET" "/api/visits/active/test-school-1" \
    "Get active visit for school"

test_endpoint "GET" "/api/visits/history/test-school-1" \
    "Get visit history"

test_endpoint "GET" "/api/visits/latest/test-school-1" \
    "Get latest visit"

# 2. ANNOUNCEMENTS TESTS
echo "=== ANNOUNCEMENTS ==="
test_endpoint "POST" "/api/announcements" \
    "Create announcement" \
    '{
        "message": "District meeting on Friday at 2 PM",
        "createdBy": "deo-1",
        "createdByName": "Sara Ahmed",
        "createdByRole": "DEO",
        "priority": "high",
        "isActive": true
    }'

test_endpoint "GET" "/api/announcements" \
    "Get active announcements"

# 3. ALBUMS TESTS
echo "=== SCHOOL ALBUMS ==="
test_endpoint "POST" "/api/albums" \
    "Create album" \
    '{
        "schoolId": "test-school-1",
        "schoolName": "Test School",
        "title": "Plantation Day",
        "description": "Tree plantation activity",
        "createdBy": "user-1",
        "createdByName": "Ali Raza",
        "createdByRole": "DEO",
        "isGlobalBroadcast": true
    }'

test_endpoint "GET" "/api/albums/broadcasts/all" \
    "Get global broadcasts"

# Note: For photo/comment/reaction tests, we'd need actual album IDs from above
# These are skipped in automated test but can be tested manually

# 4. EXPORT TESTS
echo "=== DATA EXPORTS ==="
test_endpoint "GET" "/api/export/schools/excel" \
    "Excel export (returns binary data)"

echo ""
echo "========================================="
echo "Test Results"
echo "========================================="
echo "Total Tests: $test_count"
echo -e "Passed: ${GREEN}$pass_count${NC}"
echo -e "Failed: ${RED}$((test_count - pass_count))${NC}"
echo ""

if [ $pass_count -eq $test_count ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Check the output above.${NC}"
    exit 1
fi
