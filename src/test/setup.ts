import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'

// Create a persistent localStorage mock
const localStorageMock = {
  store: new Map<string, string>(),
  getItem: vi.fn((key: string) => localStorageMock.store.get(key) || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store.set(key, value)
  }),
  removeItem: vi.fn((key: string) => {
    localStorageMock.store.delete(key)
  }),
  clear: vi.fn(() => {
    localStorageMock.store.clear()
  }),
  length: 0,
  key: vi.fn(),
}

// Set up localStorage mock globally
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock the localStorage utility functions
vi.mock('../utils/localStorage', () => ({
  storage: {
    getItem: vi.fn((key: string) => {
      const item = localStorageMock.store.get(key)
      return item ? JSON.parse(item) : null
    }),
    setItem: vi.fn((key: string, value: any) => {
      localStorageMock.store.set(key, JSON.stringify(value))
      return true
    }),
    removeItem: vi.fn((key: string) => {
      localStorageMock.store.delete(key)
      return true
    }),
    clear: vi.fn(() => {
      localStorageMock.store.clear()
      return true
    }),
  },
  authStorage: {
    getToken: vi.fn(() => localStorageMock.store.get('ticket_app_auth_token') || null),
    setToken: vi.fn((token: string) => {
      localStorageMock.store.set('ticket_app_auth_token', token)
      return true
    }),
    removeToken: vi.fn(() => {
      localStorageMock.store.delete('ticket_app_auth_token')
      return true
    }),
    getUser: vi.fn(() => {
      const user = localStorageMock.store.get('ticket_app_user_data')
      return user ? JSON.parse(user) : null
    }),
    setUser: vi.fn((user: any) => {
      localStorageMock.store.set('ticket_app_user_data', JSON.stringify(user))
      return true
    }),
    removeUser: vi.fn(() => {
      localStorageMock.store.delete('ticket_app_user_data')
      return true
    }),
    clearAuth: vi.fn(() => {
      localStorageMock.store.delete('ticket_app_auth_token')
      localStorageMock.store.delete('ticket_app_user_data')
      return true
    }),
  },
  ticketStorage: {
    getTickets: vi.fn(() => {
      const tickets = localStorageMock.store.get('ticket_app_tickets')
      return tickets ? JSON.parse(tickets) : []
    }),
    setTickets: vi.fn((tickets: any[]) => {
      localStorageMock.store.set('ticket_app_tickets', JSON.stringify(tickets))
      return true
    }),
    addTicket: vi.fn((ticket: any) => {
      const tickets = JSON.parse(localStorageMock.store.get('ticket_app_tickets') || '[]')
      tickets.push(ticket)
      localStorageMock.store.set('ticket_app_tickets', JSON.stringify(tickets))
      return true
    }),
    updateTicket: vi.fn((ticketId: string, updates: any) => {
      const tickets = JSON.parse(localStorageMock.store.get('ticket_app_tickets') || '[]')
      const index = tickets.findIndex((t: any) => t.id === ticketId)
      if (index !== -1) {
        tickets[index] = { ...tickets[index], ...updates, updatedAt: new Date() }
        localStorageMock.store.set('ticket_app_tickets', JSON.stringify(tickets))
        return true
      }
      return false
    }),
    deleteTicket: vi.fn((ticketId: string) => {
      const tickets = JSON.parse(localStorageMock.store.get('ticket_app_tickets') || '[]')
      const filtered = tickets.filter((t: any) => t.id !== ticketId)
      if (filtered.length !== tickets.length) {
        localStorageMock.store.set('ticket_app_tickets', JSON.stringify(filtered))
        return true
      }
      return false
    }),
    getTicketById: vi.fn((ticketId: string) => {
      const tickets = JSON.parse(localStorageMock.store.get('ticket_app_tickets') || '[]')
      return tickets.find((t: any) => t.id === ticketId) || null
    }),
    clearTickets: vi.fn(() => {
      localStorageMock.store.delete('ticket_app_tickets')
      return true
    }),
  },
  isLocalStorageAvailable: vi.fn(() => true),
  STORAGE_KEYS: {
    AUTH_TOKEN: 'ticket_app_auth_token',
    USER_DATA: 'ticket_app_user_data',
    TICKETS: 'ticket_app_tickets',
    THEME: 'ticket_app_theme',
  },
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Cleanup after each test
afterEach(() => {
  cleanup()
  // Clear the mock localStorage store
  localStorageMock.store.clear()
})

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.store.clear()
})