# NextAuth Integration - Complete Testing Guide

## ✅ Implementation Complete

The POS application has been successfully migrated to use NextAuth for authentication with the following architecture:

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Login Screen (React Hook Form)                      │  │
│  │  - useForm() for email/password                      │  │
│  │  - signIn() from NextAuth                            │  │
│  │  - Validation & error handling                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  NextAuth API Route (/api/auth/[...nextauth])       │  │
│  │  - Credentials Provider                              │  │
│  │  - POSTs to Laravel /login                           │  │
│  │  - JWT strategy (24h expiration)                     │  │
│  │  - Session callbacks (user + token)                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Protected Routes (Middleware)                       │  │
│  │  - Protects /pos and /(app)/*                        │  │
│  │  - Redirects unauthenticated to /                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Client (Axios + NextAuth)                       │  │
│  │  - getSession() in request interceptor               │  │
│  │  - Adds Bearer token to Authorization header         │  │
│  │  - 401 handling with redirect to login               │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Laravel Backend (Sanctum)                      │
├─────────────────────────────────────────────────────────────┤
│  POST /login          → Returns { token, user, ... }       │
│  POST /logout         → Clears token                       │
│  GET /protected/*     → Requires Bearer token              │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### 1. Prerequisites

Ensure your environment is set up:

```bash
# Frontend dependencies
cd /home/andre/Projects/POS/posfrontend
npm install

# Verify next-auth is installed
npm list next-auth
npm list react-hook-form
```

### 2. Start the Backend

```bash
cd /home/andre/Projects/POS/POSbackend

# Start Laravel server (port 8001)
php artisan serve --port=8001

# Or use Valet if configured
valet link
```

### 3. Start the Frontend

```bash
cd /home/andre/Projects/POS/posfrontend

# Run development server (port 3000)
npm run dev

# Or with Turbopack for faster builds
npm run dev -- --turbopack
```

### 4. Test Login Flow

Visit http://localhost:3000 and:

1. **See Login Screen**: Shows email/password form with validation
2. **Enter Credentials**: 
   - Email: `admin@pos.com`
   - Password: `password`
3. **Submit Form**: Click "Sign In"
4. **Verify Session**: After redirect to /pos:
   - Open DevTools → Application → Cookies
   - Look for `next-auth.session-token`
   - Session contains: { user, accessToken, expires }
5. **Verify API Call**: Make any API call and check:
   - Network tab → Headers
   - Should see: `Authorization: Bearer {token}`

## 🧪 Testing Scenarios

### ✅ Happy Path: Successful Login

```bash
# Expected behavior:
1. Form submission disabled while loading
2. No errors shown
3. Redirected to /pos after 100ms
4. Session persists on page reload
5. Sidebar shows user name and role from session
6. API requests include Bearer token
```

**Test:**
```bash
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pos.com","password":"password"}'
```

### ❌ Error Path: Invalid Credentials

```bash
# Expected behavior:
1. Form submission allowed
2. Error alert shows "Invalid email or password"
3. User stays on login page
4. Can retry immediately
```

**Test:**
```bash
# Login with wrong password
- Email: admin@pos.com
- Password: wrongpassword

# Should show error and stay on login page
```

### 🔄 Session Persistence

```bash
# Expected behavior:
1. Login successfully
2. Refresh page (F5)
3. Session still valid
4. currentUser data in sidebar
5. Can access /pos without redirect
```

**Test:**
```bash
1. Login
2. Open DevTools → Application → Cookies
3. Copy value of `next-auth.session-token`
4. Reload page
5. Session should still be valid
```

### 🚪 Logout Flow

```bash
# Expected behavior:
1. Click logout button (in sidebar)
2. Session cleared immediately
3. Redirected to login page
4. next-auth.session-token cookie deleted
5. Next API call gets 401
6. Cannot access /pos (middleware redirects)
```

**Test:**
```bash
1. Login successfully
2. Click LogOut icon in sidebar
3. Verify redirect to login
4. Try to access /pos directly
5. Should redirect back to /
```

### 🛡️ Protected Routes

```bash
# Expected behavior:
1. Visit /pos without authentication
2. Immediately redirected to /
3. Cannot access /(app)/* routes
4. Middleware checks token before render
```

**Test:**
```bash
1. Clear cookies or open in incognito
2. Try to visit http://localhost:3000/pos
3. Should redirect to http://localhost:3000
4. Try to visit http://localhost:3000/dashboard
5. Should redirect to http://localhost:3000
```

### 🔌 API Integration

```bash
# Expected behavior:
1. All API calls from authenticated pages include token
2. Token extracted from NextAuth session
3. 401 responses trigger session refresh or redirect
4. Request interceptor automatically adds Bearer header
```

**Test:**
```bash
# In browser console, after login:
const session = await getSession();
console.log(session.accessToken); // Should show token

// Make API call and check network tab:
fetch('/api/products').then(r => r.json()).then(console.log);
// Should include Authorization: Bearer {token} header
```

## 🐛 Debugging

### Check Session Status

```javascript
// In browser console
import { getSession } from 'next-auth/react';
const session = await getSession();
console.log('Session:', session);
console.log('Token:', session?.accessToken);
console.log('User:', session?.user);
```

### Check Store Sync

```javascript
// In browser console
import { usePOSStore } from '@/lib/store';
const state = usePOSStore.getState();
console.log('currentUser:', state.currentUser);
```

### Monitor API Calls

1. Open DevTools → Network tab
2. Filter by XHR/Fetch
3. Look for Bearer token in Authorization header
4. Check response for 401 or 200

### Backend Logs

```bash
cd POSbackend

# Watch logs in real-time
tail -f storage/logs/laravel.log

# Or check specific request
grep -i "POST /login" storage/logs/laravel.log
```

## 🚨 Common Issues & Solutions

### Issue 1: "Invalid email or password" on correct credentials

**Possible Causes:**
- Backend not running or wrong port
- Database not seeded with test user
- CORS not configured properly

**Solution:**
```bash
# Verify backend is running
curl http://127.0.0.1:8001/api/products

# Check database has test user
cd POSbackend
php artisan tinker
>>> App\Models\User::where('email', 'admin@pos.com')->first()

# Run seeder if needed
php artisan db:seed --class=UserSeeder
```

### Issue 2: Session not persisting across page reload

**Possible Causes:**
- NEXTAUTH_SECRET not set or inconsistent
- Cookie domain/SameSite mismatch
- SessionProvider not wrapping app

**Solution:**
```bash
# Verify environment variables
grep NEXTAUTH /home/andre/Projects/POS/posfrontend/.env.local

# Check SessionProvider wraps app
grep -r "SessionProvider" /home/andre/Projects/POS/posfrontend/app/layout.jsx
```

### Issue 3: API calls missing Authorization header

**Possible Causes:**
- api-client not using getSession()
- Session not available in request interceptor
- Bearer token not being extracted

**Solution:**
```javascript
// In api-client.js, verify:
import { getSession } from 'next-auth/react';

// In request interceptor:
const session = await getSession();
if (session?.accessToken) {
  config.headers.Authorization = `Bearer ${session.accessToken}`;
}
```

### Issue 4: Infinite redirect loop after login

**Possible Causes:**
- Redirect URL wrong (/pos instead of /)
- Session not ready before redirect
- Middleware issue

**Solution:**
```javascript
// In login-screen.jsx, verify:
router.push("/pos"); // Should be /pos, not /

// Ensure 100ms delay
await new Promise((resolve) => setTimeout(resolve, 100));
```

## 📊 Implementation Checklist

- [x] NextAuth installed and configured
- [x] CredentialsProvider setup with Laravel backend
- [x] JWT session strategy with 24h expiration
- [x] SessionProvider wraps entire app
- [x] Middleware protects routes
- [x] Login component uses React Hook Form
- [x] api-client uses getSession() for tokens
- [x] Zustand store synced with session
- [x] Sidebar uses session.user data
- [x] Logout clears session and tokens
- [x] Error handling for 401 responses
- [x] Environment variables configured

## 📝 File Structure

```
posfrontend/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.js                 # NextAuth handler
│   ├── layout.jsx                            # Wrapped with AuthProvider
│   └── (app)/
│       └── page.jsx
├── components/
│   ├── auth/
│   │   └── login-screen.jsx                  # React Hook Form login
│   ├── providers/
│   │   └── auth-provider.jsx                 # SessionProvider wrapper
│   ├── pos/
│   │   └── sidebar.jsx                       # Uses session.user
│   └── ...
├── hooks/
│   └── use-sync-session.js                   # Session ↔ Store sync
├── lib/
│   ├── api-client.js                         # Uses getSession()
│   └── store.jsx                             # Zustand store
├── middleware.js                              # Route protection
├── .env.local                                 # NextAuth config
└── NEXTAUTH_MIGRATION.md                      # Setup guide
```

## 🎯 Next Steps

After successful testing:

1. **Optimize performance:**
   - Enable caching for session data
   - Consider using React Query for data fetching
   - Profile slow queries

2. **Enhance security:**
   - Add CSRF protection for forms
   - Implement rate limiting on login
   - Add session timeout warnings

3. **Add features:**
   - Remember me functionality
   - Social login providers
   - Two-factor authentication
   - Session management UI

4. **Monitor in production:**
   - Log authentication events
   - Track failed login attempts
   - Monitor token refresh rate
   - Alert on suspicious activity

## 📞 Support

For issues or questions:

1. Check debugging section above
2. Review NEXTAUTH_MIGRATION.md
3. Check browser console for errors
4. Check backend logs for API issues
5. Verify all files created/modified

## ✨ Summary

Your POS application now uses enterprise-grade authentication with:
- ✅ NextAuth JWT sessions
- ✅ React Hook Form validation
- ✅ Secure token management
- ✅ Protected routes
- ✅ Automatic error handling
- ✅ Session persistence
- ✅ Logout functionality

**Ready to deploy!** 🚀
