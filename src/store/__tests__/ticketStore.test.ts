import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTicketStore } from '../ticketStore'

// Mock localStorage
vi.mock('../../utils/localStorage', () => ({
  ticketStorage: {
    getTickets: vi.fn(() => []),
    setTickets: vi.fn(() => true),
    addTicket: vi.fn(() => true),
    updateTicket: vi.fn(() => true),
    deleteTicket: vi.fn(() => true),
    getTicketById: vi.fn(() => null),
    clearTickets: vi.fn(() => true),
  },
  isLocalStorageAvailable: vi.fn(() => true),
}))

// Mock network simulation
vi.mock('../../utils/networkSimulation', () => ({
  withNetworkSimulation: vi.fn((fn) => fn())
}))

describe('ticketStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store state
    useTicketStore.setState({
      tickets: [],
      isLoading: false,
      error: null,
    })
  })

  describe('createTicket', () => {
    it('creates a new ticket successfully', async () => {
      const store = useTicketStore.getState()
      
      const ticketData = {
        title: 'Test Ticket',
        description: 'Test description',
        status: 'open' as const,
        priority: 'medium' as const,
        tags: ['test']
      }
      
      const result = await store.createTicket(ticketData)
      
      expect(result).toMatchObject(ticketData)
      expect(result.id).toBeDefined()
      expect(useTicketStore.getState().tickets).toHaveLength(1)
      expect(useTicketStore.getState().tickets[0]).toMatchObject(ticketData)
    })

    it('sets loading state during creation', async () => {
      const store = useTicketStore.getState()
      
      const createPromise = store.createTicket({
        title: 'Test Ticket',
        description: 'Test description',
        status: 'open',
        priority: 'medium',
        tags: ['test']
      })
      
      expect(useTicketStore.getState().isLoading).toBe(true)
      
      await createPromise
      
      expect(useTicketStore.getState().isLoading).toBe(false)
    })
  })

  describe('updateTicket', () => {
    it('updates existing ticket successfully', async () => {
      // Add initial ticket
      const initialTicket = {
        id: '1',
        title: 'Original Title',
        description: 'Original description',
        status: 'open' as const,
        priority: 'medium' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: '1',
        tags: ['test']
      }
      
      useTicketStore.setState({ tickets: [initialTicket] })
      
      const store = useTicketStore.getState()
      const result = await store.updateTicket('1', { title: 'Updated Title' })
      
      expect(result.title).toBe('Updated Title')
      expect(result.id).toBe('1')
      expect(useTicketStore.getState().tickets[0].title).toBe('Updated Title')
    })

    it('throws error when updating non-existent ticket', async () => {
      const store = useTicketStore.getState()
      
      await expect(store.updateTicket('nonexistent', { title: 'Updated' })).rejects.toThrow('Ticket not found')
    })
  })

  describe('deleteTicket', () => {
    it('deletes existing ticket successfully', async () => {
      const initialTicket = {
        id: '1',
        title: 'Test Ticket',
        description: 'Test description',
        status: 'open' as const,
        priority: 'medium' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: '1',
        tags: ['test']
      }
      
      useTicketStore.setState({ tickets: [initialTicket] })
      
      const store = useTicketStore.getState()
      await store.deleteTicket('1')
      expect(useTicketStore.getState().tickets).toHaveLength(0)
    })

    it('throws error when deleting non-existent ticket', async () => {
      const store = useTicketStore.getState()
      
      await expect(store.deleteTicket('nonexistent')).rejects.toThrow('Ticket not found')
    })
  })

  describe('loadTickets', () => {
    it('loads tickets from storage', async () => {
      const store = useTicketStore.getState()
      await store.loadTickets()
      
      expect(useTicketStore.getState().isLoading).toBe(false)
    })
  })

  describe('clearError', () => {
    it('clears error state', () => {
      useTicketStore.setState({ error: 'Some error' })
      
      const store = useTicketStore.getState()
      store.clearError()
      
      expect(useTicketStore.getState().error).toBe(null)
    })
  })
})