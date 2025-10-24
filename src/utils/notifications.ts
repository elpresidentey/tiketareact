import { toast, ToastOptions } from 'react-hot-toast'
import { TicketAppError, ErrorCategory, ErrorSeverity } from '../constants/errors'

// Enhanced notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading'

// Notification configuration
interface NotificationConfig extends Partial<ToastOptions> {
  type?: NotificationType
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

// Default configurations for different notification types
const defaultConfigs: Record<NotificationType, Partial<ToastOptions>> = {
  success: {
    duration: 3000,
    iconTheme: {
      primary: '#10b981',
      secondary: '#ffffff'
    }
  },
  error: {
    duration: 5000,
    iconTheme: {
      primary: '#ef4444',
      secondary: '#ffffff'
    }
  },
  warning: {
    duration: 4000,
    iconTheme: {
      primary: '#f59e0b',
      secondary: '#ffffff'
    }
  },
  info: {
    duration: 3000,
    iconTheme: {
      primary: '#3b82f6',
      secondary: '#ffffff'
    }
  },
  loading: {
    duration: Infinity
  }
}

// Enhanced notification service
export class NotificationService {
  private static instance: NotificationService
  private loadingToasts = new Map<string, string>()

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Show success notification
  success(message: string, config?: NotificationConfig): string {
    const options = { ...defaultConfigs.success, ...config }
    return toast.success(message, options)
  }

  // Show error notification with enhanced error handling
  error(error: string | Error | TicketAppError, config?: NotificationConfig): string {
    let message: string
    let options = { ...defaultConfigs.error, ...config }

    if (error instanceof TicketAppError) {
      message = error.message
      // Adjust duration based on severity
      switch (error.severity) {
        case ErrorSeverity.CRITICAL:
          options.duration = 8000
          break
        case ErrorSeverity.HIGH:
          options.duration = 6000
          break
        case ErrorSeverity.MEDIUM:
          options.duration = 5000
          break
        case ErrorSeverity.LOW:
          options.duration = 4000
          break
      }
    } else if (error instanceof Error) {
      message = error.message
    } else {
      message = error
    }

    return toast.error(message, options)
  }

  // Show warning notification
  warning(message: string, config?: NotificationConfig): string {
    const options = { ...defaultConfigs.warning, ...config }
    return toast(message, {
      ...options,
      icon: '⚠️'
    })
  }

  // Show info notification
  info(message: string, config?: NotificationConfig): string {
    const options = { ...defaultConfigs.info, ...config }
    return toast(message, {
      ...options,
      icon: 'ℹ️'
    })
  }

  // Show loading notification
  loading(message: string, id?: string, config?: NotificationConfig): string {
    const options = { ...defaultConfigs.loading, ...config }
    const toastId = toast.loading(message, { ...options, id })
    
    if (id) {
      this.loadingToasts.set(id, toastId)
    }
    
    return toastId
  }

  // Update loading notification to success
  loadingSuccess(message: string, loadingId?: string): string {
    if (loadingId && this.loadingToasts.has(loadingId)) {
      const toastId = this.loadingToasts.get(loadingId)!
      this.loadingToasts.delete(loadingId)
      return toast.success(message, { id: toastId })
    }
    return this.success(message)
  }

  // Update loading notification to error
  loadingError(error: string | Error | TicketAppError, loadingId?: string): string {
    if (loadingId && this.loadingToasts.has(loadingId)) {
      const toastId = this.loadingToasts.get(loadingId)!
      this.loadingToasts.delete(loadingId)
      
      let message: string
      if (error instanceof TicketAppError || error instanceof Error) {
        message = error.message
      } else {
        message = error
      }
      
      return toast.error(message, { id: toastId })
    }
    return this.error(error)
  }

  // Dismiss specific notification
  dismiss(toastId: string): void {
    toast.dismiss(toastId)
  }

  // Dismiss all notifications
  dismissAll(): void {
    toast.dismiss()
    this.loadingToasts.clear()
  }

  // Show notification with custom action
  withAction(
    message: string, 
    action: { label: string; onClick: () => void },
    type: NotificationType = 'info',
    config?: NotificationConfig
  ): string {
    const options = { ...defaultConfigs[type], ...config }
    
    // Simple implementation without custom JSX
    const actionMessage = `${message} - ${action.label}`
    const toastId = toast(actionMessage, options)
    
    // Store action for potential future use
    setTimeout(() => {
      // Auto-dismiss after showing action message
      toast.dismiss(toastId)
    }, (options.duration as number) || 4000)
    
    return toastId
  }

  // Show confirmation notification
  confirm(
    message: string,
    _onConfirm: () => void,
    _onCancel?: () => void,
    config?: NotificationConfig
  ): string {
    const options = { 
      ...defaultConfigs.warning, 
      duration: 5000,
      ...config 
    }
    
    // Simple confirmation approach
    const confirmMessage = `${message} (This action requires confirmation)`
    return toast(confirmMessage, options)
  }
}

// Convenience functions for common operations
export const notify = NotificationService.getInstance()

// Specific notification functions for common use cases
export const notifySuccess = (message: string, config?: NotificationConfig) => 
  notify.success(message, config)

export const notifyError = (error: string | Error | TicketAppError, config?: NotificationConfig) => 
  notify.error(error, config)

export const notifyWarning = (message: string, config?: NotificationConfig) => 
  notify.warning(message, config)

export const notifyInfo = (message: string, config?: NotificationConfig) => 
  notify.info(message, config)

export const notifyLoading = (message: string, id?: string, config?: NotificationConfig) => 
  notify.loading(message, id, config)

// Operation-specific notifications
export const notifyOperation = {
  // Authentication operations
  loginSuccess: () => notify.success('Welcome back! Login successful.'),
  loginError: (error?: string) => notify.error(error || 'Login failed. Please check your credentials.'),
  signupSuccess: () => notify.success('Account created successfully! Welcome aboard.'),
  signupError: (error?: string) => notify.error(error || 'Signup failed. Please try again.'),
  logoutSuccess: () => notify.success('Logged out successfully.'),
  sessionExpired: () => notify.warning('Your session has expired. Please log in again.'),

  // Ticket operations
  ticketCreated: (title: string) => notify.success(`Ticket "${title}" created successfully.`),
  ticketCreateError: (error?: string) => notify.error(error || 'Failed to create ticket. Please try again.'),
  ticketUpdated: (title: string) => notify.success(`Ticket "${title}" updated successfully.`),
  ticketUpdateError: (error?: string) => notify.error(error || 'Failed to update ticket. Please try again.'),
  ticketDeleted: (title: string) => notify.success(`Ticket "${title}" deleted successfully.`),
  ticketDeleteError: (error?: string) => notify.error(error || 'Failed to delete ticket. Please try again.'),
  ticketsLoaded: (count: number) => notify.info(`Loaded ${count} ticket${count !== 1 ? 's' : ''}.`),
  ticketsLoadError: (error?: string) => notify.error(error || 'Failed to load tickets. Please refresh the page.'),

  // Storage operations
  storageError: () => notify.error('Storage error. Your changes may not be saved.'),
  storageUnavailable: () => notify.error('Local storage is not available. Some features may not work properly.'),

  // Network operations
  networkError: () => notify.error('Network error. Please check your connection and try again.'),
  offlineMode: () => notify.warning('You are currently offline. Some features may be limited.'),
  onlineMode: () => notify.success('Connection restored.'),

  // Form operations
  formSaved: () => notify.success('Changes saved successfully.'),
  formSaveError: (error?: string) => notify.error(error || 'Failed to save changes. Please try again.'),
  formValidationError: () => notify.warning('Please fix the errors in the form before submitting.'),

  // General operations
  operationSuccess: (operation: string) => notify.success(`${operation} completed successfully.`),
  operationError: (operation: string, error?: string) => 
    notify.error(error || `${operation} failed. Please try again.`),
  operationCancelled: (operation: string) => notify.info(`${operation} cancelled.`),
  
  // Loading operations with IDs for tracking
  startLoading: (operation: string, id: string) => 
    notify.loading(`${operation}...`, id),
  finishLoading: (operation: string, id: string, success: boolean, error?: string) => {
    if (success) {
      notify.loadingSuccess(`${operation} completed successfully.`, id)
    } else {
      notify.loadingError(error || `${operation} failed.`, id)
    }
  }
}

// Error notification helpers for different error categories
export const notifyErrorByCategory = (error: TicketAppError) => {
  switch (error.category) {
    case ErrorCategory.AUTHENTICATION:
      return notify.error(error, { duration: 6000 })
    case ErrorCategory.VALIDATION:
      return notify.warning(error.message, { duration: 4000 })
    case ErrorCategory.NETWORK:
      return notify.error(error, { duration: 7000 })
    case ErrorCategory.STORAGE:
      return notify.error(error, { duration: 5000 })
    case ErrorCategory.PERMISSION:
      return notify.error(error, { duration: 6000 })
    case ErrorCategory.SYSTEM:
    default:
      return notify.error(error)
  }
}

// Batch notification helpers
export const notifyBatch = {
  success: (messages: string[]) => {
    messages.forEach((message, index) => {
      setTimeout(() => notify.success(message), index * 200)
    })
  },
  error: (errors: (string | Error | TicketAppError)[]) => {
    errors.forEach((error, index) => {
      setTimeout(() => notify.error(error), index * 200)
    })
  }
}