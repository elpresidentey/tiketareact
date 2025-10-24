# Authentication System Implementation

This document describes the authentication system implemented for the Ticket Management App.

## Overview

The authentication system provides secure user login/signup functionality with session management, automatic logout, and protected routes.

## Components Implemented

### 1. Zustand Store (`src/store/authStore.ts`)
- **Purpose**: Centralized state management for authentication
- **Features**:
  - Login/signup with validation
  - Session token generation and validation
  - Automatic session expiry (24 hours)
  - Mock user database for demo purposes
  - Error handling and loading states

**Demo Credentials**:
- User: `demo@example.com` / `password123`
- Admin: `admin@example.com` / `admin123`

### 2. Authentication Context (`src/contexts/AuthContext.tsx`)
- **Purpose**: React context for authentication state
- **Features**:
  - Provides auth state to all components
  - Automatic session validation on mount
  - Cross-tab logout detection
  - Periodic session checks (every 5 minutes)

### 3. Protected Routes (`src/components/ProtectedRoute.tsx`)
- **Purpose**: Route protection and navigation guards
- **Components**:
  - `ProtectedRoute`: Generic route protection
  - `RequireAuth`: Convenience wrapper for authenticated routes
  - `RequireGuest`: Convenience wrapper for guest-only routes (login/signup)
- **Features**:
  - Automatic redirects based on auth status
  - Loading states during auth checks
  - Preserves intended destination after login

### 4. Session Validation (`src/utils/sessionValidation.ts`)
- **Purpose**: Session management utilities
- **Features**:
  - Token format validation
  - Expiry time calculations
  - Session extension functionality
  - Automatic cleanup of expired sessions
  - Human-readable time formatting

### 5. Session Hook (`src/hooks/useSession.ts`)
- **Purpose**: React hook for session management
- **Features**:
  - Real-time session info
  - Session extension capabilities
  - Warning notifications before expiry
  - Automatic logout on expiry

## Security Features

1. **Session Tokens**: Unique tokens with timestamp and random components
2. **Automatic Expiry**: 24-hour session duration
3. **Cross-tab Sync**: Logout in one tab affects all tabs
4. **Input Validation**: Zod schemas for all auth forms
5. **Error Handling**: Comprehensive error messages and states

## Usage Examples

### Using Authentication in Components

```tsx
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()
  
  if (!isAuthenticated) {
    return <div>Please log in</div>
  }
  
  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Using Session Management

```tsx
import { useSession } from '../hooks/useSession'

function SessionInfo() {
  const { sessionInfo, timeUntilExpiryFormatted, extendCurrentSession } = useSession()
  
  return (
    <div>
      <p>Session expires in: {timeUntilExpiryFormatted}</p>
      {sessionInfo.shouldWarn && (
        <button onClick={extendCurrentSession}>
          Extend Session
        </button>
      )}
    </div>
  )
}
```

### Protected Routes Setup

```tsx
import { RequireAuth, RequireGuest } from '../components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/login" element={
        <RequireGuest>
          <LoginPage />
        </RequireGuest>
      } />
      
      <Route path="/dashboard" element={
        <RequireAuth>
          <Dashboard />
        </RequireAuth>
      } />
    </Routes>
  )
}
```

## Integration with App

The authentication system is fully integrated into `src/App.tsx` with:
- AuthProvider wrapping the entire app
- Protected routes for dashboard
- Guest-only routes for login/signup
- Proper navigation and redirects

## Next Steps

The authentication system is ready for integration with:
1. Login/Signup forms (Task 5)
2. Dashboard components (Task 6)
3. Ticket management features (Tasks 7-14)

## Testing

The system includes:
- TypeScript type safety
- Zod validation schemas
- Error boundaries and fallbacks
- Cross-browser localStorage support
- Automatic session cleanup