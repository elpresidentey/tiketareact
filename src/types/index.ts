// Core entity types
export interface Ticket {
  id: string
  title: string
  description?: string
  status: 'open' | 'in_progress' | 'closed'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  updatedAt: Date
  assignedTo?: string
  tags: string[]
}

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  createdAt: Date
}

// Form types
export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  confirmPassword: string
  name: string
}

export interface CreateTicketData {
  title: string
  description?: string
  status: 'open' | 'in_progress' | 'closed'
  priority: 'low' | 'medium' | 'high'
  tags: string[]
}

// Store types
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface TicketState {
  tickets: Ticket[]
  isLoading: boolean
  error: string | null
}

// Utility types
export type TicketStatus = Ticket['status']
export type TicketPriority = Ticket['priority']
export type UserRole = User['role']

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Filter types
export interface TicketFilters {
  status?: TicketStatus[]
  priority?: TicketPriority[]
  assignedTo?: string
  tags?: string[]
  search?: string
  dateRange?: {
    start: Date
    end: Date
  }
}