# Authentication Flow Architecture

## 🔐 JWT Token Management

### Token Storage Strategy

| Token Type        | Storage Location        | Reason                                                                              | Security Level     |
| ----------------- | ----------------------- | ----------------------------------------------------------------------------------- | ------------------ |
| **Access Token**  | In-memory (JS variable) | Prevents XSS attacks - cannot be accessed via document.cookie or localStorage       | ⭐⭐⭐⭐⭐ Highest |
| **Refresh Token** | HTTP Cookies (Secure)   | Persistence across page refreshes with Secure, SameSite=Strict flags for protection | ⭐⭐⭐⭐ High      |

### Token Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         USER LOGIN                           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
                  ┌─────────────────────┐
                  │  POST /auth/login   │
                  │  { email, password }│
                  └─────────┬───────────┘
                            │
                            ▼
            ┌───────────────────────────────┐
            │   Backend Returns:            │
            │   - accessToken               │
            │   - refreshToken              │
            └───────────┬───────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │   Frontend Token Storage:             │
        │   ✓ accessToken → Memory (variable)   │
        │   ✓ refreshToken → HTTP Cookies       │
        └───────────────────────────────────────┘
```

## 🔄 Automatic Token Refresh Flow

### Step-by-Step Process

```
1. User makes API request (e.g., GET /user/me)
   │
   ├─▶ Axios Request Interceptor attaches Access Token
   │   Authorization: Bearer <accessToken>
   │
   ▼
2. Request sent to Backend
   │
   ├─▶ Access Token Valid?
   │   │
   │   ├─ YES ──▶ Return Data ──▶ Success!
   │   │
   │   └─ NO ──▶ Return 401 Unauthorized
   │              │
   │              ▼
3. Axios Response Interceptor catches 401
   │
   ├─▶ Pause failed request
   │
   ├─▶ Check: Is refresh already in progress?
   │   │
   │   ├─ YES ──▶ Queue this request
   │   │          Wait for refresh to complete
   │   │
   │   └─ NO ──▶ Start refresh process
   │              │
   │              ▼
4. Call POST /auth/request
   │  Body: { refreshToken: <refreshToken from cookies> }
   │
   ├─▶ Refresh Token Valid?
   │   │
   │   ├─ YES ──▶ Backend returns new accessToken
   │   │          │
   │   │          ├─▶ Update accessToken in memory
   │   │          ├─▶ Process queued requests
   │   │          └─▶ Retry original request ──▶ Success!
   │   │
   │   └─ NO ──▶ Refresh Failed
   │              │
   │              ├─▶ Clear accessToken from memory
   │              ├─▶ Clear refreshToken cookie
   │              ├─▶ Redirect to /login
   │              └─▶ Show error message
```

## 📁 Key Files and Their Roles

### 1. `src/lib/api.js` - Core Authentication Logic

**Responsibilities:**

- Create Axios instance
- Manage tokens in memory and HTTP cookies
- Implement request/response interceptors
- Handle automatic token refresh

**Key Functions:**

```javascript
// Token Manager
tokenManager.setAccessToken(token); // Store in memory
tokenManager.getAccessToken(); // Retrieve from memory
tokenManager.setRefreshToken(token); // Store in HTTP cookie
tokenManager.getRefreshToken(); // Retrieve from HTTP cookie
tokenManager.clearAll(); // Clear both tokens
```

**Request Interceptor:**

```javascript
api.interceptors.request.use((config) => {
  // Automatically attach access token to every request
  const token = tokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Response Interceptor:**

```javascript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // On 401 error:
    // 1. Pause failed request
    // 2. Call refresh endpoint
    // 3. Update access token
    // 4. Retry original request
    // 5. If refresh fails, logout user
  }
);
```

### 2. `src/contexts/AuthContext.jsx` - Authentication State

**Responsibilities:**

- Manage authentication state (isAuthenticated, isLoading)
- Provide login/logout functions
- Wrap app with auth context

**State:**

```javascript
{
  isAuthenticated: boolean,  // Is user logged in?
  isLoading: boolean,        // Is auth state loading?
  login: (accessToken, refreshToken) => void,
  logout: () => void
}
```

### 3. `src/hooks/useAuth.js` - React Query Hooks

**Responsibilities:**

- Provide React Query mutations and queries for auth operations
- Handle success/error callbacks
- Manage navigation after auth actions

**Available Hooks:**

| Hook            | Type     | Purpose                                                   |
| --------------- | -------- | --------------------------------------------------------- |
| `useLogin()`    | Mutation | Login user, store tokens, redirect to dashboard           |
| `useRegister()` | Mutation | Register user, redirect to login                          |
| `useLogout()`   | Mutation | Logout user, clear tokens, clear cache, redirect to login |
| `useUser()`     | Query    | Fetch user profile from /user/me                          |

### 4. `src/components/RequireAuth.jsx` - Route Protection

**Responsibilities:**

- Protect routes from unauthorized access
- Show loading state while checking auth
- Redirect to login if not authenticated

**Flow:**

```javascript
if (isLoading) return <LoadingSpinner />;
if (!isAuthenticated) return <Navigate to="/login" />;
return <ProtectedComponent />;
```

## 🎯 User Journey Examples

### Scenario 1: First Time User

```
1. Visit /signup
   ├─▶ Fill registration form
   ├─▶ Submit (POST /user/register)
   └─▶ Redirect to /login

2. Visit /login
   ├─▶ Enter credentials
   ├─▶ Submit (POST /auth/login)
   ├─▶ Receive accessToken + refreshToken
   ├─▶ Store tokens (memory + cookies)
   └─▶ Redirect to /dashboard

3. Dashboard loads
   ├─▶ RequireAuth checks authentication
   ├─▶ useUser() fetches profile (GET /user/me)
   ├─▶ Axios adds Authorization header automatically
   └─▶ Display user profile
```

### Scenario 2: Returning User (Page Refresh)

```
1. User refreshes page at /dashboard
   │
   ├─▶ App loads
   ├─▶ AuthContext checks cookies for refreshToken
   │   └─▶ Found! Set isAuthenticated = true
   │
   ├─▶ RequireAuth allows access
   │
   ├─▶ useUser() attempts to fetch profile
   │   ├─▶ No accessToken in memory (page was refreshed!)
   │   ├─▶ Request fails with 401
   │   ├─▶ Axios interceptor triggers refresh
   │   ├─▶ POST /auth/request with refreshToken
   │   ├─▶ Receive new accessToken
   │   ├─▶ Retry GET /user/me
   │   └─▶ Success! Display profile
```

### Scenario 3: Access Token Expires During Session

```
1. User is on /dashboard
   ├─▶ Access token expires after 15 minutes
   │
2. User clicks something that makes API call
   ├─▶ Axios adds expired token to request
   ├─▶ Backend returns 401
   │
3. Axios Response Interceptor activates
   ├─▶ Pause failed request
   ├─▶ POST /auth/request with refreshToken
   ├─▶ Receive new accessToken
   ├─▶ Update token in memory
   ├─▶ Retry original request with new token
   └─▶ User sees no interruption! ✨
```

### Scenario 4: Logout

```
1. User clicks "Logout" button
   │
   ├─▶ logoutMutation.mutate()
   │
   ├─▶ tokenManager.clearAll()
   │   ├─▶ Clear accessToken from memory
   │   └─▶ Clear refreshToken cookie
   │
   ├─▶ queryClient.clear()
   │   └─▶ Clear all React Query cache
   │
   ├─▶ AuthContext sets isAuthenticated = false
   │
   └─▶ Navigate to /login
```

## 🛡️ Security Considerations

### Why Access Token in Memory?

**Problem with localStorage:**

- Vulnerable to XSS (Cross-Site Scripting) attacks
- Any malicious script can read `localStorage.getItem('accessToken')`

**Solution - In-Memory Storage:**

- JavaScript variables are cleared on page refresh
- Cannot be accessed by malicious scripts across origins
- Requires refresh token to re-authenticate after page reload

### Why Refresh Token in HTTP Cookies?

**Trade-off:**

- Need persistence across page refreshes for good UX
- Cookies with Secure and SameSite=Strict flags provide protection
- Refresh token has longer expiry, less sensitive than access token
- Backend should implement refresh token rotation for added security

### Additional Security Measures

1. **HTTPS Only** - Always use HTTPS in production
2. **Token Expiry** - Short-lived access tokens (15-30 min)
3. **Refresh Rotation** - Backend should rotate refresh tokens
4. **CORS** - Properly configured CORS on backend
5. **CSP Headers** - Content Security Policy headers
6. **Input Validation** - Zod schema validation on forms

## 🧪 Testing the Flow

### Test Access Token Expiry

```javascript
// In browser console on /dashboard
document.cookie; // Should contain refreshToken
window.tokenManager.getAccessToken(); // Will be null initially

// Make an API call, watch Network tab
// See automatic refresh token request
```

### Test Failed Refresh

```javascript
// In browser console
document.cookie = "refreshToken=invalid-token; path=/";
// Try to access /dashboard
// Should redirect to /login
```

### Test Protected Routes

```
1. Open /dashboard in incognito mode
   → Should redirect to /login

2. Login, then open /dashboard
   → Should show user profile

3. Clear cookies and refresh
   → Should redirect to /login
```

## 📊 State Management Overview

```
┌──────────────────────────────────────────────────────────┐
│                    APPLICATION STATE                      │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  1. Authentication State (AuthContext)                   │
│     - isAuthenticated                                     │
│     - isLoading                                          │
│                                                           │
│  2. Server State (React Query)                           │
│     - User profile data                                   │
│     - Login/Logout mutations                             │
│     - Registration mutation                              │
│                                                           │
│  3. Token State (api.js - Module Scope)                  │
│     - accessToken (in-memory variable)                   │
│     - refreshToken (HTTP cookies)                        │
│                                                           │
│  4. Form State (React Hook Form)                         │
│     - Form values                                         │
│     - Validation errors                                   │
│     - Submit state                                        │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## 🚀 Best Practices Implemented

✅ **Separation of Concerns** - Auth logic separate from components  
✅ **Single Responsibility** - Each file has one clear purpose  
✅ **DRY Principle** - Reusable hooks and components  
✅ **Error Handling** - Comprehensive error messages  
✅ **Loading States** - User feedback during async operations  
✅ **Type Safety** - Zod schema validation  
✅ **Security First** - Secure token storage strategy  
✅ **User Experience** - Seamless token refresh

---

This architecture provides a **production-ready**, **secure**, and **maintainable** authentication system! 🎉
