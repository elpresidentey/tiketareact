import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  validateSession, 
  setupSessionValidation, 
  formatTimeUntilExpiry,
  extendSession,
  SessionInfo 
} from '../utils/sessionValidation'

interface UseSessionReturn {
  sessionInfo: SessionInfo
  timeUntilExpiryFormatted: string
  extendCurrentSession: () => boolean
  refreshSessionInfo: () => void
}

/**
 * Hook for managing user session validation and extension
 */
export const useSession = (): UseSessionReturn => {
  const { user, logout } = useAuth()
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>(() => validateSession())

  // Refresh session info
  const refreshSessionInfo = useCallback(() => {
    const info = validateSession()
    setSessionInfo(info)
  }, [])

  // Extend current session
  const extendCurrentSession = useCallback((): boolean => {
    if (!user) {
      return false
    }

    const success = extendSession(user.id)
    if (success) {
      refreshSessionInfo()
    }
    return success
  }, [user, refreshSessionInfo])

  // Set up session validation when user is authenticated
  useEffect(() => {
    if (!user) {
      return
    }

    const cleanup = setupSessionValidation(
      // On session expired
      () => {
        logout()
      },
      // On session warning (optional)
      (timeLeft: number) => {
        console.warn(`Session expires in ${formatTimeUntilExpiry(timeLeft)}`)
        // You could show a toast notification here
      }
    )

    // Update session info periodically
    const updateInterval = setInterval(refreshSessionInfo, 30000) // Every 30 seconds

    return () => {
      cleanup()
      clearInterval(updateInterval)
    }
  }, [user, logout, refreshSessionInfo])

  // Format time until expiry
  const timeUntilExpiryFormatted = formatTimeUntilExpiry(sessionInfo.timeUntilExpiry)

  return {
    sessionInfo,
    timeUntilExpiryFormatted,
    extendCurrentSession,
    refreshSessionInfo
  }
}

/**
 * Hook for showing session warnings
 */
export const useSessionWarning = (
  onWarning?: (timeLeft: number) => void,
  onExpired?: () => void
) => {
  const { sessionInfo } = useSession()
  const [warningShown, setWarningShown] = useState(false)

  useEffect(() => {
    if (sessionInfo.isExpired && onExpired) {
      onExpired()
      return
    }

    if (sessionInfo.shouldWarn && !warningShown && onWarning) {
      setWarningShown(true)
      onWarning(sessionInfo.timeUntilExpiry)
    }

    // Reset warning when session is extended
    if (!sessionInfo.shouldWarn && warningShown) {
      setWarningShown(false)
    }
  }, [sessionInfo, warningShown, onWarning, onExpired])

  return {
    shouldShowWarning: sessionInfo.shouldWarn,
    isExpired: sessionInfo.isExpired,
    timeLeft: sessionInfo.timeUntilExpiry
  }
}