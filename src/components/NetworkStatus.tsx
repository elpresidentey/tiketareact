import React, { useState, useEffect } from 'react'
import { networkSimulator, getNetworkStatus } from '../utils/networkSimulation'
import { notifyOperation } from '../utils/notifications'

interface NetworkStatusProps {
  className?: string
  showDetails?: boolean
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  className = '', 
  showDetails = false 
}) => {
  const [status, setStatus] = useState(getNetworkStatus())
  const [showControls, setShowControls] = useState(false)

  useEffect(() => {
    const updateStatus = () => {
      setStatus(getNetworkStatus())
    }

    // Listen for online/offline events
    const handleOnline = () => {
      updateStatus()
      notifyOperation.onlineMode()
    }

    const handleOffline = () => {
      updateStatus()
      notifyOperation.offlineMode()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Update status periodically
    const interval = setInterval(updateStatus, 5000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  const getStatusColor = () => {
    if (!status.isOnline) return 'text-red-500'
    if (status.simulationEnabled) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getStatusText = () => {
    if (!status.isOnline) return 'Offline'
    if (status.simulationEnabled) return 'Simulation Mode'
    return 'Online'
  }

  const getStatusIcon = () => {
    if (!status.isOnline) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0 0L12 12m-6.364 6.364L12 12m6.364-6.364L12 12" />
        </svg>
      )
    }

    if (status.simulationEnabled) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    }

    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    )
  }

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowControls(!showControls)}
        className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          status.isOnline 
            ? status.simulationEnabled
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              : 'bg-green-100 text-green-800 hover:bg-green-200'
            : 'bg-red-100 text-red-800 hover:bg-red-200'
        }`}
        title="Click to toggle network controls (Development only)"
      >
        <span className={getStatusColor()}>
          {getStatusIcon()}
        </span>
        <span>{getStatusText()}</span>
        {showDetails && (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Development Controls */}
      {showControls && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Network Simulation Controls
          </h3>
          
          <div className="space-y-3">
            {/* Enable/Disable Simulation */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Simulation</span>
              <button
                onClick={() => {
                  networkSimulator.setEnabled(!status.simulationEnabled)
                  setStatus(getNetworkStatus())
                }}
                className={`px-3 py-1 rounded text-xs font-medium ${
                  status.simulationEnabled
                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {status.simulationEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>

            {status.simulationEnabled && (
              <>
                {/* Error Rate */}
                <div>
                  <label className="text-xs text-gray-600">
                    Error Rate: {Math.round(status.config.errorRate * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={status.config.errorRate}
                    onChange={(e) => {
                      networkSimulator.updateConfig({ errorRate: parseFloat(e.target.value) })
                      setStatus(getNetworkStatus())
                    }}
                    className="w-full mt-1"
                  />
                </div>

                {/* Delay Range */}
                <div>
                  <label className="text-xs text-gray-600">
                    Delay: {status.config.delayRange[0]}-{status.config.delayRange[1]}ms
                  </label>
                  <div className="flex space-x-2 mt-1">
                    <input
                      type="number"
                      min="0"
                      max="5000"
                      value={status.config.delayRange[0]}
                      onChange={(e) => {
                        const newMin = parseInt(e.target.value)
                        networkSimulator.updateConfig({ 
                          delayRange: [newMin, Math.max(newMin, status.config.delayRange[1])]
                        })
                        setStatus(getNetworkStatus())
                      }}
                      className="w-full px-2 py-1 text-xs border rounded"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      min="0"
                      max="5000"
                      value={status.config.delayRange[1]}
                      onChange={(e) => {
                        const newMax = parseInt(e.target.value)
                        networkSimulator.updateConfig({ 
                          delayRange: [Math.min(status.config.delayRange[0], newMax), newMax]
                        })
                        setStatus(getNetworkStatus())
                      }}
                      className="w-full px-2 py-1 text-xs border rounded"
                      placeholder="Max"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">Quick Presets:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        networkSimulator.updateConfig({ errorRate: 0, delayRange: [50, 200] })
                        setStatus(getNetworkStatus())
                      }}
                      className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                    >
                      Fast & Stable
                    </button>
                    <button
                      onClick={() => {
                        networkSimulator.updateConfig({ errorRate: 0.1, delayRange: [500, 2000] })
                        setStatus(getNetworkStatus())
                      }}
                      className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                    >
                      Slow Network
                    </button>
                    <button
                      onClick={() => {
                        networkSimulator.updateConfig({ errorRate: 0.3, delayRange: [100, 1000] })
                        setStatus(getNetworkStatus())
                      }}
                      className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                    >
                      Unreliable
                    </button>
                    <button
                      onClick={() => {
                        networkSimulator.updateConfig({ errorRate: 0, delayRange: [100, 1000] })
                        setStatus(getNetworkStatus())
                      }}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      Normal
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setShowControls(false)}
            className="mt-3 w-full px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}

// Simple network status indicator (just the dot)
export const NetworkStatusIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div className={`flex items-center ${className}`}>
      <div
        className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-red-500'
        }`}
        title={isOnline ? 'Online' : 'Offline'}
      />
    </div>
  )
}