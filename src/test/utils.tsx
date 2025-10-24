import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock data for tests
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User'
}

export const mockTicket = {
  id: '1',
  title: 'Test Ticket',
  description: 'Test description',
  status: 'open' as const,
  priority: 'medium' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: '1',
  tags: ['test', 'mock']
}

export const mockTickets = [
  mockTicket,
  {
    id: '2',
    title: 'Resolved Ticket',
    description: 'Resolved ticket description',
    status: 'closed' as const,
    priority: 'high' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: '1',
    tags: ['resolved', 'high-priority']
  }
]