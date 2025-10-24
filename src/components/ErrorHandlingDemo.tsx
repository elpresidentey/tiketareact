import React, { useState } from 'react'
import { ErrorDisplay } from './ErrorDisplay'
import { LoadingOverlay, ProgressBar } from './LoadingSpinner'
import { useLoadingState, useAsyncOperation } from '../hooks/useLoadingState'
import { notify } from '../utils/notifications'
import { devNetworkControls } from '../utils/networkSimulation'

// Demo component to showcase error handling features
export const ErrorHandlingDemo: React.FC = () => {
  const [showDemo, setShowDemo] = useState(false)
  const [demoError, setDemoError] = useState<string | null>(null)
  const loadingState = useLoadingState()
  const asyncOp = useAsyncOperation({
    showNotifications: true,
    timeout: 5000
  })

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const simulateError = (type: 'validation' | 'network' | 'system' | 'auth') => {
    switch (type) {
      case 'validation':
        setDemoError('Please fill in all required fields correctly.')
        break
      case 'network':
        setDemoError('Network connection failed. Please check your internet connection.')
        break
      case 'system':
        setDemoError('An unexpected system error occurred. Please try again later.')
        break
      case 'auth':
        setDemoError('Your session has expired. Please log in again.')
        break
    }
  }

  const simulateAsyncOperation = async () => {
    await asyncOp.execute(async () => {
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Randomly succeed or fail
      if (Math.random() > 0.5) {
        throw new Error('Simulated operation failure')
      }
      
      return 'Operation completed successfully'
    }, 'Demo Operation')
  }

  const simulateLoadingStates = () => {
    loadingState.startLoading('Initializing...')
    
    setTimeout(() => {
      loadingState.updateProgress(25, 'Loading data...')
    }, 500)
    
    setTimeout(() => {
      loadingState.updateProgress(50, 'Processing...')
    }, 1000)
    
    setTimeout(() => {
      loadingState.updateProgress(75, 'Finalizing...')
    }, 1500)
    
    setTimeout(() => {
      loadingState.updateProgress(100, 'Complete!')
    }, 2000)
    
    setTimeout(() => {
      loadingState.stopLoading()
    }, 2500)
  }

  const testNotifications = () => {
    notify.success('Success notification!')
    
    setTimeout(() => {
      notify.warning('Warning notification!')
    }, 1000)
    
    setTimeout(() => {
      notify.error('Error notification!')
    }, 2000)
    
    setTimeout(() => {
      notify.info('Info notification!')
    }, 3000)
  }

  const testNetworkErrors = async () => {
    try {
      await devNetworkControls.forceConnectionError()
    } catch (error) {
      setDemoError(error instanceof Error ? error.message : 'Network error occurred')
    }
  }

  if (!showDemo) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setShowDemo(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          🧪 Error Demo
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="fixed bottom-4 left-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Error Handling Demo</h3>
          <button
            onClick={() => setShowDemo(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Error Display Demo */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Error Types</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => simulateError('validation')}
                className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
              >
                Validation
              </button>
              <button
                onClick={() => simulateError('network')}
                className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
              >
                Network
              </button>
              <button
                onClick={() => simulateError('system')}
                className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
              >
                System
              </button>
              <button
                onClick={() => simulateError('auth')}
                className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
              >
                Auth
              </button>
            </div>
          </div>

          {/* Loading States Demo */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Loading States</h4>
            <div className="space-y-2">
              <button
                onClick={simulateLoadingStates}
                disabled={loadingState.isLoading}
                className="w-full px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                {loadingState.isLoading ? 'Loading...' : 'Simulate Loading'}
              </button>
              
              {loadingState.isLoading && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-600">{loadingState.stage}</div>
                  {typeof loadingState.progress === 'number' && (
                    <ProgressBar progress={loadingState.progress} showPercentage />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Async Operations Demo */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Async Operations</h4>
            <button
              onClick={simulateAsyncOperation}
              disabled={asyncOp.isLoading}
              className="w-full px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-50"
            >
              {asyncOp.isLoading ? 'Running...' : 'Test Async Op'}
            </button>
          </div>

          {/* Notifications Demo */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Notifications</h4>
            <button
              onClick={testNotifications}
              className="w-full px-3 py-1 text-xs bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200"
            >
              Test Notifications
            </button>
          </div>

          {/* Network Simulation Demo */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Network Errors</h4>
            <button
              onClick={testNetworkErrors}
              className="w-full px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
            >
              Force Network Error
            </button>
          </div>

          {/* Clear Demo Error */}
          {demoError && (
            <button
              onClick={() => setDemoError(null)}
              className="w-full px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
            >
              Clear Error
            </button>
          )}
        </div>
      </div>

      {/* Demo Error Display */}
      {demoError && (
        <div className="fixed top-20 right-4 w-80 z-50">
          <ErrorDisplay
            error={demoError}
            variant="card"
            title="Demo Error"
            onDismiss={() => setDemoError(null)}
          />
        </div>
      )}

      {/* Loading Overlay Demo */}
      <LoadingOverlay
        isVisible={asyncOp.isLoading}
        message="Running async operation..."
        stage={asyncOp.stage}
        progress={asyncOp.progress}
      />
    </>
  )
}