import { useEffect } from 'react'
import { useTicketStore } from '../store/ticketStore'
import { CreateTicketData, Ticket } from '../types'

/**
 * Custom hook for managing tickets with automatic initialization
 * Provides a clean interface for components to interact with the ticket store
 */
export const useTickets = () => {
  const {
    tickets,
    isLoading,
    error,
    loadTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    getTicketById,
    getTicketsByStatus,
    getTicketStats,
    clearError,
    setError
  } = useTicketStore()

  // Initialize tickets on first mount
  useEffect(() => {
    if (tickets.length === 0 && !isLoading && !error) {
      loadTickets()
    }
  }, [tickets.length, isLoading, error, loadTickets])

  // Wrapper functions with error handling
  const handleCreateTicket = async (ticketData: CreateTicketData): Promise<Ticket | null> => {
    try {
      return await createTicket(ticketData)
    } catch (error) {
      console.error('Failed to create ticket:', error)
      return null
    }
  }

  const handleUpdateTicket = async (id: string, updates: Partial<Ticket>): Promise<Ticket | null> => {
    try {
      return await updateTicket(id, updates)
    } catch (error) {
      console.error('Failed to update ticket:', error)
      return null
    }
  }

  const handleDeleteTicket = async (id: string): Promise<boolean> => {
    try {
      await deleteTicket(id)
      return true
    } catch (error) {
      console.error('Failed to delete ticket:', error)
      return false
    }
  }

  const refreshTickets = async (): Promise<void> => {
    try {
      await loadTickets()
    } catch (error) {
      console.error('Failed to refresh tickets:', error)
    }
  }

  return {
    // State
    tickets,
    isLoading,
    error,
    
    // Actions
    createTicket: handleCreateTicket,
    updateTicket: handleUpdateTicket,
    deleteTicket: handleDeleteTicket,
    refreshTickets,
    
    // Query functions
    getTicketById,
    getTicketsByStatus,
    getTicketStats,
    
    // Error handling
    clearError,
    setError
  }
}

/**
 * Hook for getting ticket statistics
 * Useful for dashboard components that only need stats
 */
export const useTicketStats = () => {
  const { getTicketStats, tickets, isLoading } = useTicketStore()
  
  return {
    stats: getTicketStats(),
    isLoading,
    hasTickets: tickets.length > 0
  }
}

/**
 * Hook for getting tickets by status
 * Useful for filtered views
 */
export const useTicketsByStatus = (status: Ticket['status']) => {
  const { getTicketsByStatus, isLoading, error } = useTicketStore()
  
  return {
    tickets: getTicketsByStatus(status),
    isLoading,
    error
  }
}