# NextAuth Migration - Complete Setup

## ✅ Implementation Summary

All components have been successfully migrated from manual Zustand + localStorage authentication to NextAuth JWT sessions with React Hook Form.

## 📋 Files Modified/Created

### Authentication Infrastructure (NEW)

**1. `/posfrontend/app/api/auth/[...nextauth]/route.js`** ✓
- NextAuth API route with Credentials provider
- Authenticates against Laravel `/api/login`
- JWT session strategy with 24-hour expiration
- Session/JWT callbacks store token and user data

**2. `/posfrontend/components/providers/auth-provider.jsx`** ✓
- SessionProvider wrapper component
- Provides session context to entire app

**3. `/posfrontend/middleware.js`** ✓
- Protects /pos and /(app)/* routes
- Redirects unauthenticated users to login

**4. `/posfrontend/.env.local`** ✓
- NEXTAUTH_SECRET: Secret for JWT signing
- NEXTAUTH_URL: Application URL for NextAuth
- NEXT_PUBLIC_API_BASE_URL: Backend API URL

**5. `/posfrontend/lib/auth-utils.js`** ✓
- handleLogout: Logs out from NextAuth and backend
- getAuthToken: Utility to get token from session

**6. `/posfrontend/hooks/use-sync-session.js`** ✓
- useSyncSessionWithStore: Syncs NextAuth session with Zustand store
- Initializes currentUser from session on authentication

### Components Updated

**1. `/posfrontend/components/auth/login-screen.jsx`** ✓
- Refactored from useState to React Hook Form
- Uses useForm hook for email/password fields
- Uses signIn from next-auth/react
- Proper error handling and validation
- Redirects to /pos on successful login

**2. `/posfrontend/components/pos/sidebar.jsx`** ✓
- Added useSession import
- Updated handleLogout to use NextAuth signOut
- Replaced currentUser display with session.user
- Integrated with handleLogout utility

### Store Updates

**1. `/posfrontend/lib/store.jsx`** ✓
- Removed login and logout functions
- Kept currentUser state and setCurrentUser
- Added initializeUserFromSession function
- Store now used for data caching only

**2. `/posfrontend/lib/api-client.js`** ✓
- Request interceptor uses getSession()
- Extracts token from NextAuth session
- Adds Bearer token to Authorization header
- No longer uses localStorage

**3. `/posfrontend/app/layout.jsx`** ✓
- Wrapped with AuthProvider (SessionProvider from NextAuth)
- Session context available to entire app

**4. `/posfrontend/components/layout/app-shell.jsx`** ✓
- Added useSyncSessionWithStore hook
- Initializes currentUser from session on load
- currentUser available for data operations throughout app

## 🔄 Authentication Flow

```
1. User visits /login
   ↓
2. User submits login form (React Hook Form)
   ↓
3. signIn("credentials", {email, password})
   ↓
4. NextAuth Credentials Provider POSTs to /api/login
   ↓
5. Backend validates, returns token
   ↓
6. JWT callback stores token in session
   ↓
7. Session callback adds token and user to session
   ↓
8. User redirected to /pos
   ↓
9. api-client.js getSession() retrieves token
   ↓
10. Token added as Bearer header on API requests
```

## 🛡️ Route Protection

- Middleware protects /pos and /(app)/* routes
- Unauthenticated users redirected to /
- Session required for all protected routes

## 📊 Session Data Structure

```javascript
session = {
  user: {
    id: "...",
    email: "admin@pos.com",
    name: "Admin User",
    role: "admin",
    shop_id: "...",
    // ... other user fields
  },
  accessToken: "token_string",
  expires: "2025-01-XX...", // 24 hours
  currentShop: {...},
  accessibleShops: [...],
}
```

## 🔌 API Integration

- **Base URL**: NEXT_PUBLIC_API_BASE_URL
- **Login Endpoint**: POST /api/login
- **Logout Endpoint**: POST /api/logout
- **Auth Header**: Authorization: Bearer {token}

## ✨ Key Features

1. **Automatic Token Management**: NextAuth handles token storage and renewal
2. **Session Persistence**: Session survives page reloads
3. **Secure JWT**: Token stored in encrypted JWT cookie
4. **Type Safety**: React Hook Form provides form validation
5. **Zustand Integration**: currentUser synced to store for app-wide access
6. **Automatic Logout**: 401 responses handled by api-client interceptor

## 🧪 Testing Checklist

- [ ] Login with valid credentials (admin@pos.com / password)
- [ ] Session persists across page reloads
- [ ] API requests include Bearer token
- [ ] Protected routes require authentication
- [ ] Logout clears session and redirects to login
- [ ] Invalid credentials show error message
- [ ] Form validation works (email/password required)
- [ ] 401 response redirects to login

## 🚀 Deployment Notes

1. Generate NEXTAUTH_SECRET in production:
   ```bash
   openssl rand -base64 32
   ```

2. Set NEXTAUTH_URL to production URL

3. Ensure backend CORS allows NextAuth origin

4. Backend should return token in response.data.token

## 📦 Dependencies

- next-auth@latest
- react-hook-form
- axios (already installed)
- zustand (already installed)

## 🔐 Removed Dependencies

- Manual localStorage token management
- Zustand-based login/logout functions
- useState for form handling in login component
