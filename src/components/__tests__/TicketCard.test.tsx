import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, mockTicket } from '../../test/utils'
import TicketCard from '../TicketCard'

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '2 hours ago')
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  }
}))

describe('TicketCard', () => {
  const mockProps = {
    ticket: mockTicket,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onStatusChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders ticket information correctly', () => {
    render(<TicketCard {...mockProps} />)
    
    expect(screen.getByText(mockTicket.title)).toBeInTheDocument()
    expect(screen.getByText(`ID: ${mockTicket.id}`)).toBeInTheDocument()
    expect(screen.getByText(mockTicket.description)).toBeInTheDocument()
  })

  it('displays correct status badge', () => {
    render(<TicketCard {...mockProps} />)
    
    const statusSelect = screen.getByDisplayValue('Open')
    expect(statusSelect).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup()
    render(<TicketCard {...mockProps} />)
    
    const editButton = screen.getByTitle('Edit ticket')
    await user.click(editButton)
    
    expect(mockProps.onEdit).toHaveBeenCalledWith(mockTicket)
  })

  it('shows delete confirmation dialog when delete button is clicked', async () => {
    const user = userEvent.setup()
    render(<TicketCard {...mockProps} />)
    
    const deleteButton = screen.getByTitle('Delete ticket')
    await user.click(deleteButton)
    
    expect(screen.getByText(/delete ticket/i)).toBeInTheDocument()
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
  })

  it('calls onDelete when deletion is confirmed', async () => {
    const user = userEvent.setup()
    mockProps.onDelete.mockResolvedValue(true)
    
    render(<TicketCard {...mockProps} />)
    
    // Click delete button
    await user.click(screen.getByTitle('Delete ticket'))
    
    // Confirm deletion
    await user.click(screen.getByText('Delete'))
    
    await waitFor(() => {
      expect(mockProps.onDelete).toHaveBeenCalledWith(mockTicket.id)
    })
  })

  it('calls onStatusChange when status is changed', async () => {
    const user = userEvent.setup()
    render(<TicketCard {...mockProps} />)
    
    const statusSelect = screen.getByDisplayValue('Open')
    await user.selectOptions(statusSelect, 'closed')
    
    expect(mockProps.onStatusChange).toHaveBeenCalledWith(mockTicket.id, 'closed')
  })

  it('renders without action buttons when handlers are not provided', () => {
    render(<TicketCard ticket={mockTicket} />)
    
    expect(screen.queryByTitle('Edit ticket')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Delete ticket')).not.toBeInTheDocument()
  })

  it('displays priority badge correctly', () => {
    const ticketWithPriority = {
      ...mockTicket,
      priority: 'high' as const
    }
    
    render(<TicketCard ticket={ticketWithPriority} />)
    
    expect(screen.getByText(/high priority/i)).toBeInTheDocument()
  })

  it('displays tags when present', () => {
    const ticketWithTags = {
      ...mockTicket,
      tags: ['bug', 'urgent']
    }
    
    render(<TicketCard ticket={ticketWithTags} />)
    
    expect(screen.getByText('#bug')).toBeInTheDocument()
    expect(screen.getByText('#urgent')).toBeInTheDocument()
  })
})