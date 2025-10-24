import { useNavigate, useLocation } from 'react-router-dom'
import { useCallback } from 'react'
import { routes } from '../config/routes'
import { preloadRoutes } from '../utils/routePreloader'

/**
 * Enhanced navigation hook with route preloading and utilities
 */
export const useNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // Navigate with preloading
  const navigateWithPreload = useCallback((path: string, options?: { replace?: boolean }) => {
    // Preload related routes based on destination
    if (path === routes.dashboard.path || path === routes.tickets.path) {
      preloadRoutes.app()
    } else if (path === routes.login.path || path === routes.signup.path) {
      preloadRoutes.auth()
    }

    navigate(path, options)
  }, [navigate])

  // Navigate to dashboard
  const goToDashboard = useCallback(() => {
    navigateWithPreload(routes.dashboard.path)
  }, [navigateWithPreload])

  // Navigate to tickets
  const goToTickets = useCallback(() => {
    navigateWithPreload(routes.tickets.path)
  }, [navigateWithPreload])

  // Navigate to login
  const goToLogin = useCallback((replace = false) => {
    navigateWithPreload(routes.login.path, { replace })
  }, [navigateWithPreload])

  // Navigate to signup
  const goToSignup = useCallback(() => {
    navigateWithPreload(routes.signup.path)
  }, [navigateWithPreload])

  // Navigate to home
  const goToHome = useCallback(() => {
    navigateWithPreload(routes.home.path)
  }, [navigateWithPreload])

  // Go back with fallback
  const goBack = useCallback((fallbackPath = routes.home.path) => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigateWithPreload(fallbackPath)
    }
  }, [navigate, navigateWithPreload])

  // Check if current route matches
  const isCurrentRoute = useCallback((path: string) => {
    return location.pathname === path
  }, [location.pathname])

  // Get current route info
  const getCurrentRoute = useCallback(() => {
    return Object.values(routes).find(route => route.path === location.pathname)
  }, [location.pathname])

  return {
    // Navigation functions
    navigate: navigateWithPreload,
    goToDashboard,
    goToTickets,
    goToLogin,
    goToSignup,
    goToHome,
    goBack,
    
    // Route utilities
    isCurrentRoute,
    getCurrentRoute,
    currentPath: location.pathname,
    
    // Route constants
    routes
  }
}