import { TicketAppError, ErrorCategory, ErrorSeverity } from '../constants/errors'

// Network simulation configuration
interface NetworkConfig {
  enabled: boolean
  errorRate: number // 0-1, probability of error
  delayRange: [number, number] // [min, max] delay in ms
  timeoutRate: number // 0-1, probability of timeout
  timeoutDelay: number // ms before timeout
}

// Default network simulation settings
const defaultConfig: NetworkConfig = {
  enabled: process.env.NODE_ENV === 'development',
  errorRate: 0.1, // 10% chance of error
  delayRange: [100, 1000], // 100ms to 1s delay
  timeoutRate: 0.05, // 5% chance of timeout
  timeoutDelay: 5000 // 5s timeout
}

// Network error types
export enum NetworkErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  TIMEOUT = 'TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  RATE_LIMITED = 'RATE_LIMITED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

// Network error messages
const networkErrorMessages: Record<NetworkErrorType, string> = {
  [NetworkErrorType.CONNECTION_ERROR]: 'Unable to connect to the server. Please check your internet connection.',
  [NetworkErrorType.TIMEOUT]: 'Request timed out. Please try again.',
  [NetworkErrorType.SERVER_ERROR]: 'Server error occurred. Please try again later.',
  [NetworkErrorType.NOT_FOUND]: 'The requested resource was not found.',
  [NetworkErrorType.UNAUTHORIZED]: 'You are not authorized to perform this action.',
  [NetworkErrorType.FORBIDDEN]: 'Access to this resource is forbidden.',
  [NetworkErrorType.RATE_LIMITED]: 'Too many requests. Please wait before trying again.',
  [NetworkErrorType.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable. Please try again later.'
}

// Network simulation class
export class NetworkSimulator {
  private static instance: NetworkSimulator
  private config: NetworkConfig = { ...defaultConfig }
  private isOnline: boolean = navigator.onLine

  static getInstance(): NetworkSimulator {
    if (!NetworkSimulator.instance) {
      NetworkSimulator.instance = new NetworkSimulator()
    }
    return NetworkSimulator.instance
  }

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  // Update configuration
  updateConfig(newConfig: Partial<NetworkConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  // Get current configuration
  getConfig(): NetworkConfig {
    return { ...this.config }
  }

  // Check if simulation is enabled
  isEnabled(): boolean {
    return this.config.enabled
  }

  // Enable/disable simulation
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled
  }

  // Check if device is online
  isDeviceOnline(): boolean {
    return this.isOnline
  }

  // Simulate network delay
  private async simulateDelay(): Promise<void> {
    if (!this.config.enabled) return

    const [min, max] = this.config.delayRange
    const delay = Math.random() * (max - min) + min
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  // Generate random network error
  private generateNetworkError(): TicketAppError {
    const errorTypes = Object.values(NetworkErrorType)
    const randomType = errorTypes[Math.floor(Math.random() * errorTypes.length)]
    const message = networkErrorMessages[randomType]

    return new TicketAppError(
      message,
      randomType,
      ErrorCategory.NETWORK,
      ErrorSeverity.HIGH,
      `Simulated network error: ${randomType}`
    )
  }

  // Simulate network request
  async simulateRequest<T>(
    operation: () => Promise<T>,
    operationName: string = 'Network request'
  ): Promise<T> {
    // If simulation is disabled, just run the operation
    if (!this.config.enabled) {
      return await operation()
    }

    // Check if device is offline
    if (!this.isOnline) {
      throw new TicketAppError(
        'You are currently offline. Please check your internet connection.',
        'OFFLINE',
        ErrorCategory.NETWORK,
        ErrorSeverity.HIGH
      )
    }

    // Simulate network delay
    await this.simulateDelay()

    // Check for timeout simulation
    if (Math.random() < this.config.timeoutRate) {
      throw new Promise((_, reject) => {
        setTimeout(() => {
          reject(new TicketAppError(
            `${operationName} timed out. Please try again.`,
            NetworkErrorType.TIMEOUT,
            ErrorCategory.NETWORK,
            ErrorSeverity.MEDIUM
          ))
        }, this.config.timeoutDelay)
      })
    }

    // Check for error simulation
    if (Math.random() < this.config.errorRate) {
      throw this.generateNetworkError()
    }

    // Execute the actual operation
    try {
      return await operation()
    } catch (error) {
      // Wrap any real errors in our error system
      if (error instanceof TicketAppError) {
        throw error
      }
      
      throw new TicketAppError(
        error instanceof Error ? error.message : 'Unknown network error occurred',
        'UNKNOWN_NETWORK_ERROR',
        ErrorCategory.NETWORK,
        ErrorSeverity.MEDIUM,
        error instanceof Error ? error.stack : undefined
      )
    }
  }

  // Simulate specific error type
  async simulateSpecificError(errorType: NetworkErrorType): Promise<never> {
    await this.simulateDelay()
    
    const message = networkErrorMessages[errorType]
    throw new TicketAppError(
      message,
      errorType,
      ErrorCategory.NETWORK,
      ErrorSeverity.HIGH,
      `Forced simulation of ${errorType}`
    )
  }

  // Test network connectivity
  async testConnectivity(): Promise<boolean> {
    try {
      // Try to fetch a small resource to test connectivity
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache'
      })
      return response.ok
    } catch {
      return false
    }
  }

  // Get network status
  getNetworkStatus(): {
    isOnline: boolean
    simulationEnabled: boolean
    config: NetworkConfig
  } {
    return {
      isOnline: this.isOnline,
      simulationEnabled: this.config.enabled,
      config: { ...this.config }
    }
  }
}

// Convenience functions
export const networkSimulator = NetworkSimulator.getInstance()

// Wrapper function for simulating network operations
export const withNetworkSimulation = async <T>(
  operation: () => Promise<T>,
  operationName?: string
): Promise<T> => {
  return networkSimulator.simulateRequest(operation, operationName)
}

// Specific simulation functions for common operations
export const simulateAuthRequest = async <T>(operation: () => Promise<T>): Promise<T> => {
  return withNetworkSimulation(operation, 'Authentication request')
}

export const simulateTicketRequest = async <T>(operation: () => Promise<T>): Promise<T> => {
  return withNetworkSimulation(operation, 'Ticket operation')
}

export const simulateStorageRequest = async <T>(operation: () => Promise<T>): Promise<T> => {
  return withNetworkSimulation(operation, 'Storage operation')
}

// Network status hook helper (to be used with React hooks)
export const getNetworkStatus = () => networkSimulator.getNetworkStatus()

// Development helpers
export const devNetworkControls = {
  // Force specific errors for testing
  forceConnectionError: () => 
    networkSimulator.simulateSpecificError(NetworkErrorType.CONNECTION_ERROR),
  forceTimeout: () => 
    networkSimulator.simulateSpecificError(NetworkErrorType.TIMEOUT),
  forceServerError: () => 
    networkSimulator.simulateSpecificError(NetworkErrorType.SERVER_ERROR),
  
  // Adjust error rates for testing
  setHighErrorRate: () => 
    networkSimulator.updateConfig({ errorRate: 0.5, timeoutRate: 0.2 }),
  setLowErrorRate: () => 
    networkSimulator.updateConfig({ errorRate: 0.05, timeoutRate: 0.01 }),
  setNoErrors: () => 
    networkSimulator.updateConfig({ errorRate: 0, timeoutRate: 0 }),
  
  // Adjust delays for testing
  setFastNetwork: () => 
    networkSimulator.updateConfig({ delayRange: [10, 100] }),
  setSlowNetwork: () => 
    networkSimulator.updateConfig({ delayRange: [1000, 3000] }),
  setNormalNetwork: () => 
    networkSimulator.updateConfig({ delayRange: [100, 1000] }),
  
  // Enable/disable simulation
  enable: () => networkSimulator.setEnabled(true),
  disable: () => networkSimulator.setEnabled(false),
  
  // Get current status
  getStatus: () => networkSimulator.getNetworkStatus()
}

// Make dev controls available globally in development
if (process.env.NODE_ENV === 'development') {
  (window as any).networkControls = devNetworkControls
}