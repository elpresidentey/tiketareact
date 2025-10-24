import React from 'react'
import { Ticket, CreateTicketData } from '../types'
import TicketForm from './TicketForm'

interface TicketFormModalProps {
  isOpen: boolean
  ticket?: Ticket // For editing existing tickets
  onClose: () => void
  onSubmit: (data: CreateTicketData) => Promise<void>
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

const TicketFormModal: React.FC<TicketFormModalProps> = ({
  isOpen,
  ticket,
  onClose,
  onSubmit,
  isLoading = false,
  mode = ticket ? 'edit' : 'create'
}) => {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleSubmit = async (data: CreateTicketData) => {
    try {
      await onSubmit(data)
      onClose() // Close modal on successful submission
    } catch (error) {
      // Error is handled by parent component
      throw error
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <TicketForm
          ticket={ticket}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
          mode={mode}
        />
      </div>
    </div>
  )
}

export default TicketFormModal