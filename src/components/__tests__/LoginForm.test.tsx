import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'
import { useAuthStore } from '../../store/authStore'

// Mock the auth store
vi.mock('../../store/authStore')
vi.mock('../../utils/notifications', () => ({
  notifyOperation: {
    loginSuccess: vi.fn(),
    loginError: vi.fn(),
  }
}))

const mockAuthStore = {
  login: vi.fn(),
  isLoading: false,
  error: null,
  clearError: vi.fn(),
  checkAuth: vi.fn(),
  logout: vi.fn(),
  signup: vi.fn(),
  setLoading: vi.fn(),
  user: null,
  isAuthenticated: false,
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore)
  })

  it('renders login form with all required fields', () => {
    render(<LoginForm />)
    
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('displays demo credentials', () => {
    render(<LoginForm />)
    
    expect(screen.getByText(/demo credentials/i)).toBeInTheDocument()
    expect(screen.getByText(/demo@example.com/)).toBeInTheDocument()
    expect(screen.getByText(/admin@example.com/)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'invalid-email')
    await user.tab()
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    mockAuthStore.login.mockResolvedValue(true)
    
    render(<LoginForm onSuccess={onSuccess} />)
    
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(mockAuthStore.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    vi.mocked(useAuthStore).mockReturnValue({
      ...mockAuthStore,
      isLoading: true
    })
    
    render(<LoginForm />)
    
    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  it('displays error message when login fails', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      ...mockAuthStore,
      error: 'Invalid credentials'
    })
    
    render(<LoginForm />)
    
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
  })

  it('calls onSwitchToSignup when signup link is clicked', async () => {
    const user = userEvent.setup()
    const onSwitchToSignup = vi.fn()
    
    render(<LoginForm onSwitchToSignup={onSwitchToSignup} />)
    
    await user.click(screen.getByText(/sign up here/i))
    
    expect(onSwitchToSignup).toHaveBeenCalled()
  })
})