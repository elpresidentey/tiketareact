import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { render } from '../../test/utils'
import TicketManagementPage from '../../pages/TicketManagementPage'
import { useTickets } from '../../hooks/useTickets'
import { useAuthStore } from '../../store/authStore'

// Mock the hooks
vi.mock('../../hooks/useTickets')
vi.mock('../../utils/notifications', () => ({
  notifyOperation: {
    ticketCreated: vi.fn(),
    ticketUpdated: vi.fn(),
    ticketDeleted: vi.fn(),
    ticketCreateError: vi.fn(),
    ticketUpdateError: vi.fn(),
    ticketDeleteError: vi.fn(),
    operationSuccess: vi.fn(),
    operationError: vi.fn(),
    logoutSuccess: vi.fn(),
  }
}))

const mockTickets = [
  {
    id: '1',
    title: 'Test Ticket 1',
    description: 'Description 1',
    status: 'open' as const,
    priority: 'medium' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: '1',
    tags: ['test']
  },
  {
    id: '2',
    title: 'Test Ticket 2',
    description: 'Description 2',
    status: 'closed' as const,
    priority: 'high' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: '1',
    tags: ['test', 'closed']
  },
  {
    id: '3',
    title: 'Test Ticket 3',
    description: 'Description 3',
    status: 'in_progress' as const,
    priority: 'low' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: '1',
    tags: ['test', 'progress']
  }
]

const mockTicketHooks = {
  tickets: mockTickets,
  isLoading: false,
  error: null,
  createTicket: vi.fn(),
  updateTicket: vi.fn(),
  deleteTicket: vi.fn(),
  refreshTickets: vi.fn(),
  getTicketById: vi.fn(),
  getTicketsByStatus: vi.fn(),
  getTicketStats: vi.fn(() => ({
    total: mockTickets.length,
    open: mockTickets.filter(t => t.status === 'open').length,
    resolved: mockTickets.filter(t => t.status === 'closed').length,
    inProgress: mockTickets.filter(t => t.status === 'in_progress').length,
  })),
  clearError: vi.fn(),
  setError: vi.fn(),
}

describe('Ticket CRUD Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTickets).mockReturnValue(mockTicketHooks)
    
    // Set authenticated user
    useAuthStore.setState({
      user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'user', createdAt: new Date() },
      isAuthenticated: true,
      isLoading: false,
      error: null,
    })
  })

  describe('Ticket Creation', () => {
    it('creates a new ticket successfully', async () => {
      const user = userEvent.setup()
      mockTicketHooks.createTicket.mockResolvedValue({
        id: '4',
        title: 'New Test Ticket',
        description: 'New ticket description',
        status: 'open' as const,
        priority: 'medium' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: '1',
        tags: []
      })
      
      render(<TicketManagementPage />)
      
      // Click create ticket button (New Ticket)
      await user.click(screen.getByText(/new ticket/i))
      
      // Fill in the form
      await user.type(screen.getByLabelText(/title/i), 'New Test Ticket')
      await user.type(screen.getByLabelText(/description/i), 'New ticket description')
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /create ticket/i }))
      
      await waitFor(() => {
        expect(mockTicketHooks.createTicket).toHaveBeenCalledWith({
          title: 'New Test Ticket',
          description: 'New ticket description',
          status: 'open',
          priority: 'medium',
          tags: []
        })
      })
    })

    it('validates required fields when creating ticket', async () => {
      const user = userEvent.setup()
      render(<TicketManagementPage />)
      
      // Click create ticket button
      await user.click(screen.getByText(/new ticket/i))
      
      // Try to submit without filling required fields
      await user.click(screen.getByRole('button', { name: /create ticket/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument()
      })
    })
  })

  describe('Ticket Updates', () => {
    it('updates ticket status successfully', async () => {
      const user = userEvent.setup()
      mockTicketHooks.updateTicket.mockResolvedValue({
        id: '1',
        title: 'Test Ticket 1',
        description: 'Description 1',
        status: 'closed' as const,
        priority: 'medium' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: '1',
        tags: ['test']
      })
      
      render(<TicketManagementPage />)
      
      // Find the first ticket's status dropdown by aria-label
      const statusSelect = screen.getByLabelText('Change status for ticket Test Ticket 1')
      await user.selectOptions(statusSelect, 'closed')
      
      await waitFor(() => {
        expect(mockTicketHooks.updateTicket).toHaveBeenCalledWith('1', {
          status: 'closed'
        })
      })
    })

    it('edits ticket details successfully', async () => {
      const user = userEvent.setup()
      mockTicketHooks.updateTicket.mockResolvedValue({
        id: '1',
        title: 'Updated Ticket Title',
        description: 'Description 1',
        status: 'open' as const,
        priority: 'medium' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: '1',
        tags: ['test']
      })
      
      render(<TicketManagementPage />)
      
      // Click edit button on first ticket
      const editButtons = screen.getAllByTitle('Edit ticket')
      await user.click(editButtons[0])
      
      // Update the title
      const titleInput = screen.getByDisplayValue('Test Ticket 1')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Ticket Title')
      
      // Save changes - the button text is "Update Ticket"
      await user.click(screen.getByRole('button', { name: /update ticket/i }))
      
      await waitFor(() => {
        expect(mockTicketHooks.updateTicket).toHaveBeenCalledWith('1', {
          title: 'Updated Ticket Title',
          description: 'Description 1',
          status: 'open',
          priority: 'medium',
          tags: ['test']
        })
      })
    })
  })

  describe('Ticket Deletion', () => {
    it('deletes ticket after confirmation', async () => {
      const user = userEvent.setup()
      mockTicketHooks.deleteTicket.mockResolvedValue(true)
      
      render(<TicketManagementPage />)
      
      // Click delete button on first ticket
      const deleteButtons = screen.getAllByTitle('Delete ticket')
      await user.click(deleteButtons[0])
      
      // Confirm deletion
      await user.click(screen.getByText('Delete'))
      
      await waitFor(() => {
        expect(mockTicketHooks.deleteTicket).toHaveBeenCalledWith('1')
      })
    })

    it('cancels deletion when user clicks cancel', async () => {
      const user = userEvent.setup()
      render(<TicketManagementPage />)
      
      // Click delete button on first ticket
      const deleteButtons = screen.getAllByTitle('Delete ticket')
      await user.click(deleteButtons[0])
      
      // Cancel deletion
      await user.click(screen.getByText('Cancel'))
      
      // Verify delete was not called
      expect(mockTicketHooks.deleteTicket).not.toHaveBeenCalled()
      
      // Verify dialog is closed
      expect(screen.queryByText(/delete ticket/i)).not.toBeInTheDocument()
    })
  })

  describe('Ticket Filtering and Search', () => {
    it('filters tickets by search term', async () => {
      const user = userEvent.setup()
      render(<TicketManagementPage />)
      
      // Type in search box
      const searchInput = screen.getByPlaceholderText(/search tickets/i)
      await user.type(searchInput, 'Test Ticket 1')
      
      // The search is handled locally in TicketList, not through the hook
      expect(searchInput).toHaveValue('Test Ticket 1')
    })

    it('filters tickets by status', async () => {
      const user = userEvent.setup()
      render(<TicketManagementPage />)
      
      // Click on the "Open" status filter button
      const openStatusFilter = screen.getByRole('button', { name: /^open$/i })
      await user.click(openStatusFilter)
      
      // The filter is applied locally, check if the button is now active
      expect(openStatusFilter).toHaveClass('bg-blue-100')
    })
  })
})