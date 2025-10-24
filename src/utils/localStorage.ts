import { User, Ticket } from '../types'

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ticket_app_auth_token',
  USER_DATA: 'ticket_app_user_data',
  TICKETS: 'ticket_app_tickets',
  THEME: 'ticket_app_theme'
} as const

// Generic localStorage utilities
export const storage = {
  // Get item from localStorage with error handling
  getItem: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error)
      return null
    }
  },

  // Set item in localStorage with error handling
  setItem: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error)
      return false
    }
  },

  // Remove item from localStorage
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing from localStorage key "${key}":`, error)
      return false
    }
  },

  // Clear all localStorage
  clear: (): boolean => {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  }
}

// Authentication-specific localStorage functions
export const authStorage = {
  // Get authentication token
  getToken: (): string | null => {
    return storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN)
  },

  // Set authentication token
  setToken: (token: string): boolean => {
    return storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
  },

  // Remove authentication token
  removeToken: (): boolean => {
    return storage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  },

  // Get user data
  getUser: (): User | null => {
    return storage.getItem<User>(STORAGE_KEYS.USER_DATA)
  },

  // Set user data
  setUser: (user: User): boolean => {
    return storage.setItem(STORAGE_KEYS.USER_DATA, user)
  },

  // Remove user data
  removeUser: (): boolean => {
    return storage.removeItem(STORAGE_KEYS.USER_DATA)
  },

  // Clear all authentication data
  clearAuth: (): boolean => {
    const tokenRemoved = authStorage.removeToken()
    const userRemoved = authStorage.removeUser()
    return tokenRemoved && userRemoved
  }
}

// Ticket-specific localStorage functions
export const ticketStorage = {
  // Get all tickets
  getTickets: (): Ticket[] => {
    return storage.getItem<Ticket[]>(STORAGE_KEYS.TICKETS) || []
  },

  // Set all tickets
  setTickets: (tickets: Ticket[]): boolean => {
    return storage.setItem(STORAGE_KEYS.TICKETS, tickets)
  },

  // Add a new ticket
  addTicket: (ticket: Ticket): boolean => {
    const tickets = ticketStorage.getTickets()
    tickets.push(ticket)
    return ticketStorage.setTickets(tickets)
  },

  // Update an existing ticket
  updateTicket: (ticketId: string, updates: Partial<Ticket>): boolean => {
    const tickets = ticketStorage.getTickets()
    const ticketIndex = tickets.findIndex(t => t.id === ticketId)
    
    if (ticketIndex === -1) {
      console.error(`Ticket with ID "${ticketId}" not found`)
      return false
    }

    tickets[ticketIndex] = { 
      ...tickets[ticketIndex], 
      ...updates,
      updatedAt: new Date()
    }
    
    return ticketStorage.setTickets(tickets)
  },

  // Delete a ticket
  deleteTicket: (ticketId: string): boolean => {
    const tickets = ticketStorage.getTickets()
    const filteredTickets = tickets.filter(t => t.id !== ticketId)
    
    if (filteredTickets.length === tickets.length) {
      console.error(`Ticket with ID "${ticketId}" not found`)
      return false
    }
    
    return ticketStorage.setTickets(filteredTickets)
  },

  // Get a specific ticket by ID
  getTicketById: (ticketId: string): Ticket | null => {
    const tickets = ticketStorage.getTickets()
    return tickets.find(t => t.id === ticketId) || null
  },

  // Clear all tickets
  clearTickets: (): boolean => {
    return storage.removeItem(STORAGE_KEYS.TICKETS)
  }
}

// Utility function to check if localStorage is available
export const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}