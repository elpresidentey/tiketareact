import { Ticket, User } from '../types'

// Generate unique ID (simple implementation for demo purposes)
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Generate session token
export const generateSessionToken = (): string => {
  return `session_${generateId()}`
}

// Date formatting utilities
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  return formatDate(date)
}

// Ticket utility functions
export const createTicket = (
  title: string,
  description?: string,
  status: Ticket['status'] = 'open',
  priority: Ticket['priority'] = 'medium',
  tags: string[] = []
): Ticket => {
  const now = new Date()
  return {
    id: generateId(),
    title,
    description,
    status,
    priority,
    createdAt: now,
    updatedAt: now,
    tags
  }
}

export const createUser = (
  email: string,
  name: string,
  role: User['role'] = 'user'
): User => {
  return {
    id: generateId(),
    email,
    name,
    role,
    createdAt: new Date()
  }
}

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6
}

// String utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Array utilities
export const removeDuplicates = <T>(array: T[]): T[] => {
  return [...new Set(array)]
}

export const sortByDate = <T extends { createdAt: Date }>(
  items: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return order === 'desc' ? dateB - dateA : dateA - dateB
  })
}

// Ticket filtering and sorting
export const filterTickets = (
  tickets: Ticket[],
  filters: {
    status?: Ticket['status'][]
    priority?: Ticket['priority'][]
    search?: string
    tags?: string[]
  }
): Ticket[] => {
  return tickets.filter(ticket => {
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(ticket.status)) return false
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(ticket.priority)) return false
    }

    // Search filter (title and description)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const titleMatch = ticket.title.toLowerCase().includes(searchLower)
      const descriptionMatch = ticket.description?.toLowerCase().includes(searchLower)
      if (!titleMatch && !descriptionMatch) return false
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => 
        ticket.tags.some(ticketTag => 
          ticketTag.toLowerCase().includes(tag.toLowerCase())
        )
      )
      if (!hasMatchingTag) return false
    }

    return true
  })
}

// Color utilities for status and priority
export const getStatusColor = (status: Ticket['status']): string => {
  switch (status) {
    case 'open':
      return 'bg-blue-100 text-blue-800'
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800'
    case 'closed':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const getPriorityColor = (priority: Ticket['priority']): string => {
  switch (priority) {
    case 'low':
      return 'bg-gray-100 text-gray-800'
    case 'medium':
      return 'bg-orange-100 text-orange-800'
    case 'high':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Ticket statistics utilities
export const calculateTicketStats = (tickets: Ticket[]) => {
  const stats = {
    total: tickets.length,
    open: 0,
    inProgress: 0,
    closed: 0,
    byPriority: {
      low: 0,
      medium: 0,
      high: 0
    },
    averageResolutionTime: 0,
    oldestTicket: null as Ticket | null,
    newestTicket: null as Ticket | null
  }

  if (tickets.length === 0) return stats

  let totalResolutionTime = 0
  let resolvedCount = 0

  tickets.forEach(ticket => {
    // Count by status
    switch (ticket.status) {
      case 'open':
        stats.open++
        break
      case 'in_progress':
        stats.inProgress++
        break
      case 'closed':
        stats.closed++
        // Calculate resolution time for closed tickets
        const resolutionTime = ticket.updatedAt.getTime() - ticket.createdAt.getTime()
        totalResolutionTime += resolutionTime
        resolvedCount++
        break
    }

    // Count by priority
    stats.byPriority[ticket.priority]++

    // Find oldest and newest tickets
    if (!stats.oldestTicket || ticket.createdAt < stats.oldestTicket.createdAt) {
      stats.oldestTicket = ticket
    }
    if (!stats.newestTicket || ticket.createdAt > stats.newestTicket.createdAt) {
      stats.newestTicket = ticket
    }
  })

  // Calculate average resolution time in days
  if (resolvedCount > 0) {
    stats.averageResolutionTime = Math.round(
      (totalResolutionTime / resolvedCount) / (1000 * 60 * 60 * 24)
    )
  }

  return stats
}

// Ticket validation utilities
export const validateTicketData = (data: Partial<Ticket>): string[] => {
  const errors: string[] = []

  if (data.title !== undefined) {
    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required')
    } else if (data.title.length < 3) {
      errors.push('Title must be at least 3 characters long')
    } else if (data.title.length > 100) {
      errors.push('Title must be less than 100 characters')
    }
  }

  if (data.description !== undefined && data.description && data.description.length > 2000) {
    errors.push('Description must be less than 2000 characters')
  }

  if (data.status !== undefined) {
    const validStatuses: Ticket['status'][] = ['open', 'in_progress', 'closed']
    if (!validStatuses.includes(data.status)) {
      errors.push('Invalid status')
    }
  }

  if (data.priority !== undefined) {
    const validPriorities: Ticket['priority'][] = ['low', 'medium', 'high']
    if (!validPriorities.includes(data.priority)) {
      errors.push('Invalid priority')
    }
  }

  if (data.tags !== undefined && data.tags) {
    if (data.tags.length > 10) {
      errors.push('Maximum 10 tags allowed')
    }
    data.tags.forEach((tag, index) => {
      if (!tag || tag.trim().length === 0) {
        errors.push(`Tag ${index + 1} cannot be empty`)
      } else if (tag.length > 20) {
        errors.push(`Tag "${tag}" is too long (max 20 characters)`)
      }
    })
  }

  return errors
}

// Ticket search utilities
export const searchTickets = (tickets: Ticket[], query: string): Ticket[] => {
  if (!query || query.trim().length === 0) return tickets

  const searchTerm = query.toLowerCase().trim()
  
  return tickets.filter(ticket => {
    // Search in title
    if (ticket.title.toLowerCase().includes(searchTerm)) return true
    
    // Search in description
    if (ticket.description && ticket.description.toLowerCase().includes(searchTerm)) return true
    
    // Search in tags
    if (ticket.tags.some(tag => tag.toLowerCase().includes(searchTerm))) return true
    
    // Search in status
    if (ticket.status.toLowerCase().includes(searchTerm)) return true
    
    // Search in priority
    if (ticket.priority.toLowerCase().includes(searchTerm)) return true
    
    // Search in assigned user
    if (ticket.assignedTo && ticket.assignedTo.toLowerCase().includes(searchTerm)) return true
    
    return false
  })
}