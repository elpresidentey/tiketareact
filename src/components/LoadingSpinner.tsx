import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white' | 'gray'
  className?: string
  text?: string
  showText?: boolean
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const colorClasses = {
  primary: 'text-blue-600',
  secondary: 'text-gray-600',
  white: 'text-white',
  gray: 'text-gray-400'
}

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  text = 'Loading...',
  showText = false
}) => {
  const spinnerClasses = `animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`
  const textClasses = `mt-2 ${textSizeClasses[size]} ${colorClasses[color]}`

  return (
    <div className="flex flex-col items-center justify-center">
      <svg
        className={spinnerClasses}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {showText && <p className={textClasses}>{text}</p>}
    </div>
  )
}

// Inline spinner for buttons
export const InlineSpinner: React.FC<{ size?: 'sm' | 'md'; color?: string }> = ({
  size = 'sm',
  color = 'currentColor'
}) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  
  return (
    <svg
      className={`animate-spin ${sizeClass}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      style={{ color }}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

// Dots loading animation
export const LoadingDots: React.FC<{
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}> = ({ size = 'md', color = 'bg-blue-600', className = '' }) => {
  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  }

  const dotSize = dotSizes[size]

  return (
    <div className={`flex space-x-1 ${className}`}>
      <div className={`${dotSize} ${color} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
      <div className={`${dotSize} ${color} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
      <div className={`${dotSize} ${color} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
    </div>
  )
}

// Progress bar component
export const ProgressBar: React.FC<{
  progress: number
  className?: string
  showPercentage?: boolean
  color?: string
  backgroundColor?: string
}> = ({
  progress,
  className = '',
  showPercentage = false,
  color = 'bg-blue-600',
  backgroundColor = 'bg-gray-200'
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress))

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full ${backgroundColor} rounded-full h-2`}>
        <div
          className={`${color} h-2 rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-sm text-gray-600 mt-1 text-center">
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  )
}

// Skeleton loading component
export const Skeleton: React.FC<{
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
  lines?: number
}> = ({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded'
  
  const variantClasses = {
    text: 'h-4',
    rectangular: 'h-32',
    circular: 'rounded-full'
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  if (variant === 'text' && lines > 1) {
    return (
      <div className={className}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} ${
              index < lines - 1 ? 'mb-2' : ''
            } ${index === lines - 1 ? 'w-3/4' : 'w-full'}`}
            style={index === lines - 1 ? { ...style, width: '75%' } : style}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
}

// Enhanced Card skeleton with shimmer effect
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-card shadow-card border border-gray-200 p-6 ${className}`}>
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg mb-2 shimmer" style={{ width: '75%' }} />
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg shimmer" style={{ width: '50%' }} />
        </div>
        <div className="flex space-x-2 ml-4">
          <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full shimmer" />
          <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full shimmer" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded shimmer" />
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded shimmer" style={{ width: '90%' }} />
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded shimmer" style={{ width: '75%' }} />
      </div>

      {/* Badges */}
      <div className="flex space-x-2 mb-4">
        <div className="h-6 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full shimmer" />
        <div className="h-6 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full shimmer" />
      </div>

      {/* Tags */}
      <div className="flex space-x-2 mb-4">
        <div className="h-5 w-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded shimmer" />
        <div className="h-5 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded shimmer" />
        <div className="h-5 w-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded shimmer" />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="h-3 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded shimmer" />
        <div className="h-3 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded shimmer" />
      </div>
    </div>
  </div>
)

// List skeleton for loading multiple items
export const ListSkeleton: React.FC<{
  items?: number
  itemComponent?: React.ComponentType<{ className?: string }>
  className?: string
}> = ({ items = 3, itemComponent: ItemComponent = CardSkeleton, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }, (_, index) => (
      <ItemComponent key={index} />
    ))}
  </div>
)

// Enhanced full page loading component
export const PageLoading: React.FC<{
  message?: string
  showSpinner?: boolean
}> = ({ message = 'Loading...', showSpinner = true }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
    <div className="text-center fade-in">
      {showSpinner && (
        <div className="mb-6">
          <LoadingSpinner size="xl" className="mb-4" />
          <div className="flex justify-center space-x-1">
            <LoadingDots size="md" color="bg-blue-600" />
          </div>
        </div>
      )}
      <p className="text-lg text-gray-600 font-medium">{message}</p>
      <div className="mt-4 w-32 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
)

// Loading overlay component
export const LoadingOverlay: React.FC<{
  isVisible: boolean
  message?: string
  progress?: number
  stage?: string
  className?: string
}> = ({ isVisible, message = 'Loading...', progress, stage, className = '' }) => {
  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">{message}</p>
          {stage && (
            <p className="text-sm text-gray-600 mb-4">{stage}</p>
          )}
          {typeof progress === 'number' && (
            <ProgressBar progress={progress} showPercentage className="mb-2" />
          )}
        </div>
      </div>
    </div>
  )
}