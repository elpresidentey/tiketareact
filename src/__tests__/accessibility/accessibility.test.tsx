import { describe, it, expect, vi } from 'vitest'
import { render } from '../../test/utils' // Use custom render with providers
import { axe, toHaveNoViolations } from 'jest-axe'
import { LoginForm } from '../../components/LoginForm'
import TicketCard from '../../components/TicketCard'
import { mockTicket } from '../../test/utils'

// Extend expect with axe matchers
expect.extend(toHaveNoViolations)

// Mock dependencies
vi.mock('../../store/authStore', () => ({
    useAuthStore: () => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
        clearError: vi.fn(),
        setLoading: vi.fn(),
    })
}))

vi.mock('../../utils/notifications', () => ({
    notifyOperation: {
        loginSuccess: vi.fn(),
        loginError: vi.fn(),
    }
}))

describe('Accessibility Tests', () => {
    it('LoginForm has no accessibility violations', async () => {
        const { container } = render(<LoginForm />)
        const results = await axe(container)
        expect(results).toHaveNoViolations()
    })

    it('TicketCard has no accessibility violations', async () => {
        const { container } = render(
            <TicketCard
                ticket={mockTicket}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onStatusChange={vi.fn()}
            />
        )
        const results = await axe(container)
        expect(results).toHaveNoViolations()
    })
})