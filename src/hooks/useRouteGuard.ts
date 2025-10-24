import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNavigation } from './useNavigation'
import { getRouteByPath } from '../config/routes'

/**
 * Route guard hook for additional security and validation
 */
export const useRouteGuard = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()
  const { goToLogin, goToDashboard } = useNavigation()

  useEffect(() => {
    // Skip checks while authentication is loading
    if (isLoading) return

    const currentRoute = getRouteByPath(location.pathname)
    
    // If route is not found in our configuration, it's handled by the catch-all route
    if (!currentRoute) return

    // Check if user is trying to access protected route without authentication
    if (currentRoute.requireAuth && !isAuthenticated) {
      console.warn(`Unauthorized access attempt to ${location.pathname}`)
      goToLogin(true)
      return
    }

    // Check if authenticated user is trying to access auth pages
    if (!currentRoute.requireAuth && isAuthenticated && 
        (location.pathname === '/login' || location.pathname === '/signup')) {
      console.info('Authenticated user redirected from auth page')
      goToDashboard()
      return
    }

    // Log successful route access for debugging
    console.info(`Route access: ${location.pathname} (auth: ${isAuthenticated})`)
  }, [location.pathname, isAuthenticated, isLoading, goToLogin, goToDashboard])

  // Return route validation status
  return {
    isValidRoute: !!getRouteByPath(location.pathname),
    currentRoute: getRouteByPath(location.pathname),
    isAuthorized: !isLoading && (
      !getRouteByPath(location.pathname)?.requireAuth || isAuthenticated
    )
  }
}