#!/bin/bash

# Test script for the specific user with subscription issues
# Usage: ./scripts/test-user-curl.sh YOUR_FIREBASE_TOKEN

if [ -z "$1" ]; then
    echo "❌ Error: Firebase token required"
    echo "Usage: $0 YOUR_FIREBASE_TOKEN"
    exit 1
fi

FIREBASE_TOKEN="$1"
BASE_URL="http://localhost:3000"  # Change to your deployed URL if testing on production

echo "🔹 Testing specific user fix..."
echo "📧 Email: grupoforte.inmobiliaria@gmail.com"
echo "🆔 Expected UID: fyDdeFgb27ghc5KEyzSb6v4KtVs1"
echo ""

# Test the specific user endpoint
echo "=== RUNNING TEST ENDPOINT ==="
curl -X POST "${BASE_URL}/api/debug/test-specific-user" \
  -H "Authorization: Bearer ${FIREBASE_TOKEN}" \
  -H "Content-Type: application/json" \
  -s | jq '.' || echo "❌ Failed to parse JSON response"

echo ""
echo "🏁 Test completed"
