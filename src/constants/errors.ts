// Error message constants
export const ERROR_MESSAGES = {
  // Authentication errors
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User not found',
    USER_ALREADY_EXISTS: 'User with this email already exists',
    WEAK_PASSWORD: 'Password must be at least 6 characters long',
    PASSWORDS_DONT_MATCH: 'Passwords do not match',
    SESSION_EXPIRED: 'Your session has expired. Please log in again',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    LOGIN_REQUIRED: 'Please log in to continue'
  },

  // Ticket errors
  TICKET: {
    NOT_FOUND: 'Ticket not found',
    TITLE_REQUIRED: 'Ticket title is required',
    TITLE_TOO_SHORT: 'Ticket title must be at least 3 characters long',
    TITLE_TOO_LONG: 'Ticket title must be less than 100 characters',
    DESCRIPTION_TOO_LONG: 'Description must be less than 2000 characters',
    INVALID_STATUS: 'Invalid ticket status',
    INVALID_PRIORITY: 'Invalid ticket priority',
    CREATE_FAILED: 'Failed to create ticket',
    UPDATE_FAILED: 'Failed to update ticket',
    DELETE_FAILED: 'Failed to delete ticket',
    LOAD_FAILED: 'Failed to load tickets'
  },

  // Form validation errors
  FORM: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    FIELD_TOO_SHORT: 'This field is too short',
    FIELD_TOO_LONG: 'This field is too long',
    INVALID_FORMAT: 'Invalid format'
  },

  // Network and storage errors
  SYSTEM: {
    NETWORK_ERROR: 'Network error. Please check your connection',
    STORAGE_ERROR: 'Failed to save data. Please try again',
    STORAGE_UNAVAILABLE: 'Local storage is not available',
    UNKNOWN_ERROR: 'An unexpected error occurred',
    OPERATION_FAILED: 'Operation failed. Please try again'
  },

  // General UI errors
  UI: {
    PAGE_NOT_FOUND: 'Page not found',
    ACCESS_DENIED: 'Access denied',
    LOADING_ERROR: 'Failed to load content',
    SAVE_ERROR: 'Failed to save changes'
  }
} as const

// Error types
export interface AppError {
  code: string
  message: string
  details?: string
  timestamp: Date
}

export interface ValidationError {
  field: string
  message: string
}

export interface FormErrors {
  [key: string]: string | undefined
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  NETWORK = 'network',
  STORAGE = 'storage',
  PERMISSION = 'permission',
  SYSTEM = 'system'
}

// Custom error class
export class TicketAppError extends Error {
  public readonly code: string
  public readonly category: ErrorCategory
  public readonly severity: ErrorSeverity
  public readonly timestamp: Date
  public readonly details?: string

  constructor(
    message: string,
    code: string,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    details?: string
  ) {
    super(message)
    this.name = 'TicketAppError'
    this.code = code
    this.category = category
    this.severity = severity
    this.timestamp = new Date()
    this.details = details

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TicketAppError)
    }
  }

  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp
    }
  }
}

// Helper functions for creating specific error types
export const createAuthError = (message: string, details?: string): TicketAppError => {
  return new TicketAppError(
    message,
    'AUTH_ERROR',
    ErrorCategory.AUTHENTICATION,
    ErrorSeverity.HIGH,
    details
  )
}

export const createValidationError = (message: string, details?: string): TicketAppError => {
  return new TicketAppError(
    message,
    'VALIDATION_ERROR',
    ErrorCategory.VALIDATION,
    ErrorSeverity.LOW,
    details
  )
}

export const createStorageError = (message: string, details?: string): TicketAppError => {
  return new TicketAppError(
    message,
    'STORAGE_ERROR',
    ErrorCategory.STORAGE,
    ErrorSeverity.MEDIUM,
    details
  )
}

export const createNetworkError = (message: string, details?: string): TicketAppError => {
  return new TicketAppError(
    message,
    'NETWORK_ERROR',
    ErrorCategory.NETWORK,
    ErrorSeverity.HIGH,
    details
  )
}