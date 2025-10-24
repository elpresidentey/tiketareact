import { useState } from 'react'
import { Ticket } from '../types'
import { formatDistanceToNow } from 'date-fns'
import ConfirmationDialog from './ConfirmationDialog'
import toast from 'react-hot-toast'

interface TicketCardProps {
  ticket: Ticket
  onEdit?: (ticket: Ticket) => void
  onDelete?: (ticketId: string) => Promise<boolean> | boolean
  onStatusChange?: (ticketId: string, status: Ticket['status']) => void
}

const TicketCard = ({ ticket, onEdit, onDelete, onStatusChange }: TicketCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Status color mapping
  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'open':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'closed':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Priority color mapping
  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }



  const handleStatusChange = (newStatus: Ticket['status']) => {
    if (onStatusChange && newStatus !== ticket.status) {
      onStatusChange(ticket.id, newStatus)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!onDelete) return

    setIsDeleting(true)
    try {
      const result = await onDelete(ticket.id)
      if (result) {
        toast.success('Ticket deleted successfully')
        setShowDeleteConfirm(false)
      } else {
        toast.error('Failed to delete ticket')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete ticket')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
  }

  return (
    <div className="card card-hover card-interactive fade-in group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-300">
            {ticket.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            ID: {ticket.id}
          </p>
        </div>
        
        {/* Actions Menu */}
        <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {onEdit && (
            <button
              onClick={() => onEdit(ticket)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-button transition-all duration-300 interactive-scale hover:shadow-button"
              title="Edit ticket"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-button transition-all duration-300 interactive-scale hover:shadow-button disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              title="Delete ticket"
            >
              {isDeleting ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {ticket.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {ticket.description}
        </p>
      )}

      {/* Status and Priority */}
      <div className="flex items-center space-x-3 mb-4">
        {/* Status Badge */}
        <div className="relative">
          <select
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value as Ticket['status'])}
            className={`text-xs font-medium px-3 py-1 rounded-badge border cursor-pointer appearance-none pr-8 transition-all duration-300 hover:shadow-sm status-badge ${getStatusColor(ticket.status)}`}
            disabled={!onStatusChange}
            aria-label={`Change status for ticket ${ticket.title}`}
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
          {onStatusChange && (
            <svg className="w-3 h-3 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>

        {/* Priority Badge */}
        <span className={`text-xs font-medium px-3 py-1 rounded-badge border transition-all duration-300 hover:shadow-sm status-badge ${getPriorityColor(ticket.priority)}`}>
          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
        </span>
      </div>

      {/* Tags */}
      {ticket.tags && ticket.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {ticket.tags.map((tag, index) => (
            <span
              key={index}
              className={`text-xs bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 px-2 py-1 rounded-badge border border-gray-200 transition-all duration-300 hover:shadow-sm hover:scale-105 slide-up stagger-${Math.min(index + 1, 5)}`}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <span>
            Created {formatDistanceToNow(ticket.createdAt, { addSuffix: true })}
          </span>
          {ticket.updatedAt.getTime() !== ticket.createdAt.getTime() && (
            <span>
              Updated {formatDistanceToNow(ticket.updatedAt, { addSuffix: true })}
            </span>
          )}
        </div>
        
        {ticket.assignedTo && (
          <span className="flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {ticket.assignedTo}
          </span>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Delete Ticket"
        message={
          <div>
            <p className="mb-2">Are you sure you want to delete this ticket?</p>
            <div className="bg-gray-50 rounded-lg p-3 border">
              <p className="font-medium text-gray-900">{ticket.title}</p>
              <p className="text-sm text-gray-600">ID: {ticket.id}</p>
            </div>
            <p className="mt-2 text-sm text-red-600">This action cannot be undone.</p>
          </div>
        }
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        confirmButtonClass={`${isDeleting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        icon={
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        }
      />
    </div>
  )
}

export default TicketCard