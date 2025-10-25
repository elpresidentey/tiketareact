import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { useAuthStore } from '../store/authStore'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: { email: string; password: string }) => Promise<boolean>
  signup: (data: { email: string; password: string; confirmPassword: string; name: string }) => Promise<boolean>
  logout: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    checkAuth,
    clearError
  } = useAuthStore()

  // Check authentication status on mount and set up session validation
  useEffect(() => {
    checkAuth()

    // Set up periodic session validation (every 5 minutes)
    const sessionCheckInterval = setInterval(() => {
      if (isAuthenticated) {
        checkAuth()
      }
    }, 5 * 60 * 1000) // 5 minutes

    // Cleanup interval on unmount
    return () => {
      clearInterval(sessionCheckInterval)
    }
  }, [checkAuth, isAuthenticated])

  // Listen for storage events to handle logout in other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // If auth token was removed in another tab, logout here too
      if (event.key === 'ticketapp_session' && event.newValue === null) {
        logout()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [logout])

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    clearError
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}