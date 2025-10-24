import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useTickets } from '../hooks/useTickets'
import { Ticket, CreateTicketData } from '../types'
import TicketList from '../components/TicketList'
import TicketFormModal from '../components/TicketFormModal'
import { notifyOperation } from '../utils/notifications'
import { ErrorDisplay } from '../components/ErrorDisplay'
import { ComponentErrorBoundary } from '../components/ErrorBoundary'

const TicketManagementPage = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { 
    tickets, 
    isLoading, 
    error, 
    createTicket,
    updateTicket, 
    deleteTicket, 
    getTicketStats,
    clearError,
    refreshTickets
  } = useTickets()


  const [showTicketForm, setShowTicketForm] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)

  const stats = getTicketStats()

  const handleLogout = () => {
    logout()
    notifyOperation.logoutSuccess()
    navigate('/')
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket)
    setShowTicketForm(true)
  }

  const handleCreateNewTicket = () => {
    setEditingTicket(null)
    setShowTicketForm(true)
  }

  const handleCloseTicketForm = () => {
    setShowTicketForm(false)
    setEditingTicket(null)
  }

  const handleTicketFormSubmit = async (data: CreateTicketData) => {
    try {
      if (editingTicket) {
        // Update existing ticket
        const updatedTicket = await updateTicket(editingTicket.id, data)
        if (updatedTicket) {
          notifyOperation.ticketUpdated(data.title)
        } else {
          notifyOperation.ticketUpdateError()
          throw new Error('Update failed')
        }
      } else {
        // Create new ticket
        const newTicket = await createTicket(data)
        if (newTicket) {
          notifyOperation.ticketCreated(data.title)
        } else {
          notifyOperation.ticketCreateError()
          throw new Error('Creation failed')
        }
      }
    } catch (error) {
      // Re-throw to prevent modal from closing
      throw error
    }
  }

  const handleDeleteTicket = async (ticketId: string): Promise<boolean> => {
    try {
      await deleteTicket(ticketId)
      return true
    } catch (error) {
      console.error('Failed to delete ticket:', error)
      return false
    }
  }

  const handleStatusChange = async (ticketId: string, status: Ticket['status']) => {
    const success = await updateTicket(ticketId, { status })
    if (success) {
      notifyOperation.operationSuccess(`Ticket status updated to ${status}`)
    } else {
      notifyOperation.operationError('Status update')
    }
  }

  // Clear error when component mounts or error changes
  if (error) {
    setTimeout(() => clearError(), 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {/* Back Button */}
              <button
                onClick={handleBackToDashboard}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="Back to Dashboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Ticket Management
                </h1>
                <p className="text-sm text-gray-600">
                  Manage and track your tickets
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Tickets */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : stats.total}
                </p>
              </div>
            </div>
          </div>

          {/* Open Tickets */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-2xl font-bold text-orange-600">
                  {isLoading ? '...' : stats.open}
                </p>
              </div>
            </div>
          </div>

          {/* In Progress Tickets */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {isLoading ? '...' : stats.inProgress}
                </p>
              </div>
            </div>
          </div>

          {/* Closed Tickets */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Closed</p>
                <p className="text-2xl font-bold text-green-600">
                  {isLoading ? '...' : stats.resolved}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorDisplay
            error={error}
            variant="banner"
            title="Ticket Management Error"
            showRetry={true}
            onRetry={refreshTickets}
            onDismiss={clearError}
            className="mb-6"
          />
        )}

        {/* Ticket List */}
        <ComponentErrorBoundary componentName="Ticket List">
          <TicketList
            tickets={tickets}
            isLoading={isLoading}
            error={error}
            onEdit={handleEditTicket}
            onDelete={handleDeleteTicket}
            onStatusChange={handleStatusChange}
            onCreateNew={handleCreateNewTicket}
            onRetry={refreshTickets}
          />
        </ComponentErrorBoundary>
      </main>

      {/* Ticket Form Modal */}
      <TicketFormModal
        isOpen={showTicketForm}
        ticket={editingTicket || undefined}
        onClose={handleCloseTicketForm}
        onSubmit={handleTicketFormSubmit}
        isLoading={isLoading}
        mode={editingTicket ? 'edit' : 'create'}
      />


    </div>
  )
}

export default TicketManagementPage