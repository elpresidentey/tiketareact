import { create } from 'zustand'
import { Ticket, CreateTicketData } from '../types'
import { ticketStorage, isLocalStorageAvailable } from '../utils/localStorage'
import { ERROR_MESSAGES, TicketAppError, ErrorCategory, ErrorSeverity } from '../constants/errors'
import { withNetworkSimulation } from '../utils/networkSimulation'

export interface TicketState {
  tickets: Ticket[]
  isLoading: boolean
  error: string | null
}

export interface TicketActions {
  // CRUD operations
  createTicket: (ticketData: CreateTicketData) => Promise<Ticket>
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<Ticket>
  deleteTicket: (id: string) => Promise<void>
  loadTickets: () => Promise<void>
  
  // Query operations
  getTicketById: (id: string) => Ticket | undefined
  getTicketsByStatus: (status: Ticket['status']) => Ticket[]
  getTicketStats: () => { total: number; open: number; resolved: number; inProgress: number }
  
  // State management
  clearError: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string) => void
  
  // Legacy methods for backward compatibility
  addTicket: (ticketData: CreateTicketData) => void
}

type TicketStore = TicketState & TicketActions

// Mock initial tickets for demo purposes - used when localStorage is empty
const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'ticket_1',
    title: 'Fix login bug',
    description: 'Users are unable to login with valid credentials',
    status: 'open',
    priority: 'high',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    assignedTo: 'user_1',
    tags: ['bug', 'authentication']
  },
  {
    id: 'ticket_2',
    title: 'Add dark mode support',
    description: 'Implement dark mode theme for better user experience',
    status: 'in_progress',
    priority: 'medium',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-16'),
    assignedTo: 'user_2',
    tags: ['feature', 'ui']
  },
  {
    id: 'ticket_3',
    title: 'Update documentation',
    description: 'Update API documentation with latest changes',
    status: 'closed',
    priority: 'low',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
    assignedTo: 'user_1',
    tags: ['documentation']
  },
  {
    id: 'ticket_4',
    title: 'Performance optimization',
    description: 'Optimize database queries for better performance',
    status: 'open',
    priority: 'high',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    tags: ['performance', 'database']
  },
  {
    id: 'ticket_5',
    title: 'Mobile responsive design',
    description: 'Make the application fully responsive for mobile devices',
    status: 'closed',
    priority: 'medium',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-11'),
    assignedTo: 'user_2',
    tags: ['mobile', 'responsive', 'ui']
  }
]

// Helper function to generate unique ticket ID
const generateTicketId = (): string => {
  return `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Helper function to handle errors consistently
const handleError = (error: unknown, operation: string): string => {
  console.error(`Ticket ${operation} error:`, error)
  
  if (error instanceof TicketAppError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return ERROR_MESSAGES.TICKET.LOAD_FAILED
}

export const useTicketStore = create<TicketStore>((set, get) => ({
  // Initial state - will be loaded from localStorage
  tickets: [],
  isLoading: false,
  error: null,

  // Load tickets from localStorage
  loadTickets: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const tickets = await withNetworkSimulation(async () => {
        if (!isLocalStorageAvailable()) {
          throw new TicketAppError(
            ERROR_MESSAGES.SYSTEM.STORAGE_UNAVAILABLE,
            'STORAGE_UNAVAILABLE',
            ErrorCategory.STORAGE,
            ErrorSeverity.HIGH
          )
        }

        const storedTickets = ticketStorage.getTickets()
        
        // If no tickets in storage, initialize with demo data
        if (storedTickets.length === 0) {
          const success = ticketStorage.setTickets(INITIAL_TICKETS)
          if (!success) {
            throw new TicketAppError(
              ERROR_MESSAGES.SYSTEM.STORAGE_ERROR,
              'STORAGE_WRITE_ERROR',
              ErrorCategory.STORAGE,
              ErrorSeverity.MEDIUM
            )
          }
          return INITIAL_TICKETS
        } else {
          // Convert date strings back to Date objects
          return storedTickets.map(ticket => ({
            ...ticket,
            createdAt: new Date(ticket.createdAt),
            updatedAt: new Date(ticket.updatedAt)
          }))
        }
      }, 'Load tickets')

      set({ tickets, isLoading: false })
    } catch (error) {
      const errorMessage = handleError(error, 'load')
      set({ error: errorMessage, isLoading: false })
    }
  },

  // Create a new ticket
  createTicket: async (ticketData: CreateTicketData) => {
    set({ isLoading: true, error: null })
    
    try {
      const newTicket = await withNetworkSimulation(async () => {
        if (!isLocalStorageAvailable()) {
          throw new TicketAppError(
            ERROR_MESSAGES.SYSTEM.STORAGE_UNAVAILABLE,
            'STORAGE_UNAVAILABLE',
            ErrorCategory.STORAGE,
            ErrorSeverity.HIGH
          )
        }

        const ticket: Ticket = {
          id: generateTicketId(),
          ...ticketData,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ticketData.tags || []
        }

        const success = ticketStorage.addTicket(ticket)
        if (!success) {
          throw new TicketAppError(
            ERROR_MESSAGES.TICKET.CREATE_FAILED,
            'CREATE_FAILED',
            ErrorCategory.STORAGE,
            ErrorSeverity.MEDIUM
          )
        }

        return ticket
      }, 'Create ticket')

      set(state => ({
        tickets: [...state.tickets, newTicket],
        isLoading: false,
        error: null
      }))

      return newTicket
    } catch (error) {
      const errorMessage = handleError(error, 'create')
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  // Update an existing ticket
  updateTicket: async (id: string, updates: Partial<Ticket>) => {
    set({ isLoading: true, error: null })
    
    try {
      if (!isLocalStorageAvailable()) {
        throw new TicketAppError(
          ERROR_MESSAGES.SYSTEM.STORAGE_UNAVAILABLE,
          'STORAGE_UNAVAILABLE',
          ErrorCategory.STORAGE,
          ErrorSeverity.HIGH
        )
      }

      const currentTicket = get().tickets.find(ticket => ticket.id === id)
      if (!currentTicket) {
        throw new TicketAppError(
          ERROR_MESSAGES.TICKET.NOT_FOUND,
          'TICKET_NOT_FOUND',
          ErrorCategory.VALIDATION,
          ErrorSeverity.MEDIUM
        )
      }

      const updatedTicket = {
        ...currentTicket,
        ...updates,
        updatedAt: new Date()
      }

      const success = ticketStorage.updateTicket(id, updates)
      if (!success) {
        throw new TicketAppError(
          ERROR_MESSAGES.TICKET.UPDATE_FAILED,
          'UPDATE_FAILED',
          ErrorCategory.STORAGE,
          ErrorSeverity.MEDIUM
        )
      }

      set(state => ({
        tickets: state.tickets.map(ticket =>
          ticket.id === id ? updatedTicket : ticket
        ),
        isLoading: false,
        error: null
      }))

      return updatedTicket
    } catch (error) {
      const errorMessage = handleError(error, 'update')
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  // Delete a ticket
  deleteTicket: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      if (!isLocalStorageAvailable()) {
        throw new TicketAppError(
          ERROR_MESSAGES.SYSTEM.STORAGE_UNAVAILABLE,
          'STORAGE_UNAVAILABLE',
          ErrorCategory.STORAGE,
          ErrorSeverity.HIGH
        )
      }

      const ticketExists = get().tickets.some(ticket => ticket.id === id)
      if (!ticketExists) {
        throw new TicketAppError(
          ERROR_MESSAGES.TICKET.NOT_FOUND,
          'TICKET_NOT_FOUND',
          ErrorCategory.VALIDATION,
          ErrorSeverity.MEDIUM
        )
      }

      const success = ticketStorage.deleteTicket(id)
      if (!success) {
        throw new TicketAppError(
          ERROR_MESSAGES.TICKET.DELETE_FAILED,
          'DELETE_FAILED',
          ErrorCategory.STORAGE,
          ErrorSeverity.MEDIUM
        )
      }

      set(state => ({
        tickets: state.tickets.filter(ticket => ticket.id !== id),
        isLoading: false,
        error: null
      }))
    } catch (error) {
      const errorMessage = handleError(error, 'delete')
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  // Query operations (synchronous)
  getTicketById: (id: string) => {
    return get().tickets.find(ticket => ticket.id === id)
  },

  getTicketsByStatus: (status: Ticket['status']) => {
    return get().tickets.filter(ticket => ticket.status === status)
  },

  getTicketStats: () => {
    const tickets = get().tickets
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      resolved: tickets.filter(t => t.status === 'closed').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length
    }
  },

  // State management
  clearError: () => {
    set({ error: null })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  setError: (error: string) => {
    set({ error })
  },

  // Legacy method for backward compatibility
  addTicket: (ticketData: CreateTicketData) => {
    // Call the async version but don't await it for backward compatibility
    get().createTicket(ticketData).catch(error => {
      console.error('Legacy addTicket error:', error)
    })
  }
}))