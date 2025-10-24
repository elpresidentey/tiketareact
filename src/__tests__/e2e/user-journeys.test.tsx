import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render as rtlRender } from '@testing-library/react'
import App from '../../App'
import { useAuthStore } from '../../store/authStore'

// Custom render for e2e tests that doesn't add extra router
const render = (ui: React.ReactElement) => {
  return rtlRender(ui)
}

// Mock notifications
vi.mock('../../utils/notifications', () => ({
  notifyOperation: {
    loginSuccess: vi.fn(),
    loginError: vi.fn(),
    signupSuccess: vi.fn(),
    ticketCreated: vi.fn(),
    ticketUpdated: vi.fn(),
    ticketDeleted: vi.fn(),
  }
}))

describe.skip('End-to-End User Journeys', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset auth store
    useAuthStore.getState().logout()
  })

  describe('Complete User Journey: Login to Ticket Management', () => {
    it('allows user to login and manage tickets', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      // Step 1: User starts on landing page
      expect(screen.getByText(/manage your tickets/i)).toBeInTheDocument()
      
      // Step 2: Navigate to login
      await user.click(screen.getByText(/login/i))
      
      // Step 3: Login with valid credentials
      await user.type(screen.getByLabelText(/email address/i), 'demo@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      // Step 4: Verify redirect to dashboard
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })
      
      // Step 5: Navigate to ticket management
      await user.click(screen.getByText(/manage tickets/i))
      
      // Step 6: Create a new ticket
      await user.click(screen.getByText(/create ticket/i))
      await user.type(screen.getByLabelText(/title/i), 'E2E Test Ticket')
      await user.type(screen.getByLabelText(/description/i), 'Created during E2E test')
      await user.click(screen.getByRole('button', { name: /create ticket/i }))
      
      // Step 7: Verify ticket appears in list
      await waitFor(() => {
        expect(screen.getByText('E2E Test Ticket')).toBeInTheDocument()
      })
    })
  })

  describe('New User Registration Journey', () => {
    it('allows new user to register and access the app', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      // Step 1: Navigate to signup from landing page
      await user.click(screen.getByText(/get started/i))
      await user.click(screen.getByText(/sign up here/i))
      
      // Step 2: Fill registration form
      await user.type(screen.getByLabelText(/full name/i), 'E2E Test User')
      await user.type(screen.getByLabelText(/email address/i), 'e2etest@example.com')
      await user.type(screen.getByLabelText(/^password/i), 'testpassword123')
      await user.type(screen.getByLabelText(/confirm password/i), 'testpassword123')
      
      // Step 3: Submit registration
      await user.click(screen.getByRole('button', { name: /create account/i }))
      
      // Step 4: Verify automatic login and redirect to dashboard
      await waitFor(() => {
        expect(screen.getByText(/welcome/i)).toBeInTheDocument()
        expect(screen.getByText('E2E Test User')).toBeInTheDocument()
      })
    })
  })

  describe('Ticket Lifecycle Journey', () => {
    it('manages complete ticket lifecycle from creation to deletion', async () => {
      const user = userEvent.setup()
      
      // Pre-authenticate user
      useAuthStore.setState({
        user: { 
          id: '1', 
          email: 'test@example.com', 
          name: 'Test User', 
          role: 'user', 
          createdAt: new Date() 
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      
      render(<App />)
      
      // Step 1: Navigate to ticket management
      await user.click(screen.getByText(/manage tickets/i))
      
      // Step 2: Create ticket
      await user.click(screen.getByText(/create ticket/i))
      await user.type(screen.getByLabelText(/title/i), 'Lifecycle Test Ticket')
      await user.type(screen.getByLabelText(/description/i), 'Testing complete lifecycle')
      await user.click(screen.getByRole('button', { name: /create ticket/i }))
      
      // Step 3: Edit ticket
      await waitFor(() => {
        expect(screen.getByText('Lifecycle Test Ticket')).toBeInTheDocument()
      })
      
      const editButton = screen.getByTitle('Edit ticket')
      await user.click(editButton)
      
      const titleInput = screen.getByDisplayValue('Lifecycle Test Ticket')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Lifecycle Ticket')
      await user.click(screen.getByRole('button', { name: /save changes/i }))
      
      // Step 4: Change status
      await waitFor(() => {
        expect(screen.getByText('Updated Lifecycle Ticket')).toBeInTheDocument()
      })
      
      const statusSelect = screen.getByDisplayValue('Open')
      await user.selectOptions(statusSelect, 'closed')
      
      // Step 5: Delete ticket
      const deleteButton = screen.getByTitle('Delete ticket')
      await user.click(deleteButton)
      await user.click(screen.getByText('Delete'))
      
      // Step 6: Verify ticket is removed
      await waitFor(() => {
        expect(screen.queryByText('Updated Lifecycle Ticket')).not.toBeInTheDocument()
      })
    })
  })
})