/**
 * Route preloader utility for lazy-loaded components
 * Helps improve perceived performance by preloading routes
 */

// Route preloader functions
export const preloadRoutes = {
  // Preload authentication pages
  auth: () => {
    import('../pages/LoginPage').then(module => module.LoginPage)
    import('../pages/SignupPage').then(module => module.SignupPage)
  },
  
  // Preload main application pages
  app: () => {
    import('../pages/TicketManagementPage')
  },
  
  // Preload all routes (for when user is likely to navigate)
  all: () => {
    preloadRoutes.auth()
    preloadRoutes.app()
  }
}

// Preload routes based on user authentication status
export const preloadBasedOnAuth = (isAuthenticated: boolean) => {
  if (isAuthenticated) {
    // User is authenticated, preload app pages
    preloadRoutes.app()
  } else {
    // User is not authenticated, preload auth pages
    preloadRoutes.auth()
  }
}

// Preload routes on user interaction (hover, focus)
export const preloadOnInteraction = (routeName: keyof typeof preloadRoutes) => {
  return {
    onMouseEnter: () => preloadRoutes[routeName]?.(),
    onFocus: () => preloadRoutes[routeName]?.(),
  }
}

// Preload routes with delay (for background preloading)
export const preloadWithDelay = (routeName: keyof typeof preloadRoutes, delay: number = 2000) => {
  setTimeout(() => {
    preloadRoutes[routeName]?.()
  }, delay)
}