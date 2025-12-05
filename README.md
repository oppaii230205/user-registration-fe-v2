# SecureAuth - JWT Authentication React Application

A production-ready React Single Page Application (SPA) implementing secure JWT authentication with access and refresh tokens.

## 🚀 Live Demo

**Frontend URL:** [Your deployment URL here]  
**Backend API:** https://user-registration-be-qcv3.onrender.com

## 📋 Features

- ✅ **Complete JWT Authentication Flow** - Access Token + Refresh Token
- ✅ **Secure Token Storage** - Access tokens in memory, refresh tokens in HTTP-only cookies
- ✅ **Automatic Token Refresh** - Seamless token refresh on 401 errors
- ✅ **Environment Configuration** - Configurable API endpoint via .env file
- ✅ **Protected Routes** - Route guards for authenticated content
- ✅ **Form Validation** - React Hook Form with Zod schema validation
- ✅ **Modern UI** - Beautiful interface with Tailwind CSS
- ✅ **Data Fetching** - React Query for server state management
- ✅ **Error Handling** - Comprehensive error handling and user feedback

## 🛠️ Tech Stack

- **Frontend Framework:** React 19 (Vite)
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios
- **State Management:** TanStack Query (React Query) v5
- **Form Management:** React Hook Form v7
- **Validation:** Zod
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Alert.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   └── Label.jsx
│   │   └── RequireAuth.jsx  # Protected route wrapper
│   ├── contexts/
│   │   └── AuthContext.jsx  # Authentication context
│   ├── hooks/
│   │   └── useAuth.js       # Custom authentication hooks
│   ├── lib/
│   │   ├── api.js           # Axios instance with interceptors
│   │   ├── cookies.js       # Cookie management utilities
│   │   ├── queryClient.js   # React Query configuration
│   │   └── cn.js            # Utility functions
│   ├── pages/
│   │   ├── Home.jsx         # Landing page
│   │   ├── Login.jsx        # Login form
│   │   ├── SignUp.jsx       # Registration form
│   │   └── Dashboard.jsx    # Protected dashboard
│   ├── App.jsx              # Main app component
│   └── main.jsx             # App entry point
└── package.json
```

## 🔐 Authentication Architecture

### Token Management Strategy

1. **Access Token**: Stored in **memory** (JavaScript variable) for maximum security
2. **Refresh Token**: Stored in **HTTP cookies** (Secure, SameSite=Strict) for persistence across sessions
3. **Auto-Refresh**: Automatically refreshes access token when it expires

### Axios Interceptor Flow

```
Request → [Attach Access Token] → Server
                                      ↓
                                   401 Error?
                                      ↓
                        [Call /auth/request with Refresh Token]
                                      ↓
                              Success? → [Update Access Token]
                                      ↓
                              [Retry Original Request]

                              Failure? → [Clear Tokens & Redirect to Login]
```

### API Endpoints

| Endpoint         | Method | Description          | Auth Required       |
| ---------------- | ------ | -------------------- | ------------------- |
| `/user/register` | POST   | Register new user    | No                  |
| `/auth/login`    | POST   | Login user           | No                  |
| `/auth/request`  | POST   | Refresh access token | Yes (Refresh Token) |
| `/user/me`       | GET    | Get user profile     | Yes (Access Token)  |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your API base URL:

   ```env
   VITE_API_BASE_URL=https://user-registration-be-qcv3.onrender.com
   ```

   > **Note:** The `.env` file is gitignored. Use `.env.example` as a template.

4. **Run development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📖 Usage Guide

### 1. Register a New Account

- Navigate to `/signup`
- Fill in email and password (password must contain uppercase, lowercase, and number)
- Submit the form
- You'll be redirected to login page upon success

### 2. Login

- Navigate to `/login`
- Enter your registered email and password
- Upon success, you'll be redirected to the dashboard with:
  - Access token stored in memory
  - Refresh token stored in secure HTTP cookies

### 3. Access Protected Routes

- The dashboard (`/dashboard`) is a protected route
- Attempting to access it without authentication redirects to login
- The `RequireAuth` component handles this protection

### 4. View User Profile

- After login, the dashboard fetches your profile from `/user/me`
- Uses the access token automatically via Axios interceptor
- Displays user information (email, ID, creation date)

### 5. Token Refresh Flow

- When access token expires, any API call will return 401
- Axios interceptor automatically:
  - Pauses the failed request
  - Calls `/auth/request` with refresh token
  - Updates access token in memory
  - Retries the original request
- All happens transparently to the user

### 6. Logout

- Click "Logout" button in dashboard
- Clears both access and refresh tokens
- Invalidates React Query cache
- Redirects to login page

## 🎨 UI Components

All UI components are built with Tailwind CSS and support:

- **Variants** (primary, secondary, outline, ghost)
- **Sizes** (default, sm, lg)
- **States** (default, hover, focus, disabled)
- **Error States** (for form inputs)

### Available Components

- `Button` - Customizable button component
- `Input` - Form input with error states
- `Label` - Form label component
- `Card` - Container component with header, content, and footer
- `Alert` - Alert messages (success, error, info variants)

## 🔧 Configuration

### React Query Configuration

Located in `src/lib/queryClient.js`:

```javascript
{
  refetchOnWindowFocus: false,
  retry: 1,
  staleTime: 5 * 60 * 1000, // 5 minutes
}
```

### Form Validation Schemas

Example from `src/pages/Login.jsx`:

```javascript
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
```

## 🐛 Troubleshooting

### Token Refresh Loop

If you experience infinite refresh attempts:

- Clear localStorage: `localStorage.clear()`
- Ensure refresh token is valid
- Check backend `/auth/request` endpoint

### 401 Errors

- Verify access token is being attached to requests
- Check Axios interceptor configuration
- Ensure backend is running and accessible

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 Environment Variables

The application uses environment variables for configuration. A `.env` file is already created with:

```env
VITE_API_BASE_URL=https://user-registration-be-qcv3.onrender.com
```

The API base URL is automatically loaded from the environment variable in `src/lib/api.js`:

```javascript
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://user-registration-be-qcv3.onrender.com";
```

> **Note:** The `.env` file is gitignored to prevent committing sensitive data. Use `.env.example` as a template for new setups.

## 🧪 Testing

To test the authentication flow:

1. Register a new account
2. Login with credentials
3. View dashboard (protected route)
4. Try accessing `/dashboard` in incognito mode (should redirect to login)
5. Logout and verify tokens are cleared

## 📦 Dependencies

### Production Dependencies

```json
{
  "@tanstack/react-query": "^5.90.11",
  "axios": "^1.13.2",
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-hook-form": "^7.67.0",
  "react-router-dom": "^7.9.6",
  "zod": "^3.x.x",
  "@hookform/resolvers": "^3.x.x",
  "tailwindcss": "^4.1.17",
  "lucide-react": "^0.555.0"
}
```

## 🚢 Deployment

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Deploy to Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set build command to `npm run build`
4. Set publish directory to `dist`

### Deploy to GitHub Pages

1. Update `vite.config.js`:
   ```javascript
   export default defineConfig({
     base: "/your-repo-name/",
   });
   ```
2. Build: `npm run build`
3. Deploy `dist` folder to gh-pages branch

## 🔒 Security Best Practices

- ✅ Access tokens never stored in localStorage (XSS protection)
- ✅ Refresh tokens in localStorage (acceptable trade-off for UX)
- ✅ Automatic token refresh prevents expired token errors
- ✅ Request interceptors ensure tokens are always attached
- ✅ Failed refresh attempts trigger immediate logout
- ✅ HTTPS enforced in production
- ✅ Zod validation prevents malformed data submission

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Your Name**  
Web Application Development Course - Week 10  
HCM-US 2025-2026

## 🙏 Acknowledgments

- NestJS Backend API
- React Team
- TanStack Team
- Tailwind CSS Team
- React Hook Form Team

---

**Note:** Make sure to update the deployment URL once you deploy the application!
