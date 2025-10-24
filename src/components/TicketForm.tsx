import React, { useEffect } from 'react'
import { useForm, SubmitHandler, Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTicketSchema } from '../schemas/validation'
import { Ticket, CreateTicketData } from '../types'

interface TicketFormProps {
  ticket?: Ticket // For editing existing tickets
  onSubmit: (data: CreateTicketData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

const TicketForm: React.FC<TicketFormProps> = ({
  ticket,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = ticket ? 'edit' : 'create'
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<CreateTicketData>({
    resolver: zodResolver(createTicketSchema) as Resolver<CreateTicketData>,
    mode: 'onBlur',
    defaultValues: {
      title: ticket?.title || '',
      description: ticket?.description || '',
      status: ticket?.status || 'open',
      priority: ticket?.priority || 'medium',
      tags: ticket?.tags || []
    }
  })

  // Watch description for character count
  const description = watch('description')
  const descriptionLength = description?.length || 0

  // Reset form when ticket changes (for edit mode)
  useEffect(() => {
    if (ticket) {
      reset({
        title: ticket.title,
        description: ticket.description || '',
        status: ticket.status,
        priority: ticket.priority,
        tags: ticket.tags || []
      })
    }
  }, [ticket, reset])

  const handleFormSubmit: SubmitHandler<CreateTicketData> = async (data) => {
    try {
      await onSubmit(data)
      if (mode === 'create') {
        reset() // Reset form after successful creation
      }
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Form submission error:', error)
    }
  }

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const input = e.currentTarget
      const tagValue = input.value.trim()
      
      if (tagValue) {
        const currentTags = watch('tags') || []
        if (!currentTags.includes(tagValue) && currentTags.length < 10) {
          setValue('tags', [...currentTags, tagValue])
          input.value = ''
        }
      }
    }
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = watch('tags') || []
    setValue('tags', currentTags.filter(tag => tag !== tagToRemove))
  }

  const currentTags = watch('tags') || []

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {mode === 'create' ? 'Create New Ticket' : 'Edit Ticket'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          title="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            {...register('title')}
            type="text"
            id="title"
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter ticket title (minimum 3 characters)"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Status and Priority Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Field */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              {...register('status')}
              id="status"
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.status ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Priority Field */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              {...register('priority')}
              id="priority"
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.priority ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {errors.priority && (
              <p className="mt-1 text-sm text-red-600">
                {errors.priority.message}
              </p>
            )}
          </div>
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            {...register('description')}
            id="description"
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter ticket description (optional, max 2000 characters)"
          />
          <div className="flex justify-between items-center mt-1">
            <div>
              {errors.description && (
                <p className="text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>
            <p className={`text-xs ${
              descriptionLength > 2000 ? 'text-red-600' : 
              descriptionLength > 1800 ? 'text-yellow-600' : 'text-gray-500'
            }`}>
              {descriptionLength}/2000 characters
            </p>
          </div>
        </div>

        {/* Tags Field */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            onKeyDown={handleTagInput}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Type a tag and press Enter or comma to add (max 10 tags)"
            disabled={currentTags.length >= 10}
          />
          
          {/* Display Current Tags */}
          {currentTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {currentTags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-1">
            {currentTags.length}/10 tags used
          </p>
          
          {errors.tags && (
            <p className="mt-1 text-sm text-red-600">
              {errors.tags.message}
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {isLoading || isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </span>
            ) : (
              mode === 'create' ? 'Create Ticket' : 'Update Ticket'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TicketForm