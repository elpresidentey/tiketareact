import { authStorage } from './localStorage'

// Session configuration
export const SESSION_CONFIG = {
  // Session duration in milliseconds (24 hours)
  DURATION: 24 * 60 * 60 * 1000,
  // Check interval in milliseconds (5 minutes)
  CHECK_INTERVAL: 5 * 60 * 1000,
  // Warning before expiry in milliseconds (5 minutes)
  WARNING_BEFORE_EXPIRY: 5 * 60 * 1000
} as const

export interface SessionInfo {
  isValid: boolean
  isExpired: boolean
  timeUntilExpiry: number
  shouldWarn: boolean
}

/**
 * Validates the current session token
 */
export const validateSession = (): SessionInfo => {
  const token = authStorage.getToken()
  const user = authStorage.getUser()

  // Default invalid session
  const invalidSession: SessionInfo = {
    isValid: false,
    isExpired: true,
    timeUntilExpiry: 0,
    shouldWarn: false
  }

  // Check if token and user exist
  if (!token || !user) {
    return invalidSession
  }

  // Validate token format
  if (!isValidTokenFormat(token)) {
    return invalidSession
  }

  // Extract timestamp from token
  const tokenParts = token.split('_')
  const tokenTimestamp = parseInt(tokenParts[2])
  
  if (isNaN(tokenTimestamp)) {
    return invalidSession
  }

  // Calculate time until expiry
  const now = Date.now()
  const expiryTime = tokenTimestamp + SESSION_CONFIG.DURATION
  const timeUntilExpiry = expiryTime - now

  // Check if expired
  const isExpired = timeUntilExpiry <= 0
  const shouldWarn = timeUntilExpiry <= SESSION_CONFIG.WARNING_BEFORE_EXPIRY && timeUntilExpiry > 0

  return {
    isValid: !isExpired,
    isExpired,
    timeUntilExpiry: Math.max(0, timeUntilExpiry),
    shouldWarn
  }
}

/**
 * Validates token format
 */
export const isValidTokenFormat = (token: string): boolean => {
  return token.startsWith('session_') && token.split('_').length === 4
}

/**
 * Formats time until expiry in a human-readable format
 */
export const formatTimeUntilExpiry = (milliseconds: number): string => {
  if (milliseconds <= 0) {
    return 'Expired'
  }

  const minutes = Math.floor(milliseconds / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`
  }
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }
  
  return `${minutes} minute${minutes > 1 ? 's' : ''}`
}

/**
 * Extends the current session by generating a new token
 */
export const extendSession = (userId: string): boolean => {
  try {
    const newToken = `session_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return authStorage.setToken(newToken)
  } catch (error) {
    console.error('Failed to extend session:', error)
    return false
  }
}

/**
 * Clears expired session data
 */
export const clearExpiredSession = (): void => {
  const sessionInfo = validateSession()
  
  if (sessionInfo.isExpired) {
    authStorage.clearAuth()
  }
}

/**
 * Sets up automatic session validation
 */
export const setupSessionValidation = (
  onSessionExpired: () => void,
  onSessionWarning?: (timeLeft: number) => void
): (() => void) => {
  let warningShown = false

  const checkSession = () => {
    const sessionInfo = validateSession()

    if (sessionInfo.isExpired) {
      clearExpiredSession()
      onSessionExpired()
      return
    }

    if (sessionInfo.shouldWarn && !warningShown && onSessionWarning) {
      warningShown = true
      onSessionWarning(sessionInfo.timeUntilExpiry)
    }

    // Reset warning flag if session is extended
    if (!sessionInfo.shouldWarn) {
      warningShown = false
    }
  }

  // Initial check
  checkSession()

  // Set up interval
  const intervalId = setInterval(checkSession, SESSION_CONFIG.CHECK_INTERVAL)

  // Return cleanup function
  return () => {
    clearInterval(intervalId)
  }
}