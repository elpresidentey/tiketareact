import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore } from '../authStore'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

// Mock network simulation
vi.mock('../../utils/networkSimulation', () => ({
  withNetworkSimulation: vi.fn((fn) => fn())
}))

// Mock localStorage utilities
vi.mock('../../utils/localStorage', () => ({
  authStorage: {
    getToken: vi.fn(),
    setToken: vi.fn(() => true),
    getUser: vi.fn(),
    setUser: vi.fn(() => true),
    clearAuth: vi.fn(),
  },
  isLocalStorageAvailable: vi.fn(() => true),
}))

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  })

  describe('login', () => {
    it('successfully logs in with valid credentials', async () => {
      const store = useAuthStore.getState()
      
      const result = await store.login({
        email: 'demo@example.com',
        password: 'password123'
      })
      
      expect(result).toBe(true)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      expect(useAuthStore.getState().user).toMatchObject({
        email: 'demo@example.com',
        name: 'Demo User'
      })
    })

    it('fails login with invalid credentials', async () => {
      const store = useAuthStore.getState()
      
      const result = await store.login({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      })
      
      expect(result).toBe(false)
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().error).toContain('Invalid email or password')
    })

    it('sets loading state during login', async () => {
      const store = useAuthStore.getState()
      
      // Start login (don't await yet)
      const loginPromise = store.login({
        email: 'demo@example.com',
        password: 'password123'
      })
      
      // Check loading state is true
      expect(useAuthStore.getState().isLoading).toBe(true)
      
      // Wait for completion
      await loginPromise
      
      // Check loading state is false
      expect(useAuthStore.getState().isLoading).toBe(false)
    })
  })

  describe('signup', () => {
    it('successfully creates new user account', async () => {
      const store = useAuthStore.getState()
      
      const result = await store.signup({
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        name: 'New User'
      })
      
      expect(result).toBe(true)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      expect(useAuthStore.getState().user).toMatchObject({
        email: 'newuser@example.com',
        name: 'New User'
      })
    })

    it('fails signup with existing email', async () => {
      const store = useAuthStore.getState()
      
      const result = await store.signup({
        email: 'demo@example.com', // Already exists
        password: 'password123',
        confirmPassword: 'password123',
        name: 'Test User'
      })
      
      expect(result).toBe(false)
      expect(useAuthStore.getState().error).toContain('already exists')
    })
  })

  describe('logout', () => {
    it('clears user state and localStorage', () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: { id: '1', email: 'test@example.com', name: 'Test', role: 'user', createdAt: new Date() },
        isAuthenticated: true,
      })
      
      const store = useAuthStore.getState()
      store.logout()
      
      expect(useAuthStore.getState().user).toBe(null)
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  describe('clearError', () => {
    it('clears error state', () => {
      useAuthStore.setState({ error: 'Some error' })
      
      const store = useAuthStore.getState()
      store.clearError()
      
      expect(useAuthStore.getState().error).toBe(null)
    })
  })
})