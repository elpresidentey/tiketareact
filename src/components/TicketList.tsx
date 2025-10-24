import { useState, useMemo } from 'react'
import { Ticket, TicketFilters } from '../types'
import TicketCard from './TicketCard'
import { CardSkeleton, ListSkeleton } from './LoadingSpinner'
import { ErrorDisplay, EmptyState } from './ErrorDisplay'

interface TicketListProps {
  tickets: Ticket[]
  isLoading?: boolean
  error?: string | null
  onEdit?: (ticket: Ticket) => void
  onDelete?: (ticketId: string) => Promise<boolean> | boolean
  onStatusChange?: (ticketId: string, status: Ticket['status']) => void
  onCreateNew?: () => void
  onRetry?: () => void
}

type ViewMode = 'grid' | 'list'

const TicketList = ({ 
  tickets, 
  isLoading = false, 
  error,
  onEdit, 
  onDelete, 
  onStatusChange,
  onCreateNew,
  onRetry 
}: TicketListProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<TicketFilters>({
    status: [],
    priority: [],
    search: ''
  })

  // Filter and search tickets
  const filteredTickets = useMemo(() => {
    let filtered = [...tickets]

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(search) ||
        ticket.description?.toLowerCase().includes(search) ||
        ticket.id.toLowerCase().includes(search) ||
        ticket.tags.some(tag => tag.toLowerCase().includes(search))
      )
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(ticket => filters.status!.includes(ticket.status))
    }

    // Apply priority filter
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(ticket => filters.priority!.includes(ticket.priority))
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return filtered
  }, [tickets, searchTerm, filters])

  const handleStatusFilter = (status: Ticket['status']) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status?.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...(prev.status || []), status]
    }))
  }

  const handlePriorityFilter = (priority: Ticket['priority']) => {
    setFilters(prev => ({
      ...prev,
      priority: prev.priority?.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...(prev.priority || []), priority]
    }))
  }

  const clearFilters = () => {
    setFilters({ status: [], priority: [], search: '' })
    setSearchTerm('')
  }

  const hasActiveFilters = searchTerm.trim() || 
    (filters.status && filters.status.length > 0) || 
    (filters.priority && filters.priority.length > 0)

  // Show error state
  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <ErrorDisplay
          error={error}
          variant="card"
          title="Failed to Load Tickets"
          showRetry={!!onRetry}
          onRetry={onRetry}
          className="max-w-2xl mx-auto"
        />
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1 max-w-md">
                <div className="h-10 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
                <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
              <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
              <div className="h-6 w-18 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Loading tickets */}
        <ListSkeleton items={6} itemComponent={CardSkeleton} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search tickets by title, description, ID, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* View Mode Toggle and Create Button */}
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Create New Ticket Button */}
            {onCreateNew && (
              <button
                onClick={onCreateNew}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New Ticket</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {/* Status Filters */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            {(['open', 'in_progress', 'closed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-200 ${
                  filters.status?.includes(status)
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Priority Filters */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Priority:</span>
            {(['low', 'medium', 'high'] as const).map((priority) => (
              <button
                key={priority}
                onClick={() => handlePriorityFilter(priority)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-200 ${
                  filters.priority?.includes(priority)
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </button>
            ))}
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredTickets.length} of {tickets.length} tickets
          {hasActiveFilters && (
            <span className="ml-1 text-blue-600">(filtered)</span>
          )}
        </div>
      </div>

      {/* Tickets Display */}
      {filteredTickets.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'No tickets match your filters' : 'No tickets found'}
          description={hasActiveFilters 
            ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
            : 'Get started by creating your first ticket.'
          }
          action={hasActiveFilters ? {
            label: 'Clear Filters',
            onClick: clearFilters
          } : onCreateNew ? {
            label: 'Create Your First Ticket',
            onClick: onCreateNew
          } : undefined}
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        />
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TicketList