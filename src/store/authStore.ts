import { create } from 'zustand'
import { User, LoginCredentials, SignupData } from '../types'
import { authStorage } from '../utils/localStorage'
import { loginSchema, signupSchema } from '../schemas/validation'
import { withNetworkSimulation } from '../utils/networkSimulation'
import { TicketAppError, ErrorCategory, ErrorSeverity } from '../constants/errors'

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<boolean>
  signup: (data: SignupData) => Promise<boolean>
  logout: () => void
  checkAuth: () => void
  clearError: () => void
  setLoading: (loading: boolean) => void
}

type AuthStore = AuthState & AuthActions

// Mock user database for demo purposes (in real app, this would be an API)
const MOCK_USERS = [
  {
    id: '1',
    email: 'demo@example.com',
    password: 'password123',
    name: 'Demo User',
    role: 'user' as const,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin' as const,
    createdAt: new Date('2024-01-01')
  }
]

// Generate a simple session token
const generateSessionToken = (userId: string): string => {
  return `session_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Validate session token format
const isValidSessionToken = (token: string): boolean => {
  return token.startsWith('session_') && token.split('_').length === 4
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  login: async (credentials: LoginCredentials): Promise<boolean> => {
    set({ isLoading: true, error: null })

    try {
      // Validate input
      const validatedCredentials = loginSchema.parse(credentials)

      // Simulate network request with error handling
      const result = await withNetworkSimulation(async () => {
        // Find user in mock database
        const mockUser = MOCK_USERS.find(
          user => user.email === validatedCredentials.email && 
                  user.password === validatedCredentials.password
        )

        if (!mockUser) {
          throw new TicketAppError(
            'Invalid email or password',
            'INVALID_CREDENTIALS',
            ErrorCategory.AUTHENTICATION,
            ErrorSeverity.HIGH
          )
        }

        // Create user object without password
        const user: User = {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          createdAt: mockUser.createdAt
        }

        // Generate session token
        const sessionToken = generateSessionToken(user.id)

        // Store in localStorage
        const tokenStored = authStorage.setToken(sessionToken)
        const userStored = authStorage.setUser(user)

        if (!tokenStored || !userStored) {
          throw new TicketAppError(
            'Failed to save session. Please try again.',
            'STORAGE_ERROR',
            ErrorCategory.STORAGE,
            ErrorSeverity.MEDIUM
          )
        }

        return user
      }, 'Login')

      // Update state
      set({
        user: result,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })

      return true
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.'
      
      if (error instanceof TicketAppError) {
        errorMessage = error.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      set({ 
        isLoading: false, 
        error: errorMessage 
      })
      return false
    }
  },

  signup: async (data: SignupData): Promise<boolean> => {
    set({ isLoading: true, error: null })

    try {
      // Validate input
      const validatedData = signupSchema.parse(data)

      // Simulate network request with error handling
      const result = await withNetworkSimulation(async () => {
        // Check if user already exists
        const existingUser = MOCK_USERS.find(
          user => user.email === validatedData.email
        )

        if (existingUser) {
          throw new TicketAppError(
            'An account with this email already exists',
            'USER_EXISTS',
            ErrorCategory.AUTHENTICATION,
            ErrorSeverity.MEDIUM
          )
        }

        // Create new user
        const newUser: User = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email: validatedData.email,
          name: validatedData.name,
          role: 'user',
          createdAt: new Date()
        }

        // Add to mock database (in real app, this would be an API call)
        MOCK_USERS.push({
          ...newUser,
          password: validatedData.password
        })

        // Generate session token
        const sessionToken = generateSessionToken(newUser.id)

        // Store in localStorage
        const tokenStored = authStorage.setToken(sessionToken)
        const userStored = authStorage.setUser(newUser)

        if (!tokenStored || !userStored) {
          throw new TicketAppError(
            'Failed to save session. Please try again.',
            'STORAGE_ERROR',
            ErrorCategory.STORAGE,
            ErrorSeverity.MEDIUM
          )
        }

        return newUser
      }, 'Signup')

      // Update state
      set({
        user: result,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })

      return true
    } catch (error) {
      let errorMessage = 'Signup failed. Please try again.'
      
      if (error instanceof TicketAppError) {
        errorMessage = error.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      set({ 
        isLoading: false, 
        error: errorMessage 
      })
      return false
    }
  },

  logout: () => {
    // Clear localStorage
    authStorage.clearAuth()

    // Reset state
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    })
  },

  checkAuth: () => {
    set({ isLoading: true })

    try {
      // Get stored token and user
      const token = authStorage.getToken()
      const user = authStorage.getUser()

      // Validate session
      if (!token || !user || !isValidSessionToken(token)) {
        // Invalid session, clear everything
        authStorage.clearAuth()
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        })
        return
      }

      // Check if token is expired (24 hours)
      const tokenParts = token.split('_')
      const tokenTimestamp = parseInt(tokenParts[2])
      const now = Date.now()
      const twentyFourHours = 24 * 60 * 60 * 1000

      if (now - tokenTimestamp > twentyFourHours) {
        // Token expired, logout
        get().logout()
        return
      }

      // Valid session
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.error('Auth check failed:', error)
      // Clear invalid session
      authStorage.clearAuth()
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })
    }
  },

  clearError: () => {
    set({ error: null })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  }
}))