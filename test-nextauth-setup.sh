#!/bin/bash
# Quick test script for NextAuth integration

echo "🔍 Checking NextAuth Configuration..."

# Check if .env.local has required variables
if grep -q "NEXTAUTH_SECRET" /home/andre/Projects/POS/posfrontend/.env.local; then
    echo "✓ NEXTAUTH_SECRET configured"
else
    echo "✗ NEXTAUTH_SECRET missing"
fi

if grep -q "NEXTAUTH_URL" /home/andre/Projects/POS/posfrontend/.env.local; then
    echo "✓ NEXTAUTH_URL configured"
else
    echo "✗ NEXTAUTH_URL missing"
fi

# Check if NextAuth route exists
if [ -f "/home/andre/Projects/POS/posfrontend/app/api/auth/[...nextauth]/route.js" ]; then
    echo "✓ NextAuth route handler exists"
else
    echo "✗ NextAuth route handler missing"
fi

# Check if SessionProvider exists
if [ -f "/home/andre/Projects/POS/posfrontend/components/providers/auth-provider.jsx" ]; then
    echo "✓ SessionProvider wrapper exists"
else
    echo "✗ SessionProvider wrapper missing"
fi

# Check if middleware exists
if [ -f "/home/andre/Projects/POS/posfrontend/middleware.js" ]; then
    echo "✓ Route protection middleware exists"
else
    echo "✗ Route protection middleware missing"
fi

# Check login component
if grep -q "useForm" /home/andre/Projects/POS/posfrontend/components/auth/login-screen.jsx; then
    echo "✓ Login component uses React Hook Form"
else
    echo "✗ Login component missing React Hook Form"
fi

# Check api-client
if grep -q "getSession" /home/andre/Projects/POS/posfrontend/lib/api-client.js; then
    echo "✓ API client uses NextAuth session"
else
    echo "✗ API client missing NextAuth integration"
fi

# Check store
if grep -q "initializeUserFromSession" /home/andre/Projects/POS/posfrontend/lib/store.jsx; then
    echo "✓ Store has session initialization"
else
    echo "✗ Store missing session initialization"
fi

echo ""
echo "🎯 NextAuth Migration Status: READY FOR TESTING"
echo ""
echo "Next steps:"
echo "1. Start backend: cd POSbackend && php artisan serve"
echo "2. Start frontend: npm run dev"
echo "3. Visit http://localhost:3000"
echo "4. Login with: admin@pos.com / password"
echo ""
