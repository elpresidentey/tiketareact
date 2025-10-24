/**
 * Route configuration for the application
 * Centralizes route definitions and metadata
 */

export interface RouteConfig {
  path: string
  title: string
  description?: string
  requireAuth: boolean
  preloadPriority: 'high' | 'medium' | 'low'
}

export const routes: Record<string, RouteConfig> = {
  home: {
    path: '/',
    title: 'Home',
    description: 'Landing page with hero section',
    requireAuth: false,
    preloadPriority: 'high'
  },
  login: {
    path: '/login',
    title: 'Login',
    description: 'User authentication - login',
    requireAuth: false,
    preloadPriority: 'high'
  },
  signup: {
    path: '/signup',
    title: 'Sign Up',
    description: 'User authentication - registration',
    requireAuth: false,
    preloadPriority: 'medium'
  },
  dashboard: {
    path: '/dashboard',
    title: 'Dashboard',
    description: 'Main dashboard with statistics',
    requireAuth: true,
    preloadPriority: 'high'
  },
  tickets: {
    path: '/tickets',
    title: 'Ticket Management',
    description: 'Manage and track tickets',
    requireAuth: true,
    preloadPriority: 'high'
  }
} as const

// Helper functions for route management
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return Object.values(routes).find(route => route.path === path)
}

export const getProtectedRoutes = (): RouteConfig[] => {
  return Object.values(routes).filter(route => route.requireAuth)
}

export const getPublicRoutes = (): RouteConfig[] => {
  return Object.values(routes).filter(route => !route.requireAuth)
}

export const getHighPriorityRoutes = (): RouteConfig[] => {
  return Object.values(routes).filter(route => route.preloadPriority === 'high')
}