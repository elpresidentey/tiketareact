import React, { ReactNode, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from './LoadingSpinner'

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()
  // const navigate = useNavigate()

  // Enhanced navigation guard: Check for session expiry
  useEffect(() => {
    if (requireAuth && !isLoading && !isAuthenticated) {
      // Clear any stale data when redirecting to login
      localStorage.removeItem('lastVisitedRoute')
      
      // Save current route for post-login redirect (except for auth routes)
      if (location.pathname !== '/login' && location.pathname !== '/signup') {
        localStorage.setItem('lastVisitedRoute', location.pathname + location.search)
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, location])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // If user is authenticated but trying to access auth pages (login/signup)
  if (!requireAuth && isAuthenticated) {
    // Priority order for redirect:
    // 1. Location state from navigation
    // 2. Last visited route from localStorage
    // 3. Default to dashboard
    const fromState = location.state?.from?.pathname
    const lastVisited = localStorage.getItem('lastVisitedRoute')
    const redirectPath = fromState || lastVisited || '/dashboard'
    
    // Clear the stored route after using it
    if (lastVisited) {
      localStorage.removeItem('lastVisitedRoute')
    }
    
    return <Navigate to={redirectPath} replace />
  }

  // Render children if all conditions are met
  return <>{children}</>
}

// Convenience component for routes that require authentication
export const RequireAuth: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute requireAuth={true}>
      {children}
    </ProtectedRoute>
  )
}

// Convenience component for routes that should redirect if authenticated (login/signup pages)
export const RequireGuest: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute requireAuth={false}>
      {children}
    </ProtectedRoute>
  )
}