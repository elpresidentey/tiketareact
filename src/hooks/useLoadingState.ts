import { useState, useCallback, useRef, useEffect } from 'react'
import { notifyOperation } from '../utils/notifications'

// Loading state interface
export interface LoadingState {
  isLoading: boolean
  error: string | null
  progress?: number
  stage?: string
}

// Loading operation configuration
interface LoadingConfig {
  showNotifications?: boolean
  notificationId?: string
  timeout?: number
  onTimeout?: () => void
  onError?: (error: Error) => void
  onSuccess?: () => void
}

// Hook for managing loading states
export const useLoadingState = (initialState: Partial<LoadingState> = {}) => {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    progress: undefined,
    stage: undefined,
    ...initialState
  })

  const timeoutRef = useRef<NodeJS.Timeout>()

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      const timeout = timeoutRef.current
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [])

  // Start loading
  const startLoading = useCallback((stage?: string, progress?: number) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      stage,
      progress
    }))
  }, [])

  // Update progress
  const updateProgress = useCallback((progress: number, stage?: string) => {
    setState(prev => ({
      ...prev,
      progress,
      stage: stage || prev.stage
    }))
  }, [])

  // Update stage
  const updateStage = useCallback((stage: string) => {
    setState(prev => ({
      ...prev,
      stage
    }))
  }, [])

  // Set error
  const setError = useCallback((error: string | Error) => {
    const errorMessage = error instanceof Error ? error.message : error
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: errorMessage,
      progress: undefined,
      stage: undefined
    }))
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }))
  }, [])

  // Stop loading (success)
  const stopLoading = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: null,
      progress: undefined,
      stage: undefined
    }))
  }, [])

  // Reset state
  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setState({
      isLoading: false,
      error: null,
      progress: undefined,
      stage: undefined
    })
  }, [])

  return {
    ...state,
    startLoading,
    updateProgress,
    updateStage,
    setError,
    clearError,
    stopLoading,
    reset
  }
}

// Hook for managing async operations with loading states
export const useAsyncOperation = <T = any>(config: LoadingConfig = {}) => {
  const loadingState = useLoadingState()
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Execute async operation with loading state management
  const execute = useCallback(async (
    operation: () => Promise<T>,
    operationName?: string
  ): Promise<T | null> => {
    const {
      showNotifications = false,
      notificationId,
      timeout,
      onTimeout,
      onError,
      onSuccess
    } = config

    try {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Start loading
      loadingState.startLoading()

      // Show loading notification if enabled
      if (showNotifications && operationName) {
        notifyOperation.startLoading(operationName, notificationId || 'async-op')
      }

      // Set timeout if specified
      if (timeout) {
        timeoutRef.current = setTimeout(() => {
          loadingState.setError('Operation timed out')
          onTimeout?.()
          
          if (showNotifications && operationName) {
            notifyOperation.finishLoading(
              operationName,
              notificationId || 'async-op',
              false,
              'Operation timed out'
            )
          }
        }, timeout)
      }

      // Execute the operation
      const result = await operation()

      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Success
      loadingState.stopLoading()
      onSuccess?.()

      if (showNotifications && operationName) {
        notifyOperation.finishLoading(
          operationName,
          notificationId || 'async-op',
          true
        )
      }

      return result
    } catch (error) {
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      const errorMessage = error instanceof Error ? error.message : 'Operation failed'
      loadingState.setError(errorMessage)
      onError?.(error instanceof Error ? error : new Error(errorMessage))

      if (showNotifications && operationName) {
        notifyOperation.finishLoading(
          operationName,
          notificationId || 'async-op',
          false,
          errorMessage
        )
      }

      return null
    }
  }, [config, loadingState])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const timeout = timeoutRef.current
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [])

  return {
    ...loadingState,
    execute
  }
}

// Hook for managing multiple loading states
export const useMultipleLoadingStates = () => {
  const [states, setStates] = useState<Record<string, LoadingState>>({})

  const getState = useCallback((key: string): LoadingState => {
    return states[key] || { isLoading: false, error: null }
  }, [states])

  const startLoading = useCallback((key: string, stage?: string, progress?: number) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        isLoading: true,
        error: null,
        stage,
        progress
      }
    }))
  }, [])

  const updateProgress = useCallback((key: string, progress: number, stage?: string) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        progress,
        stage: stage || prev[key]?.stage
      }
    }))
  }, [])

  const setError = useCallback((key: string, error: string | Error) => {
    const errorMessage = error instanceof Error ? error.message : error
    setStates(prev => ({
      ...prev,
      [key]: {
        isLoading: false,
        error: errorMessage,
        progress: undefined,
        stage: undefined
      }
    }))
  }, [])

  const stopLoading = useCallback((key: string) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        isLoading: false,
        error: null,
        progress: undefined,
        stage: undefined
      }
    }))
  }, [])

  const clearError = useCallback((key: string) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        error: null
      }
    }))
  }, [])

  const reset = useCallback((key?: string) => {
    if (key) {
      setStates(prev => {
        const newStates = { ...prev }
        delete newStates[key]
        return newStates
      })
    } else {
      setStates({})
    }
  }, [])

  const isAnyLoading = useCallback(() => {
    return Object.values(states).some(state => state.isLoading)
  }, [states])

  const hasAnyError = useCallback(() => {
    return Object.values(states).some(state => state.error)
  }, [states])

  return {
    states,
    getState,
    startLoading,
    updateProgress,
    setError,
    stopLoading,
    clearError,
    reset,
    isAnyLoading,
    hasAnyError
  }
}

// Hook for debounced loading states (useful for search, etc.)
export const useDebouncedLoadingState = (delay: number = 300) => {
  const loadingState = useLoadingState()
  const debounceRef = useRef<NodeJS.Timeout>()

  const debouncedStartLoading = useCallback((stage?: string, progress?: number) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      loadingState.startLoading(stage, progress)
    }, delay)
  }, [loadingState, delay])

  const immediateStartLoading = useCallback((stage?: string, progress?: number) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    loadingState.startLoading(stage, progress)
  }, [loadingState])

  const cancelDebounced = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return {
    ...loadingState,
    startLoading: debouncedStartLoading,
    immediateStartLoading,
    cancelDebounced
  }
}

// Utility function to create loading state selectors
export const createLoadingSelector = (keys: string[]) => {
  return (states: Record<string, LoadingState>) => {
    const selectedStates = keys.reduce((acc, key) => {
      acc[key] = states[key] || { isLoading: false, error: null }
      return acc
    }, {} as Record<string, LoadingState>)

    const isAnyLoading = Object.values(selectedStates).some(state => state.isLoading)
    const hasAnyError = Object.values(selectedStates).some(state => state.error)
    const errors = Object.entries(selectedStates)
      .filter(([, state]) => state.error)
      .map(([key, state]) => ({ key, error: state.error! }))

    return {
      states: selectedStates,
      isAnyLoading,
      hasAnyError,
      errors
    }
  }
}