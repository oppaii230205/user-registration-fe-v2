# 🚀 Quick Reference Card

## 📌 Essential Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🌐 URLs

- **Development:** http://localhost:5173
- **Backend API:** https://user-registration-be-qcv3.onrender.com
- **Production:** [Add your deployment URL here]

## 🔑 Key Features

| Feature             | Implementation    | File                             |
| ------------------- | ----------------- | -------------------------------- |
| **Access Token**    | In-memory storage | `src/lib/api.js`                 |
| **Refresh Token**   | localStorage      | `src/lib/api.js`                 |
| **Auto Refresh**    | Axios interceptor | `src/lib/api.js`                 |
| **Login Hook**      | `useLogin()`      | `src/hooks/useAuth.js`           |
| **User Profile**    | `useUser()`       | `src/hooks/useAuth.js`           |
| **Protected Route** | `<RequireAuth>`   | `src/components/RequireAuth.jsx` |
| **Auth Context**    | `<AuthProvider>`  | `src/contexts/AuthContext.jsx`   |

## 📄 Important Files

```
src/
├── lib/api.js              ⭐ Token management & interceptors
├── hooks/useAuth.js        ⭐ Authentication hooks
├── contexts/AuthContext.jsx ⭐ Auth state management
├── components/RequireAuth.jsx ⭐ Route protection
├── pages/Login.jsx         📝 Login form
├── pages/SignUp.jsx        📝 Registration form
└── pages/Dashboard.jsx     📝 Protected dashboard
```

## 🧪 Quick Test

```javascript
// 1. Register
Visit: http://localhost:5173/signup
Email: test@example.com
Password: Test123

// 2. Login
Visit: http://localhost:5173/login
Use same credentials

// 3. Check Tokens (Browser Console)
document.cookie.includes('refreshToken') // Should be true

// 4. Test Protected Route
Open incognito: http://localhost:5173/dashboard
→ Should redirect to login

// 5. Logout
Click "Logout" button
document.cookie.includes('refreshToken') // Should be false
```

## 🔧 Debug Commands (Browser Console)

```javascript
// Check refresh token
document.cookie.includes('refreshToken')

// Clear all cookies
document.cookie.split(';').forEach(c => {
  document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
});

// Check if authenticated (React DevTools)
// Look for AuthContext: { isAuthenticated: true/false }
```

## 📊 API Endpoints

```
POST /user/register
Body: { email, password }

POST /auth/login
Body: { email, password }
Returns: { accessToken, refreshToken }

POST /auth/request
Body: { refreshToken }
Returns: { accessToken }

GET /user/me
Header: Authorization: Bearer <accessToken>
Returns: { id, email, createdAt }
```

## 🎯 File Quick Access

```bash
# View token management
code src/lib/api.js

# View authentication hooks
code src/hooks/useAuth.js

# View login page
code src/pages/Login.jsx

# View dashboard
code src/pages/Dashboard.jsx
```

## 🛠️ Common Tasks

### Clear Everything

```javascript
// In browser console
document.cookie.split(';').forEach(c => {
  document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
});
location.reload();
```

### Check Build

```bash
npm run build
# Should complete without errors
```

### Test Production Build

```bash
npm run preview
# Open http://localhost:4173
```

## 📚 Documentation Files

- `README.md` - Full documentation
- `ARCHITECTURE.md` - Technical architecture
- `TESTING.md` - Testing guide
- `PROJECT_SUMMARY.md` - Implementation summary
- `QUICK_REFERENCE.md` - This file

## 🐛 Troubleshooting

| Problem                | Solution                            |
| ---------------------- | ----------------------------------- |
| 401 errors             | Clear localStorage, login again     |
| Infinite redirects     | `localStorage.clear()`              |
| Build errors           | `npm install`, then `npm run build` |
| Dev server won't start | Check port 5173 is free             |
| API errors             | Check backend is accessible         |

## ✅ Pre-Deployment Checklist

- [ ] `npm run build` succeeds
- [ ] No console errors in browser
- [ ] Login/logout works
- [ ] Token refresh works
- [ ] Protected routes work
- [ ] Form validations work
- [ ] Responsive on mobile
- [ ] README updated with deployment URL

## 🎨 UI/UX Highlights

✨ Loading spinners on all async operations  
✨ Error messages for failed requests  
✨ Success feedback for completed actions  
✨ Form validation with real-time feedback  
✨ Responsive design (mobile-friendly)  
✨ Beautiful gradient backgrounds  
✨ Smooth page transitions

## 🔒 Security Highlights

🔒 Access token in memory (XSS protection)  
🔒 Refresh token in secure HTTP cookies  
🔒 Automatic logout on token expiry
🔐 Protected routes with guards  
🔐 Input validation with Zod  
🔐 HTTPS ready

## 📞 Support

Need help? Check these files in order:

1. `QUICK_REFERENCE.md` (this file)
2. `TESTING.md` (test scenarios)
3. `README.md` (full documentation)
4. `ARCHITECTURE.md` (technical details)

---

**Print this card for quick reference while developing! 📋**
