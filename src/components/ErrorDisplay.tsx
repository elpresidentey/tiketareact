import React from 'react'
import { TicketAppError, ErrorCategory, ErrorSeverity } from '../constants/errors'

interface ErrorDisplayProps {
  error: string | Error | TicketAppError | null
  className?: string
  variant?: 'inline' | 'card' | 'banner' | 'toast'
  showIcon?: boolean
  showRetry?: boolean
  onRetry?: () => void
  onDismiss?: () => void
  title?: string
}

// Error icon component
const ErrorIcon: React.FC<{ severity?: ErrorSeverity; className?: string }> = ({ 
  severity = ErrorSeverity.MEDIUM, 
  className = 'w-5 h-5' 
}) => {
  const getIconColor = () => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'text-red-600'
      case ErrorSeverity.HIGH:
        return 'text-red-500'
      case ErrorSeverity.MEDIUM:
        return 'text-orange-500'
      case ErrorSeverity.LOW:
        return 'text-yellow-500'
      default:
        return 'text-red-500'
    }
  }

  return (
    <svg
      className={`${className} ${getIconColor()}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
  )
}

// Warning icon component
const WarningIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    className={`${className} text-yellow-500`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
    />
  </svg>
)

// Info icon component
const InfoIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    className={`${className} text-blue-500`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  className = '',
  variant = 'inline',
  showIcon = true,
  showRetry = false,
  onRetry,
  onDismiss,
  title
}) => {
  if (!error) return null

  // Extract error information
  const getErrorInfo = () => {
    if (error instanceof TicketAppError) {
      return {
        message: error.message,
        category: error.category,
        severity: error.severity,
        code: error.code,
        details: error.details
      }
    }
    
    if (error instanceof Error) {
      return {
        message: error.message,
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.MEDIUM,
        code: 'UNKNOWN_ERROR',
        details: undefined
      }
    }
    
    return {
      message: error,
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.MEDIUM,
      code: 'UNKNOWN_ERROR',
      details: undefined
    }
  }

  const errorInfo = getErrorInfo()

  // Get styling based on severity and variant
  const getVariantClasses = () => {
    const severityColors = {
      [ErrorSeverity.CRITICAL]: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        titleText: 'text-red-900'
      },
      [ErrorSeverity.HIGH]: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        titleText: 'text-red-800'
      },
      [ErrorSeverity.MEDIUM]: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        titleText: 'text-orange-800'
      },
      [ErrorSeverity.LOW]: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-700',
        titleText: 'text-yellow-800'
      }
    }

    const colors = severityColors[errorInfo.severity]

    switch (variant) {
      case 'card':
        return `${colors.bg} ${colors.border} border rounded-lg p-4`
      case 'banner':
        return `${colors.bg} ${colors.border} border-l-4 p-4`
      case 'toast':
        return `${colors.bg} ${colors.border} border rounded-md p-3 shadow-sm`
      case 'inline':
      default:
        return `${colors.bg} ${colors.border} border rounded-md p-3`
    }
  }

  const variantClasses = getVariantClasses()
  const errorInfo_ = getErrorInfo()
  const textColor = errorInfo_.severity === ErrorSeverity.CRITICAL || errorInfo_.severity === ErrorSeverity.HIGH
    ? 'text-red-700'
    : errorInfo_.severity === ErrorSeverity.MEDIUM
    ? 'text-orange-700'
    : 'text-yellow-700'

  const titleColor = errorInfo_.severity === ErrorSeverity.CRITICAL || errorInfo_.severity === ErrorSeverity.HIGH
    ? 'text-red-800'
    : errorInfo_.severity === ErrorSeverity.MEDIUM
    ? 'text-orange-800'
    : 'text-yellow-800'

  return (
    <div className={`${variantClasses} ${className}`}>
      <div className="flex">
        {/* Icon */}
        {showIcon && (
          <div className="flex-shrink-0">
            <ErrorIcon severity={errorInfo.severity} />
          </div>
        )}

        {/* Content */}
        <div className={`${showIcon ? 'ml-3' : ''} flex-1`}>
          {/* Title */}
          {title && (
            <h3 className={`text-sm font-medium ${titleColor} mb-1`}>
              {title}
            </h3>
          )}

          {/* Error message */}
          <p className={`text-sm ${textColor}`}>
            {errorInfo.message}
          </p>

          {/* Error code (development only) */}
          {process.env.NODE_ENV === 'development' && errorInfo.code && (
            <p className={`text-xs ${textColor} mt-1 opacity-75`}>
              Error Code: {errorInfo.code}
            </p>
          )}

          {/* Error details (development only) */}
          {process.env.NODE_ENV === 'development' && errorInfo.details && (
            <details className="mt-2">
              <summary className={`text-xs ${textColor} cursor-pointer hover:underline`}>
                Show Details
              </summary>
              <pre className={`text-xs ${textColor} mt-1 whitespace-pre-wrap overflow-auto max-h-32 bg-white bg-opacity-50 p-2 rounded`}>
                {errorInfo.details}
              </pre>
            </details>
          )}

          {/* Actions */}
          {(showRetry || onDismiss) && (
            <div className="mt-3 flex space-x-2">
              {showRetry && onRetry && (
                <button
                  onClick={onRetry}
                  className={`text-sm font-medium ${titleColor} hover:underline focus:outline-none focus:underline`}
                >
                  Try Again
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`text-sm font-medium ${textColor} hover:underline focus:outline-none focus:underline`}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {onDismiss && variant !== 'inline' && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={`inline-flex ${textColor} hover:opacity-75 focus:outline-none focus:opacity-75`}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Specialized error components
export const NetworkErrorDisplay: React.FC<{
  error: string | Error | TicketAppError | null
  onRetry?: () => void
  className?: string
}> = ({ error, onRetry, className }) => (
  <ErrorDisplay
    error={error}
    title="Connection Error"
    variant="card"
    showRetry={!!onRetry}
    onRetry={onRetry}
    className={className}
  />
)

export const ValidationErrorDisplay: React.FC<{
  errors: string[]
  className?: string
}> = ({ errors, className }) => {
  if (errors.length === 0) return null

  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-3 ${className}`}>
      <div className="flex">
        <WarningIcon className="flex-shrink-0" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Please fix the following errors:
          </h3>
          <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export const InfoDisplay: React.FC<{
  message: string
  title?: string
  onDismiss?: () => void
  className?: string
}> = ({ message, title, onDismiss, className }) => (
  <div className={`bg-blue-50 border border-blue-200 rounded-md p-3 ${className}`}>
    <div className="flex">
      <InfoIcon className="flex-shrink-0" />
      <div className="ml-3 flex-1">
        {title && (
          <h3 className="text-sm font-medium text-blue-800 mb-1">
            {title}
          </h3>
        )}
        <p className="text-sm text-blue-700">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-auto pl-3 text-blue-700 hover:opacity-75 focus:outline-none focus:opacity-75"
        >
          <span className="sr-only">Dismiss</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  </div>
)

// Empty state component (not exactly an error, but related)
export const EmptyState: React.FC<{
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
  className?: string
}> = ({ title, description, action, icon, className }) => (
  <div className={`text-center py-12 ${className}`}>
    {icon && (
      <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    {description && (
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">{description}</p>
    )}
    {action && (
      <button
        onClick={action.onClick}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        {action.label}
      </button>
    )}
  </div>
)